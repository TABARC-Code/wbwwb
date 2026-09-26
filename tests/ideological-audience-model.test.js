const test = require("node:test");
const assert = require("node:assert/strict");
const Model = require("../js/game/IdeologicalAudienceModel.js");

test("one-sided news agitates only people already pulled towards that outlet", () => {
  const left = { ideology: { lean: -0.5, preference: -2, agitation: 0 } };
  const right = { ideology: { lean: 0.5, preference: 2, agitation: 0 } };
  const scene = { world: { peeps: [left, right] } };
  new Model().receiveNews(scene, { id: "mascot-row", targetSide: "right", agitation: 0.8 });
  assert.equal(left.ideology.agitation, 0);
  assert.ok(right.ideology.agitation > 0.7);
  assert.ok(right.ideology.lean > 0.5);
});

test("agitated partisans pull nearby basic people away from the middle", () => {
  const source = { x: 0, y: 0, ideology: { lean: 1, preference: 2, agitation: 1 } };
  const near = { x: 10, y: 0 };
  const far = { x: 500, y: 0 };
  const scene = { world: { peeps: [source, near, far] } };
  new Model({ radius: 100 }).spread(scene);
  assert.ok(near.persuasion.lean > 0);
  assert.equal(far.persuasion, undefined);
  assert.ok(source.ideology.lean > 1);
});
