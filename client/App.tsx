import React from 'react';

import ServerList from './components/ServerList';

function App() {
  return (
    <div className="flex-col w-full h-full">
      <ServerList />
      <nav className="flex-grow-0 flex-shrink-0">nav</nav>
      <div className="flex-auto flex flex-row">
        <aside>side menu</aside>
        <main className="flex-auto text-center">main</main>
      </div>
      <footer className="flex-grow-0 flex-shrink-0">footer</footer>
    </div>
  );
}

export default App;
