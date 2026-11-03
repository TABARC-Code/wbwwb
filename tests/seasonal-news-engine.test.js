const test = require("node:test");
const assert = require("node:assert/strict");
const news = require("../js/game/SeasonalNewsEngine.js");

test("seasonal news keeps neutral and two distorted versions together", () => {
  const story = news.create({ event: "christmas", meteorologicalSeason: "winter" }, "en");
  assert.equal(story.neutral, "CHRISTMAS SHOPPING BEGINS");
  assert.notEqual(story.left, story.right);
});

test("every supported language has the complete seasonal catalogue", () => {
  for (const locale of ["en", "de", "es", "pt", "tr", "fa"]) {
    assert.equal(Object.keys(news.catalogue[locale]).length, 7);
    assert.equal(news.catalogue[locale].summer.length, 3);
  }
});
