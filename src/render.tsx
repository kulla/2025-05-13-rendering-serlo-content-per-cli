import { readFileSync, createWriteStream } from "fs";
import { JSDOM } from "jsdom";
import React from "react";
import { renderToPipeableStream } from "react-dom/server";

// Simulate a DOM environment
const dom = new JSDOM("<!doctype html><html><body></body></html>");
global.window = dom.window as any;
// @ts-ignore
global.window.requestAnimationFrame = () => { };
global.document = dom.window.document;
// @ts-ignore
global.localStorage = { getItem: () => null };

class EmptyResizeObserver { }
// @ts-ignore
global.ResizeObserver = EmptyResizeObserver;

const { SerloRenderer } = await import("@serlo/editor");

// Parse command line arguments
const args = process.argv.slice(2);
const outputToConsole = args.includes("--stdout");
const filePath = args.find(arg => !arg.startsWith("--"));

if (!filePath) {
  console.error("Please provide the path to the JSON file.");
  process.exit(1);
}

const jsonString = readFileSync(filePath, "utf-8");
const serloContentAsJson = JSON.parse(jsonString);

// Create appropriate output stream
const outputStream = outputToConsole ? process.stdout : createWriteStream("output.html");

const { pipe } = renderToPipeableStream(
  <SerloRenderer
    state={serloContentAsJson}
    language="de"
    editorVariant="rendering-serlo-content-per-cli-prototype"
  />,
  {
    onShellReady() {
      // Pipe the stream to the appropriate output
      pipe(outputStream);
    },
    onError(error) {
      console.error("An error occurred during rendering:", error);
    },
  },
);

if (!outputToConsole) {
  console.log("Rendering started. Output will be written to 'output.html'.");
}
