const fs = require("fs");

const processed = [];

fs.readFile("./scrape.json", "utf8", (err, data) => {
  if (err) {
    console.log(`Error reading file from disk: ${err}`);
  } else {
    const scrape = JSON.parse(data);

    // print all databases
    scrape.forEach((item) => {
      processed.push({
        address: item.address,
        category: item.data[0].data[0],
        title: item.data[1].data[0],
        resources: item.data[2].data,
        types: Array.from(
          new Set(item.data[2].data.map((el) => el.split(".").pop()))
        ).filter((arr) => {
          // there's some garbage in
          switch (arr) {
            case "csv":
            case "zip":
            case "geojson":
            case "gpkg":
            case "json":
            case "xlsx":
            case "kml":
            case "pdf":
            case "docx":
              return true;
            default:
              return false;
          }
        }),
      });
    });

    fs.writeFile(
      "./processed.json",
      JSON.stringify(processed, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.log(`Error writing file: ${err}`);
        } else {
          console.log(`File is written successfully!`);
        }
      }
    );
  }
});
