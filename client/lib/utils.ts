import isPlainObject from 'lodash/isPlainObject';
import camelCase from 'lodash/camelCase';
import snakeCase from 'lodash/snakeCase';

export const toSnakeCaseKeys = <T> (x: T): T => {
  if (Array.isArray(x)) {
    return (x as T[]).map(toSnakeCaseKeys) as unknown as T;
  }

  if (isPlainObject(x)) {
    return Object.fromEntries(
      Object.entries(x).map(([k, v]) => [snakeCase(k), toSnakeCaseKeys(v)]),
    ) as unknown as T;
  }

  return x;
};

export const toCamelCaseKeys = <T> (x: T): T => {
  if (Array.isArray(x)) {
    return (x as T[]).map(toCamelCaseKeys) as unknown as T;
  }

  if (isPlainObject(x)) {
    return Object.fromEntries(
      Object.entries(x).map(([k, v]) => [camelCase(k), toCamelCaseKeys(v)]),
    ) as unknown as T;
  }

  return x;
};

export const formatDuration = (span: number): string => (
  span && span > 1000 ? `${(span / 1000).toFixed(2)}s` : `${(span || 0).toFixed(0)}ms`
);

export const getDurationColor = (dur: number): string => {
  if (dur < 200) return 'text-green-800';
  if (dur > 10000) return 'text-red-500';
  if (dur > 2000) return 'text-red-600';
  if (dur > 1200) return 'text-red-700';
  if (dur > 800) return 'text-red-800';
  return 'text-blue-800';
};

export const getDuration = (started: string, finished: string): number => {
  const tmBeg = new Date(started);
  const tmEnd = new Date(finished);
  return tmEnd.getTime() - tmBeg.getTime();
};

export const formatTime = (timestamp: string): string => {
  const time = new Date(timestamp);
  return `${time.toLocaleDateString()} ${time.toLocaleTimeString()}`;
};

export const getStatusColor = (status: number): string => {
  if (status < 300) return 'text-green-500';
  if (status < 400) return 'text-yellow-600';
  if (status < 500) return 'text-red-600';
  return 'text-red-500';
};
