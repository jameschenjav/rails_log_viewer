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
