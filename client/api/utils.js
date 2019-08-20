import iconVSCode from '../assets/vscode.svg';
import iconVSCodium from '../assets/vscodium.svg';
import iconVSCodeInsiders from '../assets/vscode-insiders.svg';

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

export const vscodeLinker = ({ path, line }, scheme = 'vscode') => (
  line
    ? `${scheme}://file/${encodeURI(path)}:${line}`
    : `${scheme}://file/${encodeURI(path)}`
);

export const LINK_MAKERS = {
  vscode: {
    title: 'VSCode',
    gen: (link) => vscodeLinker(link, 'vscode'),
    icon: iconVSCode,
    url: true,
  },
  vscodium: {
    title: 'VSCodium',
    gen: (link) => vscodeLinker(link, 'vscodium'),
    icon: iconVSCodium,
    url: true,
  },
  vscode_insiders: {
    title: 'VSCode Insiders',
    gen: (link) => vscodeLinker(link, 'vscode-insiders'),
    icon: iconVSCodeInsiders,
    url: true,
  },
  path_only: {
    title: 'Path Only',
    gen: ({ path }) => path,
    abbr: 'PO',
    url: false,
  },
  path_line: {
    title: 'Path with line-no',
    gen: ({ path, line }) => (line ? `${path}:${line}` : path),
    abbr: 'PL',
    url: false,
  },
  file_url: {
    title: 'URL path-only',
    gen: ({ path }) => `file://${path}`,
    abbr: 'UP',
    url: true,
  },
  file_url_line: {
    title: 'URL with line-no',
    gen: ({ path, line }) => `file://${line ? `${path}:${line}` : path}`,
    abbr: 'UL',
    url: true,
  },
};

export const linkGenerator = (pathLinkGen) => {
  const { gen, title, icon } = LINK_MAKERS.vscode;
  return (path) => {
    const data = pathLinkGen.parse(path);
    return {
      ...data,
      title,
      icon,
      link: gen(data),
    };
  };
};
