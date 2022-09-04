import React from 'react';

import { useAppSelector } from '../lib/store';
import TabMenu from './main/TabMenu';
import TabOrm from './main/TabOrm';
import TabSummary from './main/TabSummary';
import TabView from './main/TabView';

function ActionViewer() {
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
      <main className="flex-1 px-2 flex flex-col show">
        <TabMenu action={action} rid={rid} />
        <div id="tabs-wrapper" className="border flex-1 overflow-x-hidden overflow-y-auto border-blue-500">
          {tab === 'Summary' ? (<TabSummary action={action} rid={rid} />) : null}
          {tab === 'ORM' ? (<TabOrm action={action} rid={rid} />) : null}
          {tab === 'View' ? (<TabView action={action} rid={rid} />) : null}
        </div>
      </main>
    )
    : (<main className="text-center p-10 text-blue-500">No Selection</main>);
}

export default ActionViewer;
