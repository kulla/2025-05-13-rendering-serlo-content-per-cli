import { readFileSync, createWriteStream, WriteStream } from "fs";
import { PassThrough } from 'stream';
import { JSDOM } from "jsdom";
// @ts-ignore
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

// @ts-ignore
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

// Create appropriate final output stream
const finalOutputStream: WriteStream | NodeJS.WriteStream = outputToConsole ? process.stdout : createWriteStream("output.html");

// Write HTML header to final output stream
if (outputToConsole) {
  process.stdout.write(`<!DOCTYPE html><html><head><link rel="stylesheet" href="node_modules/@serlo/editor/dist/style.css"></head><body>`);
} else {
  (finalOutputStream as WriteStream).write(`<!DOCTYPE html><html><head><link rel="stylesheet" href="style.css"></head><body>`);
}

const intermediateStream = new PassThrough();
intermediateStream.pipe(finalOutputStream, { end: false }); // Pipe to final, but keep finalOutputStream open

// When intermediateStream finishes (meaning React's output is fully piped through it)
intermediateStream.on('finish', () => {
  if (outputToConsole) {
    (finalOutputStream as NodeJS.WriteStream).write(`</body></html>`);
  } else {
    (finalOutputStream as WriteStream).write(`</body></html>`);
    (finalOutputStream as WriteStream).end(); // Now close the file stream
    console.log("Rendering complete. Output has been written to 'output.html'.");
  }
});

intermediateStream.on('error', (err) => {
  console.error("Error on intermediate stream:", err);
  if (!outputToConsole && !(finalOutputStream as WriteStream).destroyed) {
    (finalOutputStream as WriteStream).write('\n<p>Error during streaming. Footer might be missing.</p></body></html>');
    (finalOutputStream as WriteStream).end();
    console.log("Rendering failed due to stream error. output.html may be incomplete.");
  } else if (outputToConsole) {
    (finalOutputStream as NodeJS.WriteStream).write('\n<p>Error during streaming. Footer might be missing.</p></body></html>');
  }
});

const { pipe } = renderToPipeableStream(
  <SerloRenderer
    state={serloContentAsJson}
    language="de"
    editorVariant="rendering-serlo-content-per-cli-prototype"
  />,
  {
    onShellReady() {
      pipe(intermediateStream); // React pipes its output here. When React is done, it calls intermediateStream.end().
    },
    onAllReady() {
      // This callback indicates React has flushed all its content.
      // The 'finish' event on intermediateStream will handle footer and closing.
    },
    onError(error) {
      console.error("An error occurred during React rendering:", error);
      if (!intermediateStream.writableEnded) {
        intermediateStream.end();
      }
      if (!outputToConsole) {
        if (!(finalOutputStream as WriteStream).destroyed) {
          (finalOutputStream as WriteStream).write('\n<p>Error during page generation. Footer might be missing.</p></body></html>');
          (finalOutputStream as WriteStream).end();
          console.log("Rendering failed due to React error. output.html may be incomplete.");
        }
      } else {
        (finalOutputStream as NodeJS.WriteStream).write('\n<p>Error during page generation. Footer might be missing.</p></body></html>');
      }
    },
  },
);

// Log for file output initiation is still relevant here
if (!outputToConsole) {
  console.log("Rendering started. Output will be written to 'output.html'.");
}
