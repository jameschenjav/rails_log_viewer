import React, { useState } from 'react';

import { OrmItemSql } from '../../lib/stackUtils';
import { formatDuration, getDuration, getDurationColor } from '../../lib/utils';

interface SqlItemProps {
  item: OrmItemSql,
  showSql?: boolean,
}

const sqlTitle = (sql: string): string => {
  const lines = sql.split('\n');
  const title = lines[0].trim();
  return (title.length > 50 || lines.length > 1 ? `${title.slice(0, 50)}...` : title).padEnd(54);
};

const SqlItem = ({ item, showSql = false }: SqlItemProps) => {
  const [showStack, setShowStack] = useState(false);

  const title = sqlTitle(item.sql);

  const runtime = getDuration(item.started, item.finished);

  const onClickStackToggle = () => {
    setShowStack(!showStack);
  };

  return (
    <div className="sql-item">
      {
        showSql ? null : (
          <pre className="text-sm">
            <button
              type="button"
              className="text-indigo-500 border-indigo-500 my-1 mx-2 px-1 border text-xs rounded toggle"
              onClick={onClickStackToggle}
            >
              {showStack ? '-' : '+'}
            </button>

            <span>{title}</span>
            <span className="text-indigo-600">{`[S: ${item.stack.length}] `}</span>
            <span className={getDurationColor(runtime)}>{formatDuration(runtime)}</span>
          </pre>
        )
      }
      {
        showStack || showSql ? (
          <pre className="px-3 py-1 bg-yellow-100 text-xs overflow-x-hidden overflow-ellipsis my-1" title={item.sql}>
            {item.sql}
          </pre>
        ) : null
      }
      {
        showStack && !showSql ? (
          <pre className="px-4 py-2 bg-gray-100 text-sm overflow-x-hidden overflow-ellipsis call-stack">
            {item.callStack}
          </pre>
        ) : null
      }
    </div>
  );
};

export default SqlItem;
