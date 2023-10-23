import csv from 'csvtojson'
import { Readable } from 'stream'
import { ReadableStream } from 'node:stream/web'

import catalogue, { Record, Titles } from './catalog'

class DataSource {
  private record: Record
  private type: Record['types'][number]
  source: Record['resources'][number]
  private data: any

  constructor(title: Titles) {
    if (!title) {
      throw new Error('`DataSource` expects a MTL data source title')
    }
    this.record = catalogue.find(c => c.title === title) as Record
    this.type = (
      this.record.types.includes('csv' as never) ? 'csv' : this.record.types[0]
    ) as Record['types'][number]
    this.source = this.record.resources[0]
    this.data = null
  }

  info() {
    return this.record
  }

  gimme() {
    return this.data
  }

  setSource(url: Record['resources'][number], force = false) {
    if (this.record.resources.includes(url as never)) this.source = url
    if (force === true) this.source = url
    return this
  }

  /**
   * Grabs the latest posted data (if available).
   *
   * This may grow out of sync with MTL's posted links unless the catalog is updated frequently.
   * To use an alternative link
   */
  async snapshot() {
    const address = this.record.resources.filter(r => r.endsWith(this.type))[0] || this.source
    if (!address) {
      throw new Error(`[DataSource - ${this.record.title}] No compatible URL`)
    }
    if (this.type === 'csv') {
      this.data = await this.parse(address)
    } else if (this.type === 'json') {
      this.data = await fetch(address).then(d => d.json())
    } else if (this.type) {
      console.log(`[DataSource - ${this.record.title}] Parsing ${this.type} files is not supported`)
    } else if (!this.type) {
      console.log(
        `[DataSource - ${this.record.title}] This data source does not offer downloadable resources`,
      )
    }
    return this
  }

  private async parse(address: string) {
    const { body } = await fetch(address)
    const readable = Readable.fromWeb(body as ReadableStream)

    const json = await csv().fromStream(readable)
    json.concat()
    return json
  }

  /** Performs a best-effort conversion of the retrieved data */
  format() {
    if (!this.data)
      throw new Error(`[DataSource - ${this.record.title}] No data, call .snapshot() first!`)
    const sample = this.data[0]
    if (sample) {
      const keys = Object.keys(sample)
      const values = Object.values(sample)
      const entries = new Map([])
      for (let i = 0; i < keys.length; i++) {
        // see https://stackoverflow.com/a/37511463
        const nkey = keys[i]
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toLowerCase()
          .replaceAll(' ', '_')

        let v = values[i] as string
        let flot = v.indexOf('-') > 1 ? v : parseFloat(v)
        // @ts-ignore
        let k = isNaN(flot) ? v : flot
        entries.set(nkey, typeof k)
      }
      const template = Object.fromEntries(entries)
      const tkeys = Object.keys(template)
      const tlength = tkeys.length
      const tvalues = Object.values(template)
      const nd = []
      for (let i = 0; i < this.data.length; i++) {
        const m = new Map([])
        const d = Object.values(this.data[i])
        for (let t = 0; t < tlength; t++) {
          m.set(keys[t], tvalues[t] === 'number' ? parseFloat(d[t] as string) : d[t])
        }
        nd.push(Object.fromEntries(m))
      }
      this.data = nd
      return this
    } else {
      return null
    }
  }

  /** Returns the best guess at the data's schema, which differs by data source */
  schema() {
    if (!this.data)
      throw new Error(`[DataSource - ${this.record.title}] No data, call .snapshot() first!`)
    const sample = this.data[0]
    if (sample) {
      const keys = Object.keys(sample)
      const values = Object.values(sample)
      const entries = new Map([])
      for (let i = 0; i < keys.length; i++) {
        entries.set(keys[i], typeof values[i])
      }
      return Object.fromEntries(entries)
    } else {
      return null
    }
  }
}

export { DataSource }
