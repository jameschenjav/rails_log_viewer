import React, { KeyboardEvent } from 'react';

import { ActionData } from '../lib/types';

interface Props {
  action: ActionData,
  selected: boolean,
  onSelect: (args: { aid: string }) => void,
}

const getItemText = ({ path }: ActionData): string => {
  const { pathname } = new URL(`http://foo.com${path}`);
  return pathname;
};

const getDurationColor = (dur: number): string => {
  if (dur < 200) return 'text-green-800';
  if (dur > 10000) return 'text-red-500';
  if (dur > 2000) return 'text-red-600';
  if (dur > 1200) return 'text-red-700';
  if (dur > 800) return 'text-red-800';
  return 'text-blue-800';
};

const ActionItem = ({ action, selected, onSelect }: Props) => {
  const onClick = () => {
    onSelect(selected ? { aid: '' } : action);
  };

  const onKeyPress = (ev: KeyboardEvent<HTMLLIElement>) => {
    console.log(ev);
  };

  const className = selected
    ? 'font-bold bg-yellow-200 border-blue-800'
    : 'bg-white border-blue-200';

  const tmBeg = new Date(action.started);
  const tmEnd = new Date(action.finished);
  const dur = tmEnd.getTime() - tmBeg.getTime();
  const duration = dur > 1000 ? `${(dur / 1000).toFixed(2)}s` : `${dur}ms`;

  return (
    <li
      role="menuitem"
      className={`flex items-center border-t border-b relative ${className}`}
      title={action.path}
      onClick={onClick}
      onKeyPress={onKeyPress}
    >
      <code className="method flex-grow-0 mx-2">
        <div className="text-sm">{`${action.method}:`}</div>
        <div className={`text-xs ${getDurationColor(dur)}`}>{duration}</div>
      </code>
      <code className="path inline-flex flex-1 overflow-hidden break-all mr-3 text-sm">
        {getItemText(action)}
      </code>
      <code className="format">{action.format}</code>
    </li>
  );
};

export default ActionItem;
