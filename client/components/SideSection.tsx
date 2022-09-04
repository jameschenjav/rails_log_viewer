import React from 'react';

import { useAppSelector } from '../lib/store';
import ActionList from './side/ActionList';
import SideMenuBar from './side/SideMenuBar';

function SideSection() {
  const rid = useAppSelector(({ connections }) => connections.selectedId);

  const aid = useAppSelector(({ actions }) => actions.selections[rid] || '');

  return (
    <aside id="side-section" className={`flex flex-col items-stretch ${aid ? 'flex-grow-0' : 'flex-1'}`}>
      <SideMenuBar />
      <ActionList />
    </aside>
  );
}

export default SideSection;
