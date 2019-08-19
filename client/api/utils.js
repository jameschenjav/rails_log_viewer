const tmp = document.getElementById('tmp');

export const copy = (text) => {
  tmp.value = text;
  tmp.focus();
  tmp.select();
  document.execCommand('copy');
};

export const copyJsonToClipboard = (json) => {
  copy(JSON.stringify(json, null, '\t'));
};

export class PathLinkGenerator {
  constructor(basePath, mapBase) {
    this.basePath = basePath.endsWith('/') ? basePath.slice(0, basePath.length - 1) : basePath;
    const mb = mapBase || this.basePath;
    this.mapBase = mb.endsWith('/') ? mb : `${mb}/`;
  }

  parse(str) {
    const [, rawPath = str, line = ''] = str.match(/^(.+?):(\d+)\b/) || [];
    if (rawPath.startsWith('/')) {
      if (rawPath.startsWith(this.basePath)) {
        return this.buildPath({ short: rawPath.slice(this.basePath.length + 1), line });
      }
      return this.buildPath({ full: rawPath, line });
    }
    return this.buildPath({ short: rawPath, line });
  }

  buildPath({ short, full, line }) {
    if (full) {
      return {
        path: full,
        text: line ? `${full}:${line}` : full,
        line,
      };
    }

    return {
      path: `${this.mapBase}${short}`,
      text: line ? `${short}:${line}` : short,
      line,
    };
  }
}

export const logMaps = new WeakMap();

export const vscodeLinker = ({ text, path, line }, scheme = 'vscode') => ({
  text,
  path,
  link: line
    ? `${scheme}://file/${encodeURI(path)}:${line}`
    : `${scheme}://file/${encodeURI(path)}`,
});
