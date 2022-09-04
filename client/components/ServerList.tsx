import React, { ChangeEvent } from 'react';

import { useAppDispatch, useAppSelector } from '../lib/store';
import { remove, select } from '../lib/connectionsSlice';
import { RailsConnection } from '../lib/types';
import { formatTime } from '../lib/utils';

const getOption = (s: RailsConnection): { text: string, value: string, disabled: boolean } => {
  const {
    rid,
    host,
    port,
    path,
    connected,
  } = s;
  if (connected) {
    return { value: rid, disabled: false, text: `${host}:${port}@${path} (open: ${rid})` };
  }

  return { value: rid, disabled: true, text: `${host}:${port}@${path} (closed: ${rid})` };
};

const formatServerInfo = (s: RailsConnection): JSX.Element => {
  const lines = [
    `Rails: ${s.version} (Ruby: ${s.ruby})`,
    `Started: ${formatTime(s.started)}`,
  ];
  return (<pre className={s.connected ? 'text-green-700' : 'text-red-700'}>{lines.join('\n')}</pre>);
};

function ServerList() {
  const dispatch = useAppDispatch();

  const {
    connections: { list, selectedId },
    actions: { lists },
  } = useAppSelector(({ connections, actions }) => ({ connections, actions }));

  const selected = (selectedId && list.find(({ rid }) => rid === selectedId)) || false;

  const connectedCount = list.filter(({ connected }) => connected).length;

  const onSelect = (ev: ChangeEvent<HTMLSelectElement>) => {
    dispatch(select({ rid: ev.target.value }));

    const emptyRids = list.filter(({ connected }) => !connected)
      .map(({ rid }) => rid)
      .filter((rid) => !lists[rid]?.length);
    dispatch(remove({ ridList: emptyRids }));
  };

  return (
    <header className="flex-grow-0 flex-shrink-0 flex flex-row items-center">
      <select
        className="p-2 mx-5 border-2 rounded-md border-blue-200 focus:border-blue-800"
        value={selectedId}
        onChange={onSelect}
      >
        {
          list.map((s) => getOption(s)).map(({ value, text, disabled }) => (
            <option key={value} value={value} className={disabled ? 'text-gray-600' : ''}>{text}</option>
          ))
        }
      </select>

      <div className="mx-10 my-3 text-sm">{selected ? formatServerInfo(selected) : null}</div>

      <div>{`${list.length} Connections (${connectedCount} Open / ${list.length - connectedCount} Closed)`}</div>
    </header>
  );
}

export default ServerList;
