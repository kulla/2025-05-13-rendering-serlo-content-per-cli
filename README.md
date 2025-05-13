# 2025-05-13-rendering-serlo-content-per-cli

## Setup && Execution

1. Clone repository
2. Run `npm install`
3. Run `npm run build` to build `src/render.tsx` to `dist/render.js`
4. Run `npm run execute:script` to execute `dist/render.js` with Node.js

One can also run `npm run execute` to combine the `build` and `execute:script` commands. This will build the script and execute it in one command.

After executing the script the rendered HTML can be found at `output.html` in the root directory of the repository.

## ToDos

- `output.html` is actually not a valid HTML file. It only contains the body of the HTML file.
- The CSS for the serlo editor needs to be added as well (see `node_modules/@serlo/editor/dist/style.css`).
- `hydrateRoot()` needs to be called in the browser to make the editor interactive (see https://18.react.dev/reference/react-dom/server/renderToPipeableStream#rendering-a-react-tree-as-html-to-a-nodejs-stream)
