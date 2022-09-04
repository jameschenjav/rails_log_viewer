import React, { useMemo, useState } from 'react';

import { mergeOrmStack } from '../../lib/stackUtils';
import { ActionDataProps } from '../../lib/types';
import ActiveRecordModel from './ActiveRecordModel';
import SqlItem from './SqlItem';

function TabOrm({ action }: ActionDataProps) {
  const [showSqlItems, setShowSqlItems] = useState(false);

  const { models, sqlItems } = useMemo(() => mergeOrmStack(action), [action]);

  const onClickToggleSqlItems = () => {
    setShowSqlItems(!showSqlItems);
  };

  return (
    <div className="px-5 py-2">
      <h3>
        <span>ActiveRecord</span>
        <span>{` (${models.length})`}</span>
      </h3>
      {
        models.map(({ model, items }) => (
          <ActiveRecordModel key={model} model={model} items={items} />
        ))
      }

      <h3>
        <span>Standalone SQL</span>
        <span>{` (${sqlItems.length})`}</span>
        <button
          type="button"
          className="text-indigo-500 my-1 mx-2 px-1 text-bold text-xl"
          onClick={onClickToggleSqlItems}
        >
          {showSqlItems ? '^' : '>'}
        </button>
      </h3>
      {
        showSqlItems ? sqlItems.map((item) => (
          <SqlItem key={item.key} item={item} />
        )) : null
      }
    </div>
  );
}

export default TabOrm;
