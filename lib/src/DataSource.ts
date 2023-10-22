import { parse } from 'csv-parse'

import fs from 'fs'
import { Readable } from 'stream'
import { finished } from 'stream/promises'

import catalogue, { Record } from './catalog'
import { ReadableStream } from 'node:stream/web'

class DataSource {
  record: Record
  type: Record['types'][number]
  source!: Record['resources'][number]

  constructor(title: (typeof catalogue)[number]['title']) {
    if (!title) {
      throw new Error('`DataSource` expects a MTL data source title')
    }
    this.record = catalogue.find(c => c.title === title) as Record
    this.type = this.record.types.includes('csv') ? 'csv' : this.record.types[0]
  }

  get() {
    return this.record
  }

  setSource(url: Record['resources'][number]) {
    if (this.record.resources.includes(url)) this.source = url
    return this
  }

  async snapshot() {
    if (this.type) {
      const address =
        this.record.resources.filter(r => r.endsWith(this.type))[0] || this.record.resources[0]
      if (!address) {
        throw new Error(`[DataSource - ${this.record.title}] No compatible URL`)
      } else {
        await this.parse(address)
      }
    } else {
      console.log(
        `[DataSource - ${this.record.title}] This data source does not offer downloadable resources`,
      )
    }
  }

  private async parse(address: string) {
    const { body } = await fetch(address)
    await finished(Readable.fromWeb(body as ReadableStream)).then(console.log)
  }
}

export { DataSource }
