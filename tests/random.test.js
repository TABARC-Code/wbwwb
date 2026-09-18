"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Random = require("../js/core/Random.js");

test("the same seed reproduces the same simulation stream", () => {
  const first = new Random("paper-tiger");
  const second = new Random("paper-tiger");
  assert.deepEqual(
    Array.from({ length: 20 }, () => first.next()),
    Array.from({ length: 20 }, () => second.next())
  );
});

test("shuffle is deterministic and retains every item", () => {
  const first = new Random("news-cycle").shuffle([1, 2, 3, 4, 5, 6]);
  const second = new Random("news-cycle").shuffle([1, 2, 3, 4, 5, 6]);
  assert.deepEqual(first, second);
  assert.deepEqual(first.slice().sort(), [1, 2, 3, 4, 5, 6]);
});
