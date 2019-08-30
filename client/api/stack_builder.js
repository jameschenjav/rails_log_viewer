export const splitLine = (str) => {
  const [, path = str, lineNo = '', others = ''] = str.match(/^([^:]+)(?::(\d+)\b:?(.*))?$/) || [];
  return [path, lineNo, others];
};

const getPath = (map, path) => {
  if (!(path in map)) {
    // eslint-disable-next-line no-param-reassign
    map[path] = {
      path, lines: {}, through: new Set(), frames: {},
    };
  }
  return map[path];
};

export const mergeStack = (viewStack, linkParser) => {
  const pathMap = {};
  const $root = {};
  const lineMapTo = { $root };
  const lineMapFrom = { $root };
  const otherMap = {};
  [...viewStack]
    .sort((
      { stack: s1, l1 = s1.length, started: t1 },
      { stack: s2, l2 = s2.length, started: t2 },
    ) => (l1 === l2 ? t1.localeCompare(t2) : l2 - l1))
    .forEach((frame) => {
      const { stack, identifier } = frame;
      const curLineId = stack.map(splitLine).reverse()
        .reduce((parentLineId, [path, line, others], depth) => {
          const lineId = `${depth}@${path}:${line}`;
          if (!(lineId in lineMapTo)) { lineMapTo[lineId] = {}; }
          if (!(lineId in lineMapFrom)) { lineMapFrom[lineId] = new Set(); }

          if (!(lineId in otherMap)) { otherMap[lineId] = new Set(); }
          otherMap[lineId].add(others.replace(/[_\d]+('?)$/, '$1'));

          const lineFrom = lineMapTo[parentLineId];
          lineFrom[lineId] = (lineFrom[lineId] || 0) + 1;
          lineMapFrom[lineId].add(parentLineId);

          const p = getPath(pathMap, path);
          const lineCall = `${depth}@${line}`;
          p.lines[lineCall] = (p.lines[lineCall] || 0) + 1;
          p.through.add(parentLineId);

          return lineId;
        }, '$root');

      // ORM
      if (!identifier) {
        const [, p] = curLineId.split(/[@:]/g);
        const pp = pathMap[p];
        if (!(curLineId in pp.frames)) { pp.frames[curLineId] = []; }
        pp.frames[curLineId].push(frame);
        return;
      }

      const curPath = linkParser.shortenPath(identifier);
      const pp = getPath(pathMap, curPath);
      const lineCall = `${stack.length}@`;
      pp.lines[lineCall] = (pp.lines[lineCall] || 0) + 1;
      pp.through.add(curLineId);

      if (!(curLineId in pp.frames)) { pp.frames[curLineId] = []; }
      pp.frames[curLineId].push(frame);

      const lineFrom = lineMapTo[curLineId];
      lineFrom[curPath] = (lineFrom[curPath] || 0) + 1;
    });

  delete lineMapTo.$root;
  delete lineMapFrom.$root;
  const root = Object.keys($root);
  root.forEach((key) => {
    lineMapFrom[key]?.delete('$root');
  });

  return {
    root, pathMap, lineMapFrom, lineMapTo, otherMap,
  };
};
