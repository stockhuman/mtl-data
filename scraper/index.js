const {
  Scraper,
  Root,
  OpenLinks,
  CollectContent,
} = require("nodejs-web-scraper");
const fs = require("fs");
const CollectContent2 = require("./CollectContent");

(async () => {
  const config = {
    baseSiteUrl: `https://donnees.montreal.ca/en/`,
    startUrl: `https://donnees.montreal.ca/en/group/`,
    concurrency: 8,
    maxRetries: 3,
  };

  const scraper = new Scraper(config);
  const root = new Root();
  const category = new OpenLinks("section > div.flex.w-full > ul > li > a", {
    name: "category",
  });
  const article = new OpenLinks(
    "main > article > div > ul > li > div > div > div > h3 > a",
    { name: "article" }
  );

  const navcat = new CollectContent("nav.breadcrumb-read", {
    name: "category",
  });
  const title = new CollectContent("h1", { name: "title" });
  const link = new CollectContent2(); // modified for my use
  // uncomment to get descriptions
  // const desc = new CollectContent(".markdown-content", { name: "description" });

  root.addOperation(category);
  category.addOperation(article);
  article.addOperation(navcat);
  article.addOperation(title);
  article.addOperation(link);
  // uncomment to get descriptions
  // article.addOperation(desc);

  await scraper.scrape(root);

  const articles = article.getData();
  fs.writeFile("./scrape.json", JSON.stringify(articles, null, 2), () => {});
})();
