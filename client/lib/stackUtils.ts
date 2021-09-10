import groupBy from 'lodash/groupBy';

import { ActionData, DataOrmAr, DataOrmSql } from './types';

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

export const mergeViewStack = ({ view }: ActionData): ViewItem[] => {
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

interface OrmItemExtraBase {
  key: string,
  callStack: string,
  repeated: number,
}

export type OrmItemAr = OrdItemExtraAr & DataOrmAr;

export type OrmItemSql = OrdItemExtraSql & DataOrmSql;

interface OrdItemExtraAr extends OrmItemExtraBase {
  isSql: false,
  children: OrmItemSql[],
}

interface OrdItemExtraSql extends OrmItemExtraBase {
  isSql: true,
  activeRecord: OrmItemAr | null,
}

export type OrmItem = OrmItemAr | OrmItemSql;

interface ExtraBaseParams {
  key: string,
  callStack: string,
}

const buildSqlItem = (orm: DataOrmSql, { key, callStack }: ExtraBaseParams): OrmItemSql => ({
  key,
  repeated: 0,
  ...orm,
  isSql: true,
  activeRecord: null,
  callStack,
});

const buildArItem = (orm: DataOrmAr, { key, callStack }: ExtraBaseParams): OrmItemAr => ({
  key,
  repeated: 0,
  ...orm,
  isSql: false,
  children: [],
  callStack,
});

interface OrmStatistics {
  models: { model: string, items: OrmItemAr[] }[],
  sqlItems: OrmItemSql[],
  allItems: OrmItem[],
}

export const mergeOrmStack = ({ aid, orm: ormList }: ActionData): OrmStatistics => {
  const r: OrmStatistics = { models: [], sqlItems: [], allItems: [] };
  if (!ormList.length) return r;

  const items = r.allItems;
  ormList.forEach((orm, idx) => {
    const params = {
      key: `oi-${aid}-${idx + 1}`,
      callStack: orm.stack.join('\n'),
    };

    const rec = ('sql' in orm) ? buildSqlItem(orm, params) : buildArItem(orm, params);
    let last = items.at(-1);
    // if (idx === 335) debugger;
    while (last && last.callStack === rec.callStack) {
      // ar -> sql
      if (!last.isSql && rec.isSql) break;

      if (last.isSql && rec.isSql) {
        // sql -> sql
        last.repeated = (last.repeated || 1) + (rec.repeated || 1);
        last.finished = rec.finished;
        return;
      }

      if (!last.isSql && !rec.isSql) {
        if (last.className !== rec.className || last.recordCount !== rec.recordCount) break;
        // ar -> ar
        if (rec.children) {
          for (let i = 0; i < rec.children.length; i += 1) {
            rec.children[i].activeRecord = last;
          }
          last.children.push(...rec.children);
        }
        last.repeated = (last.repeated || 1) + (rec.repeated || 1);
        last.finished = rec.finished;
        return;
      }

      if (last.isSql && !rec.isSql) {
        // sql -> ar
        items.pop();
        rec.children.push(last);
        last.activeRecord = rec;
        last = items.at(-1);
      }
    }

    items.push(rec);
  });

  const modelItems: OrmItemAr[] = [];
  items.forEach((item) => {
    if (item.isSql) {
      r.sqlItems.push(item);
    } else {
      modelItems.push(item);
    }
  });

  r.models = Object.entries(groupBy(modelItems, 'className'))
    .map(([model, arItems]) => ({ model, items: arItems }))
    .sort(({ model: m1 }, { model: m2 }) => m1.localeCompare(m2));

  return r;
};
