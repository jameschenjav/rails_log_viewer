import React from 'react';

import ViewTree from './ViewTree';
import ViewItem from './ViewItem';

import { ActionDataProps } from '../../lib/types';
import { mergeViewStack } from '../../lib/viewStack';

const TabView = ({ action }: ActionDataProps) => {
  const rootViews = mergeViewStack(action);

  const views = [...action.view].map((view, idx) => ({
    view,
    key: `vi-${view.identifier}-${idx}`,
  }));

  return (
    <div className="p-3">
      <h3>Invoke Tree</h3>
      {
        rootViews.map((v) => (
          <ViewTree key={`vt-${v.key}`} view={v} indent={0} />
        ))
      }

      <h3>Call Stack</h3>
      {
        views.map(({ view: v, key }) => (
          <ViewItem key={key} view={v} />
        ))
      }
    </div>
  );
};

export default TabView;
