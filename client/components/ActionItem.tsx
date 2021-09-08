import React, { KeyboardEvent } from 'react';

import { ActionData } from '../lib/types';
import {
  formatDuration, getDuration, getDurationColor, getStatusColor,
} from '../lib/utils';

interface ActionItemProps {
  action: ActionData,
  selected: boolean,
  onSelect: (args: { aid: string }) => void,
}

const getItemText = ({ path }: ActionData): string => {
  const { pathname } = new URL(`http://foo.com${path}`);
  return pathname;
};

const ActionItem = ({ action, selected, onSelect }: ActionItemProps) => {
  const onClick = () => {
    onSelect(selected ? { aid: '' } : action);
  };

  const onKeyPress = (ev: KeyboardEvent<HTMLLIElement>) => {
    console.log(ev);
  };

  const className = selected
    ? 'font-bold bg-yellow-200 border-blue-800'
    : 'bg-white border-blue-200';

  const dur = getDuration(action.started, action.finished);

  return (
    <li
      role="menuitem"
      className={`flex items-center border-t border-b relative ${className}`}
      title={action.path}
      onClick={onClick}
      onKeyPress={onKeyPress}
    >
      <code className="method flex-grow-0 mx-2">
        <div className={`text-sm ${getStatusColor(action.status)}`}>{`${action.method}:`}</div>
        <div className={`text-xs ${getDurationColor(dur)}`}>{formatDuration(dur)}</div>
      </code>
      <code className="path inline-flex flex-1 overflow-hidden break-all mr-3 text-sm">
        {getItemText(action)}
      </code>
      <code className="format">{action.format}</code>
    </li>
  );
};

export default ActionItem;
