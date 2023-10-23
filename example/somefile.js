const { DataSource } = require('mtl-data')

// Select a data source by name
const data = new DataSource('Lieux et bâtiments à vocation publique')

// retrieve information about this dataset
console.log(data.info())

async function wow () {
  // load in data
  const data2 = await new DataSource('Actes criminels').snapshot()

  // optionally use `format()` to convert strings into numbers, etc
  console.log(data2.format().gimme())

  // check `schema()` to see how the data is being interpreted
  console.log(data2.schema())
}

wow()

