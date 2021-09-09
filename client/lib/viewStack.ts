import groupBy from 'lodash/groupBy';

import { ActionData } from './types';

type DataView = ActionData['view'][0];

export interface ViewItem extends DataView {
  key: string,
  stackId: string,
  repeated: number,
  depth: number,
  parent: ViewItem | null,
  childCount: number,
  children: ViewItem[],
  callStack: string,
}

const updateChildCount = (items: ViewItem[]): number => {
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    if (item.children.length) {
      item.childCount = updateChildCount(item.children);
      item.depth = Math.max(...item.children.map(({ depth }) => depth)) + 1;

      const grouped = groupBy(item.children, ({
        stackId, depth, children, childCount, stack,
      }) => `${stackId}:${depth}:${children.length}:${childCount}:${stack.join('\n')}`);

      if (Object.values(grouped).find((views) => views.length > 1)) {
        item.children = Object.values(grouped).map((views) => ({
          ...views[0],
          repeated: views.length > 1 ? views.length : 0,
        }));
      }
    }
  }
  items.sort(({ depth: d1, childCount: c1 }, { depth: d2, childCount: c2 }) => d2 - d1 || c2 - c1);
  return items.reduce((prev, { childCount }) => prev + childCount, items.length);
};

export const mergeViewStack = ({ view }: ActionData) => {
  const viewGroups = groupBy(
    view.map((v, idx): ViewItem => {
      const stackId = `${v.identifier.slice(2)}:`;
      return {
        ...v,
        key: `vt-${v.identifier}-${idx}`,
        stackId,
        repeated: 0,
        depth: 0,
        parent: null,
        childCount: 0,
        children: [],
        callStack: v.stack.join('\n'),
      };
    }),
    ({ stack }) => stack.length,
  );

  const [root = null, ...others] = Object.values(viewGroups);
  if (!root) return [];

  const previous = [root];
  others.forEach((views) => {
    views.forEach((v) => {
      const parentStack = v.stack.find((s) => s.startsWith('app/views/'));

      if (parentStack) {
        for (let i = previous.length - 1; i >= 0; i -= 1) {
          const prev = previous[i].find(({ stackId, callStack }) => (
            parentStack.startsWith(stackId) && v.callStack.endsWith(callStack)
          ));
          if (prev) {
            prev.children.push(v);
            // eslint-disable-next-line no-param-reassign
            v.parent = prev;
            break;
          }
        }
      }

      if (!v.parent) {
        root.push(v);
      }
    });

    previous.push(views.filter(({ parent }) => parent));
  });

  updateChildCount(root);
  return root;
};

export default mergeViewStack;
