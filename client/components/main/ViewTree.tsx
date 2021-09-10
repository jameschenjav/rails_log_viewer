import React, { useState } from 'react';
import repeat from 'lodash/repeat';

import { ViewItem } from '../../lib/stackUtils';

interface ViewTreeProps {
  view: ViewItem,
  indent: number,
}

const ViewTree = ({ view: v, indent }: ViewTreeProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const [showStack, setShowStack] = useState(false);

  const padding = repeat(' ', indent * 3);

  const repeated = v.repeated ? ` x ${v.repeated}` : '';

  const toggleClass = v.children.length ? 'text-blue-500 border-blue-500' : 'text-gray-300 border-gray-300';

  const onClickDetailsToggle = () => {
    setShowDetails(!showDetails);
  };

  const onClickStackToggle = () => {
    setShowStack(!showStack);
  };

  return (
    <div>
      <pre>
        <code>{padding}</code>
        <button
          type="button"
          className={`${toggleClass} my-1 mr-2 px-1 border text-xs rounded`}
          disabled={!v.children.length}
          onClick={onClickDetailsToggle}
        >
          {showDetails || !v.children.length ? '-' : '+'}
        </button>
        <span>{v.identifier.slice(2)}</span>
        <span className={repeated ? 'text-pink-600 font-bold' : 'text-yellow-600'}>
          {` [D: ${v.depth}; C: ${v.childCount}]${repeated}`}
        </span>

        <button
          type="button"
          className="text-indigo-500 border-indigo-500 my-1 mx-2 px-1 border text-xs rounded"
          onClick={onClickStackToggle}
        >
          {showStack ? '-' : '+'}
        </button>
        <span className="text-indigo-600">{`S: ${v.stack.length}`}</span>
      </pre>
      {
        showStack ? (
          <pre className="px-4 py-3 bg-gray-100 text-sm overflow-x-hidden overflow-ellipsis">
            {v.callStack}
          </pre>
        ) : null
      }
      {
      showDetails ? (
        v.children.map((view) => (
          <ViewTree key={view.key} view={view} indent={indent + 1} />
        ))
      ) : null
    }
    </div>
  );
};

export default ViewTree;
