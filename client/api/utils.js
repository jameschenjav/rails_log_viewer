import each from 'lodash/each';
import map from 'lodash/map';
import isEqual from 'lodash/isEqual';
import groupBy from 'lodash/groupBy';

const RE_CONTEXT = /^(.+?):in `(.+)'$/;

export const generateStack = ({ stack, folder, partial = false }) => {
  if (folder) {
    if (partial) {
      return stack.map((msg) => {
        const m = msg.match(RE_CONTEXT);
        const path = m[1];
        return {
          path: path.startsWith('/') ? path : `${folder}/${path}`,
          display: path,
          context: m[2],
        };
      });
    }

    const chop = folder.length + 1;
    return stack.filter((msg) => msg.startsWith(folder)).map((msg) => {
      const m = msg.match(RE_CONTEXT);
      const path = m[1];
      return {
        path,
        display: path.slice(chop),
        context: m[2],
      };
    });
  }

  return stack.map((msg) => {
    const m = msg.match(RE_CONTEXT);
    const path = m[1];
    return {
      path,
      display: path,
      context: m[2],
    };
  });
};

export const groupViews = (views) => {
  views.sort((
    {
      path: p1, stack: s1, d1 = s1.length, event: e1,
    },
    {
      path: p2, stack: s2, d2 = s2.length, event: e2,
    },
  ) => {
    const d = d2 - d1;
    if (d !== 0) return d;

    const s = p1.localeCompare(p2);
    return s === 0 ? e1.localeCompare(e2) : s;
  });

  const groups = [];
  let last = {};
  views.forEach((v) => {
    const { path, event, stack } = v;
    const { path: lp, event: le, stack: ls } = last;
    if (path === lp && event === le && isEqual(stack, ls)) {
      last.time += v.time;
      last.count += 1;
      return;
    }

    last = v;
    last.count = 1;
    groups.push(last);
  });

  return groups;
};

const stackSize = ({ stack }) => stack.length;

const groupSql = (records) => {
  const groups = {};
  records.forEach((rec) => {
    const {
      binds,
      name,
      sql,
      stack,
    } = rec;
    const key = `${name}:${sql}`;
    let group = groups[key];
    if (!group) {
      group = [];
      groups[key] = group;
      return;
    }

    const cmp = [binds, stack];
    const g = group.find(({ binds: b, stack: s }) => isEqual([b, s], cmp));
    if (g) {
      g.count += 1;
      g.time += rec.time;
    } else {
      group.push({ ...rec, count: 1 });
    }
  });
  return Object.values(groups).flat();
};

export const groupModels = ({ models, sql }) => {
  const items = [];
  each(models, ({ event, records }, model) => {
    records.sort(({ stack: s1, record_count: c1 }, { stack: s2, record_count: c2 }) => {
      let c = c1 - c2;
      if (c !== 0) return c;

      const len = s1.length;
      c = s2.length - len;
      for (let i = 0; c === 0 && i < len; i += 1) {
        c = s1[i].localeCompare(s2[i]);
      }
      return c;
    });

    const groups = [];
    let last = {};
    records.forEach(({ record_count: recordCount, stack, time }) => {
      const { recordCount: lrc, stack: ls } = last;
      if (recordCount === lrc && isEqual(stack, ls)) {
        last.time += time;
        last.count += 1;
        return;
      }

      last = {
        recordCount,
        stack,
        time,
        count: 1,
        sql: [],
      };
      items.push(last);
      groups.push(last);
    });

    // eslint-disable-next-line no-param-reassign
    models[model] = {
      model,
      event,
      groups,
    };
  });

  const gs = groupBy(items, stackSize);
  const raw = map(groupBy(sql, stackSize), (records, size) => {
    const ms = gs[size];
    if (!ms) {
      return groupSql(records);
    }

    return groupSql(records.map((sqlRecord) => {
      const { stack: sqlStack, ...sqlRec } = sqlRecord;
      const group = ms.find(({ stack }) => isEqual(stack, sqlStack));
      if (!group) return sqlRecord;

      const cmp = [sqlRecord.name, sqlRecord.sql, sqlRecord.binds];
      const g = group.sql.find(({ name: sn, sql: ss, binds }) => isEqual([sn, ss, binds], cmp));
      if (g) {
        g.count += 1;
        g.time += sqlRecord.time;
      } else {
        group.sql.push({ ...sqlRec, count: 1 });
      }
      return null;
    }).filter((x) => x));
  }).flat().filter((x) => x);

  const records = Object.values(models).map(({ model, groups }) => ({
    model,
    groups,
    time: groups.reduce((t, { time }) => t + time, 0),
    count: groups.reduce((t, { count }) => t + count, 0),
    recordCount: groups.reduce((t, { recordCount }) => t + recordCount, 0),
    sqlCount: groups.reduce((t, { sql: recs }) => t + recs.length, 0),
  }));

  return {
    raw,
    models: records,
  };
};
