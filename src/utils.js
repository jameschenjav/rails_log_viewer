export const makeUrl = ({ path, line = null }) => {
  try {
    const parts = path.split(':', 3);
    const p = line ? `${path}:${line}` : parts.slice(0, 2).join(':');
    return `vscode://file/${p}`;
  } catch (e) {
    debugger;
    return '';
  }
};

export const mapStackUrl = ({ stack, ...obj }) => ({
  ...obj,
  stack: stack.map(path => ({ path, url: makeUrl({ path }) })),
});
