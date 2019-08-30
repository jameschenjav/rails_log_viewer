export { default as PathLinkParser } from './PathLinkParser';

const tmp = document.getElementById('tmp');

export const copyToClipboard = (text) => {
  tmp.value = text;
  tmp.focus();
  tmp.select();
  document.execCommand('copy');
};

export const copyJsonToClipboard = (json) => {
  copyToClipboard(JSON.stringify(json, null, '\t'));
};

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
    icon: 'vscode',
    url: true,
  },
  vscodium: {
    title: 'VSCodium',
    gen: (link) => vscodeLinker(link, 'vscodium'),
    icon: 'vscodium',
    url: true,
  },
  vscode_insiders: {
    title: 'VSCode Insiders',
    gen: (link) => vscodeLinker(link, 'vscode-insiders'),
    icon: 'vscodeInsiders',
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

export const generateLink = (data, { defaultAction, enabled }) => {
  const [maker, action] = (defaultAction || '').split('.');
  const defaultMaker = LINK_MAKERS[maker];
  const extra = { copy: [], open: [] };
  Object.entries(enabled).forEach(([key, options]) => {
    const {
      icon, abbr, title,
      gen,
    } = LINK_MAKERS[key];
    const item = {
      icon,
      abbr,
      title,
      link: gen(data),
    };
    options.forEach((subject) => {
      extra[subject].push(item);
    });
  });
  return {
    ...data,
    title: data.path,
    icon: defaultMaker?.icon,
    abbr: defaultMaker?.abbr,
    link: defaultMaker?.gen(data),
    action,
    extra,
  };
};

export const uniq = (items) => [...(new Set(items))];
