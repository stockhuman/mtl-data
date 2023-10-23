# MTL API wrapper

This package provides a convenience wrapper for the extraction and consumption of [Montreal's open data](https://donnees.montreal.ca/) in Node. A large quantity of open data is served as CSV files, which aren't immediately accesible in Javascript.

This package provides type-hinting and formatting to the JSON derived using [`csv2json`](https://github.com/darwin/csv2json).

## Installation

Install the wrapper with `npm` or `yarn` as follows:

```sh
npm i mtl-data
```

```sh
yarn add mtl-data
```

It is possible that data may be out of date or inaccesible. In that case, please open a pull request having run each command in the `scrape` directory in sequence: `scrape`, `process` & `build`.

## Usage

Basic usage is described below:

```js
const { DataSource } = require('mtl-data')

// Select a data source by name
const data = new DataSource('Lieux et bâtiments à vocation publique')

// retrieve information about this dataset
console.log(data.info())

async function getData() {
  // load in data
  const data2 = await new DataSource('Actes criminels').snapshot()

  // optionally use `format()` to convert strings into numbers, etc
  console.log(data2.format().gimme())

  // check `schema()` to see how the data is being interpreted
  console.log(data2.schema())
}

getData()
```

In the event a newer URL for a particular resource is required, one may use `setSource` as follows:

```js
data.setSource(
  'https://donnees.montreal.ca/dataset/192a1447-7fdc-4e65-8e7b-eb6162656448/resource/a64d54b0-6c20-4d5d-a9b8-3593170e2a9e/download/avis_deterioration.csv',
  true,
)
// setting the second parameter to `true` will force the use of a particular URL without checking its validity.
```

Using `.format()` may corrupt or break data, as the returned keys are unknown for each of Montreal's CSV file uploads. It is advised to use `.schema()` both before and after `.format()` during development to ensure keys are being parsed correctly.

Correct behaviour will behave as such:

```js
// this real data point may be parsed as such
{
  CATEGORIE: 'Vol de véhicule à moteur',
  DATE: '2017-08-01',
  QUART: 'jour',
  PDQ: '5',
  X: '285957.555991756',
  Y: '5033790.67699391',
  LONGITUDE: '-73.740866',
  LATITUDE: '45.443794'
}

{
  categorie: 'string',
  date: 'string',
  quart: 'string',
  pdq: 'number',
  x: 'number',
  y: 'number',
  longitude: 'number',
  latitude: 'number'
}
```

### License

Montreal's data is offered under the [following license (fr)](https://donnees.montreal.ca/pages/licence-d-utilisation), which functionally adheres to the [Open Knowledge foundation's OD2.1](https://opendefinition.org/od/2.1/en/).

The wrapper itself _(`/lib/dist`)_ is available under the permissive MIT license, whereas this text, the scraper and other accompanying files are released under the _[GPLv3](./LICENSE) or later_.
