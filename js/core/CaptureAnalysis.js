/*
 * Geometry only. Meaning comes later.
 *
 * Pulling this out of Director means we can test the camera without booting a
 * renderer, and eventually distinguish "two people are in shot" from "their
 * argument is actually legible". For now it preserves the original 33% rule.
 */
(function (global) {
  "use strict";

  function boundsForProp(prop) {
    var realY = prop.y + (prop.z || 0);
    return {
      left: prop.x - prop.width / 2,
      right: prop.x + prop.width / 2,
      top: realY - prop.height,
      bottom: realY
    };
  }

  function boundsForCamera(camera) {
    return {
      left: camera.x - camera.width / 2,
      right: camera.x + camera.width / 2,
      top: camera.y - camera.height / 2,
      bottom: camera.y + camera.height / 2
    };
  }

  function overlapRatio(subject, frame) {
    var width = Math.max(0, Math.min(subject.right, frame.right) - Math.max(subject.left, frame.left));
    var height = Math.max(0, Math.min(subject.bottom, frame.bottom) - Math.max(subject.top, frame.top));
    var subjectArea = Math.max(0, subject.right - subject.left) * Math.max(0, subject.bottom - subject.top);
    return subjectArea ? (width * height) / subjectArea : 0;
  }

  function analyse(props, camera, threshold) {
    var frame = boundsForCamera(camera);
    var minimum = threshold == null ? 0.33 : threshold;
    return props.reduce(function (caught, prop) {
      var prominence = overlapRatio(boundsForProp(prop), frame);
      if (prominence > minimum) caught.push({ prop: prop, prominence: prominence });
      return caught;
    }, []);
  }

  var api = { boundsForProp: boundsForProp, boundsForCamera: boundsForCamera, overlapRatio: overlapRatio, analyse: analyse };
  global.WBWWBCaptureAnalysis = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
