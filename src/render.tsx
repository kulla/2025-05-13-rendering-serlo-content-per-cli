import React from "react";
import { renderToString } from "react-dom/server";

const html = renderToString(<h1>Hello world</h1>);

console.log(html);
