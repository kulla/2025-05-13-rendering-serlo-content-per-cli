import React from "react";
import { renderToString } from "react-dom/server";
import { SerloRenderer } from "@serlo/editor";

const serloContentAsJson = {
  plugin: "row",
  state: [
    {
      plugin: "geogebra",
      state: "nnrmthf4",
    },
  ],
};

const html = renderToString(
  <SerloRenderer
    state={serloContentAsJson}
    language="de"
    editorVariant="rendering-serlo-content-per-cli-prototype"
  />,
);

console.log(html);
