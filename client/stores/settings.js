import { writable } from 'svelte/store';

const savedSettings = JSON.parse(localStorage.getItem('settings') || 'null');

const DEFAULT_SETTINGS = {
  defaultLink: 'vscode',
  enabled: {
    vscode: ['copy'],
    path_only: ['copy'],
    file_url_line: ['copy', 'link'],
  },
};

export const settings = writable(savedSettings || DEFAULT_SETTINGS);

export const linkParser = writable(null);
