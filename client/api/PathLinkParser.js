import { splitLine, mergeStack } from './stack_builder';

export default class PathLinkParser {
  constructor(basePath, mapBase) {
    this.basePath = basePath.endsWith('/') ? basePath : `${basePath}/`;
    const mb = mapBase || this.basePath;
    this.mapBase = mb.endsWith('/') ? mb : `${mb}/`;
  }

  parse(str) {
    const [rawPath, line, others] = splitLine(str);
    if (rawPath.startsWith('/')) {
      const { basePath } = this;
      if (rawPath.startsWith(basePath)) {
        return this.buildPath({ short: rawPath.slice(this.basePath.length), line, others });
      }
      return this.buildPath({ full: rawPath, line, others });
    }
    return this.buildPath({ short: rawPath, line, others });
  }

  shortenPath(rawPath) {
    const { basePath } = this;
    return rawPath.startsWith(basePath) ? rawPath.slice(basePath.length) : rawPath;
  }

  buildViewStack(view) {
    return mergeStack(view, this);
  }

  buildPath({
    short, full, line, others,
  }) {
    const extraInfo = others ? others.trim() : '';
    if (full) {
      return {
        path: full,
        text: line ? `${full}:${line}` : full,
        isChild: false,
        extraInfo,
        line,
      };
    }

    return {
      path: `${this.mapBase}${short}`,
      text: line ? `${short}:${line}` : short,
      isChild: true,
      extraInfo,
      line,
    };
  }
}
