import React from 'react';

import ActionItem from './ActionItem';

import { choose } from '../../lib/actionsSlice';
import { useAppDispatch, useAppSelector } from '../../lib/store';
import { updateTabs } from '../../lib/uiSlice';

const ActionList = () => {
  const dispatch = useAppDispatch();

  const { rid, aid, list } = useAppSelector(({ connections, actions }) => ({
    rid: connections.selectedId,
    aid: actions.selections[connections.selectedId] || '',
    list: actions.lists[connections.selectedId] || [],
  }));

  // const action = (id && list.find(({ aid }) => aid === id)) || null;

  const onSelect = ({ aid: id }: { aid: string }) => {
    dispatch(choose({ rid, aid: id }));

    const action = list.find(({ aid: actionId }) => actionId === id);
    if (!action) return;
    console.log(action);

    const tabs = ['Summary'];
    if (action.orm.length) tabs.push('ORM');
    if (action.view.length) tabs.push('View');
    dispatch(updateTabs(tabs));
  };

  return (
    <ul id="action-list" className="flex-1 border border-blue-500 overflow-x-hidden overflow-y-auto block relative">
      {
          list.map((action) => (
            <ActionItem key={action.aid} action={action} selected={action.aid === aid} onSelect={onSelect} />
          ))
        }
    </ul>
  );
};

export default ActionList;
