import React, { MouseEvent } from 'react';

import { clearList } from '../../lib/actionsSlice';
import { useAppDispatch, useAppSelector } from '../../lib/store';

const SideMenuBar = () => {
  const dispatch = useAppDispatch();

  const rid = useAppSelector(({ connections }) => connections.selectedId);

  const onClickClear = (ev: MouseEvent<HTMLButtonElement>) => {
    ev.preventDefault();
    ev.stopPropagation();
    dispatch(clearList({ rid }));
  };

  return (
    <ul id="menu-bar" className="flex flex-0 items-stretch justify-between px-2">
      <li>Method</li>
      <li>Path</li>
      <li><button type="button" disabled={!rid} onClick={onClickClear}>Clear</button></li>
    </ul>
  );
};

export default SideMenuBar;
