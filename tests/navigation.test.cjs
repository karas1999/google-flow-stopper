const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { runInNewContext } = require("node:vm");

const source = readFileSync(join(__dirname, "../content.js"), "utf8");

function page(url = "https://labs.google/fx/tools/flow") {
  let listener;
  const location = new URL(url);
  runInNewContext(source, {
    window: { navigation: { addEventListener(type, callback) {
      assert.equal(type, "navigate");
      listener = callback;
    } } },
    location,
    URL,
  });
  return { location, navigate(url, cancelable = true) {
    let blocked = false;
    listener({ destination: { url }, cancelable, preventDefault() { blocked = true; } });
    return blocked;
  } };
}

test("cancels migration while allowing project, login and unrelated navigation", () => {
  const flow = page();
  assert.equal(flow.navigate("https://flow.google.com/"), true);
  assert.equal(flow.navigate("https://flow.google.com/unsupported-country"), true);
  for (const url of [
    "https://labs.google/fx/tools/flow/project/example",
    "https://accounts.google.com/",
    "https://flow.google.com.example.org/",
    "https://example.org/?next=https://flow.google.com/",
  ]) assert.equal(flow.navigate(url), false);
});

test("respects noncancelable navigations", () => {
  assert.equal(page().navigate("https://flow.google.com/", false), false);
});

test("supports localized Flow routes and project pages", () => {
  for (const path of ["/fx/zh-CN/tools/flow", "/fx/tools/flow/project/example"])
    assert.equal(page(`https://labs.google${path}`).navigate("https://flow.google.com/"), true);
});

test("stops blocking after a same-document navigation leaves Flow", () => {
  const flow = page();
  flow.location.pathname = "/fx/tools/whisk";
  assert.equal(flow.navigate("https://flow.google.com/"), false);
  flow.location.pathname = "/fx/tools/flow-other";
  assert.equal(flow.navigate("https://flow.google.com/"), false);
});

test("is harmless when Navigation API is unavailable", () => {
  assert.doesNotThrow(() => runInNewContext(source, { window: {} }));
});
