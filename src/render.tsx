import { JSDOM } from "jsdom";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Simulate a DOM environment
const dom = new JSDOM("<!doctype html><html><body></body></html>");
global.window = dom.window as any;
// @ts-ignore
global.window.requestAnimationFrame = () => {};
global.document = dom.window.document;
// @ts-ignore
global.localStorage = { getItem: () => null };

class EmptyResizeObserver {}
// @ts-ignore
global.ResizeObserver = EmptyResizeObserver;

/*global.navigator = {
  userAgent: "node.js",
} as any;*/

const { SerloRenderer } = require("@serlo/editor");

const serloContentAsJson = {
  plugin: "rows",
  state: [
    {
      plugin: "geogebra",
      state: "nnrmthf4",
    },
  ],
};

const html = renderToStaticMarkup(
  <SerloRenderer
    state={serloContentAsJson}
    language="de"
    editorVariant="rendering-serlo-content-per-cli-prototype"
  />,
);

console.log(html);
