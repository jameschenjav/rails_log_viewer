import React from 'react';

import SideSection from './components/SideSection';
import ServerList from './components/ServerList';
import ActionViewer from './components/ActionViewer';

function App() {
  return (
    <div className="flex-col w-full h-full">
      <ServerList />
      {/* <nav className="flex-grow-0 flex-shrink-0">nav</nav> */}
      <div id="main" className="flex-auto flex flex-row">
        <SideSection />
        <ActionViewer />
      </div>
      <footer className="flex-grow-0 flex-shrink-0">footer</footer>
    </div>
  );
}

export default App;
