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

  return action
    ? (
      <main className="flex-1 text-center px-2 flex flex-col">
        <TabMenu />
        <div id="tabs-wrapper" className="border flex-1 overflow-x-hidden overflow-y-auto border-blue-500">
          {tab === 'Summary' ? (<TabSummary />) : null}
          {tab === 'ORM' ? (<TabOrm />) : null}
          {tab === 'View' ? (<TabView />) : null}
        </div>
      </main>
    )
    : (<main className="text-center p-10 text-blue-500">No Selection</main>);
};

export default ActionViewer;
