const fs = require('fs')

fs.readFile('./processed.json', 'utf8', (err, data) => {
  if (err) {
    throw new Error(`Error reading file from disk: ${err}`)
  } else {
    const processed = `
      const catalogue = ${data.replace(/(\r\n|\n|\r)/gm, '')} as const

      export type Titles = typeof catalogue[number]['title']
      export type Record = typeof catalogue[number]

      export default catalogue
    `

    // Note: default command runs prettier after this step
    fs.writeFile('../lib/src/catalog.ts', processed, 'utf8', err => {
      if (err) {
        throw new Error(`Error writing file: ${err}`)
      } else {
        console.log(`File is written successfully!`)
      }
    })
  }
})
