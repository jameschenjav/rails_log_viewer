import React, { useMemo, useState } from 'react';
import sum from 'lodash/sum';

import { OrmItemAr } from '../../lib/stackUtils';
import ArItem from './ArItem';
import { formatDuration, getDuration } from '../../lib/utils';

interface ActiveRecordModelProps {
  model: string,
  items: OrmItemAr[],
}

const countRecords = (items: OrmItemAr[]): number => sum(
  items.map(({ recordCount, repeated }) => (recordCount || 1) * (repeated || 1)),
);

function ActiveRecordModel({ model, items }: ActiveRecordModelProps) {
  const [showItems, setShowItems] = useState(false);

  const count = countRecords(items);

  const duration = useMemo(() => (
    items.map(({ started, finished }) => getDuration(started, finished))
      .reduce((s, n) => s + n, 0)
  ), [items]);

  const onClickToggle = () => {
    setShowItems(!showItems);
  };

  return (
    <div>
      <pre>
        <button
          type="button"
          className="text-blue-500 border-blue-500 my-1 mx-2 px-1 border text-xs rounded"
          onClick={onClickToggle}
        >
          {showItems ? '-' : '+'}
        </button>

        <span>{model.padEnd(40)}</span>
        <span className="text-indigo-600">{`${formatDuration(duration)} [${items.length} - ${count}]`}</span>
      </pre>
      {
        showItems ? items.map((item) => (
          <ArItem key={item.key} item={item} />
        )) : null
      }
    </div>
  );
}

export default ActiveRecordModel;
