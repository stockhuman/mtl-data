const Operation = require("nodejs-web-scraper/operations/Operation");
var cheerio = require("cheerio");

class CollectContent2 extends Operation {
  constructor(querySelector, config) {
    super(config);
    this.querySelector = querySelector;
  }

  validateOperationArguments() {}

  /**
   *
   * @param {{url:string,html:string}} params
   * @return {Promise<{type:string,name:string,data:[]}>}
   */
  async scrape({ html, url }) {
    var $ = cheerio.load(html);

    const downloadLinks = $("a[download]");
    const links = [];

    // Iterate over the selected links and print their href attributes
    downloadLinks.each((index, element) => {
      links.push($(element).attr("href"));
    });

    this.data.push(...links)

    return {
      type: this.constructor.name,
      name: "links",
      data: links,
    };
  }
}

module.exports = CollectContent2;
