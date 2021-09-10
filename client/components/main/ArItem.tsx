import React, { useState } from 'react';

import { OrmItemAr } from '../../lib/stackUtils';
import { formatDuration, getDuration, getDurationColor } from '../../lib/utils';
import SqlItem from './SqlItem';

interface ArItemProps {
  item: OrmItemAr,
}

const ArItem = ({ item }: ArItemProps) => {
  const [showStack, setShowStack] = useState(false);

  const runtime = getDuration(item.started, item.finished);

  const onClickStackToggle = () => {
    setShowStack(!showStack);
  };

  return (
    <div className="active-record-item">
      <pre className="text-sm">
        <span>    - (</span>
        <span className={getDurationColor(runtime)}>{formatDuration(runtime)}</span>
        <span>{`) record count: ${item.recordCount}`}</span>
        <span className={item.repeated ? 'text-pink-600 font-bold' : 'text-yellow-600'}>
          {` [S: ${item.stack.length}] ${item.repeated > 1 ? `x ${item.repeated} ` : ''}`}
        </span>

        <button
          type="button"
          className="text-indigo-500 border-indigo-500 my-1 mx-2 px-1 border text-xs rounded"
          onClick={onClickStackToggle}
        >
          {showStack ? '-' : '+'}
        </button>
      </pre>
      {
        showStack ? (
          <>
            {
              item.children.slice(0, 1).map((sql) => (
                <SqlItem key={sql.key} item={sql} showSql />
              ))
            }
            <pre className="px-4 py-2 bg-gray-100 text-sm overflow-x-hidden overflow-ellipsis">{item.callStack}</pre>
          </>
        ) : null
      }
    </div>
  );
};

export default ArItem;
