import React from 'react';

import { useAppSelector } from '../lib/store';
import TabMenu from './TabMenu';
import TabOrm from './TabOrm';
import TabSummary from './TabSummary';
import TabView from './TabView';

const ActionViewer = () => {
  const { rid, activeTab } = useAppSelector(({ ui, connections }) => ({
    rid: connections.selectedId,
    activeTab: ui.activeTab,
  }));

  const { list, aid: id } = useAppSelector(({ actions }) => ({
    list: actions.lists[rid] || [],
    aid: actions.selections[rid] || '',
  }));

  const action = (id && list.find(({ aid }) => aid === id)) || null;

  const tab = action && activeTab;

  if (action) { console.log(action); }

  return action
    ? (
      <main className="flex-1 px-2 flex flex-col">
        <TabMenu action={action} rid={rid} />
        <div id="tabs-wrapper" className="border flex-1 overflow-x-hidden overflow-y-auto border-blue-500">
          {tab === 'Summary' ? (<TabSummary action={action} rid={rid} />) : null}
          {tab === 'ORM' ? (<TabOrm action={action} rid={rid} />) : null}
          {tab === 'View' ? (<TabView action={action} rid={rid} />) : null}
        </div>
      </main>
    )
    : (<main className="text-center p-10 text-blue-500">No Selection</main>);
};

export default ActionViewer;
