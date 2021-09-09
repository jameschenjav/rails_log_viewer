import groupBy from 'lodash/groupBy';

import { ActionData } from './types';

type DataView = ActionData['view'][0];

export interface ViewItem extends DataView {
  key: string,
  stackId: string,
  parent: ViewItem | null,
  childCount: number,
  children: ViewItem[],
}

const updateChildCount = (items: ViewItem[]): number => {
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    item.childCount = updateChildCount(item.children);
  }
  items.sort(({ childCount: c1 }, { childCount: c2 }) => c2 - c1);
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
        parent: null,
        childCount: 0,
        children: [],
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
          const prev = previous[i].find(({ stackId }) => parentStack.startsWith(stackId));
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
