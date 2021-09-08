import React, { KeyboardEvent } from 'react';

import { useAppDispatch, useAppSelector } from '../lib/store';
import { ActionData } from '../lib/types';
import { setActiveTab } from '../lib/uiSlice';

const formatDuration = (span: number): string => (
  span > 1000 ? `${(span / 1000).toFixed(2)}s` : `${span.toFixed(1)}ms`
);

const getTabText = (action: ActionData, tab: string): string => {
  switch (tab) {
    case 'ORM': return `${tab} (${action.orm.length}: ${formatDuration(action.dbRuntime)})`;
    case 'View': return `${tab} (${action.view.length}: ${formatDuration(action.viewRuntime)})`;
    default: return tab;
  }
};

const TabMenu = () => {
  const {
    ui: { tabs, activeTab },
    aid: id,
    list,
  } = useAppSelector(({ connections, actions, ui }) => ({
    ui,
    aid: actions.selections[connections.selectedId] || '',
    list: actions.lists[connections.selectedId] || [],
  }));

  const dispatch = useAppDispatch();

  const action = list.find(({ aid }) => aid === id)!;

  const menuTabs = tabs.map((tab) => ({
    key: tab,
    text: getTabText(action, tab),
    style: activeTab === tab ? 'bg-yellow-200 font-bold border-blue-800' : 'border-blue-200',
  }));

  const onSelectTab = (tab: string): void => {
    if (tab === activeTab) return;
    dispatch(setActiveTab(tab));
  };

  const onKeyPress = (ev: KeyboardEvent<HTMLLIElement>) => {
    console.log(ev);
  };

  return (
    <ul id="action-menu" className="flex flex-0 items-stretch justify-around">
      {
        menuTabs.map(({ key, text, style }) => (
          <li
            role="menuitem"
            key={key}
            className={`border-t border-l border-r border-gray-400 flex-1 cursor-pointer py-1 ${style}`}
            onClick={() => onSelectTab(key)}
            onKeyPress={onKeyPress}
          >
            {text}
          </li>
        ))
      }
    </ul>
  );
};

export default TabMenu;
