import { writable } from 'svelte/store';

const savedSettings = JSON.parse(localStorage.getItem('settings') || 'null');

export const getDefaultSettings = () => ({
  defaultAction: 'vscode.open',
  enabled: {
    vscode: ['copy'],
    path_only: ['copy'],
    file_url: ['open'],
  },
});

export const settings = writable(savedSettings || getDefaultSettings());

export const linkParser = writable(null);
