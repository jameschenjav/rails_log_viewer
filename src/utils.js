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

const RE_CONTEXT = /^(.+?):in `(.+)'$/;

export const generateStack = ({ stack, folder, partial = false }) => {
  if (folder) {
    if (partial) {
      return stack.map((msg) => {
        const m = msg.match(RE_CONTEXT);
        const path = m[1];
        return {
          path: path.startsWith('/') ? path : `${folder}/${path}`,
          display: path,
          context: m[2],
        };
      });
    }

    const chop = folder.length + 1;
    return stack.filter(msg => msg.startsWith(folder)).map((msg) => {
      const m = msg.match(RE_CONTEXT);
      const path = m[1];
      return {
        path,
        display: path.slice(chop),
        context: m[2],
      };
    });
  }

  return stack.map((msg) => {
    const m = msg.match(RE_CONTEXT);
    const path = m[1];
    return {
      path,
      display: path,
      context: m[2],
    };
  });
};
