import isPlainObject from 'lodash/isPlainObject';
import camelCase from 'lodash/camelCase';
import snakeCase from 'lodash/snakeCase';

export const toSnakeCaseKeys = <T> (x: T): T => {
  if (Array.isArray(x)) {
    return (x as unknown[]).map(toSnakeCaseKeys) as T;
  }

  if (isPlainObject(x)) {
    return Object.fromEntries(
      Object.entries(x as Object).map(([k, v]) => [snakeCase(k), toSnakeCaseKeys(v)]),
    ) as unknown as T;
  }

  return x;
};

export const toCamelCaseKeys = <T> (x: T): T => {
  if (Array.isArray(x)) {
    return (x as unknown[]).map(toCamelCaseKeys) as T;
  }

  if (isPlainObject(x)) {
    return Object.fromEntries(
      Object.entries(x as Object).map(([k, v]) => [camelCase(k), toCamelCaseKeys(v)]),
    ) as unknown as T;
  }

  return x;
};

export const formatDuration = (span: number): string => {
  const ms = span || 0;
  if (ms > 1000) return `${(ms / 1000).toFixed(2)}s`;
  if (ms > 100) return `${(ms).toFixed(0)}ms`;
  if (ms > 10) return `${(ms).toFixed(1)}ms`;
  return `${(ms).toFixed(2)}ms`;
};

export const getDurationColor = (dur: number): string => {
  if (dur < 200) return 'text-green-800';
  if (dur > 10000) return 'text-red-500';
  if (dur > 2000) return 'text-red-600';
  if (dur > 1200) return 'text-red-700';
  if (dur > 800) return 'text-red-800';
  return 'text-blue-800';
};

export const getDuration = (started: number, finished: number): number => (
  finished - started
);

export const formatTime = (timestamp: number): string => {
  const time = new Date(timestamp);
  return `${time.toLocaleDateString()} ${time.toLocaleTimeString()}`;
};

export const getStatusColor = (status: number): string => {
  if (status < 300) return 'text-green-500';
  if (status < 400) return 'text-yellow-600';
  if (status < 500) return 'text-red-600';
  return 'text-red-500';
};
