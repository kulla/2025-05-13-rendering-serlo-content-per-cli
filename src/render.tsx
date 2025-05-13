import { readFileSync, createWriteStream } from "fs";
import { JSDOM } from "jsdom";
import React from "react";
import { renderToPipeableStream } from "react-dom/server";

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

const { SerloRenderer } = require("@serlo/editor");

const filePath = process.argv[2];

if (!filePath) {
  console.error("Please provide the path to the JSON file.");
  process.exit(1);
}

const jsonString = readFileSync(filePath, "utf-8");
const serloContentAsJson = JSON.parse(jsonString);

const writableStream = createWriteStream("output.html");

const { pipe } = renderToPipeableStream(
  <SerloRenderer
    state={serloContentAsJson}
    language="de"
    editorVariant="rendering-serlo-content-per-cli-prototype"
  />,
  {
    onShellReady() {
      // Pipe the stream to the writable stream when ready
      pipe(writableStream);
    },
    onError(error) {
      console.error("An error occurred during rendering:", error);
    },
  },
);

console.log("Rendering started. Output will be written to 'output.html'.");
