import React, { useState } from 'react';
import repeat from 'lodash/repeat';

import { ViewItem } from '../../lib/viewStack';

interface ViewTreeProps {
  view: ViewItem,
  indent: number,
}

const ViewTree = ({ view, indent }: ViewTreeProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const padding = repeat(' ', indent * 3);

  const stack = view.stack.join('\n') || '<unknown>';

  const onClickToggle = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div>
      <pre>
        <code>{padding}</code>
        <button
          type="button"
          className="text-blue-500 border-blue-500 my-1 mr-2 px-1 border text-xs rounded"
          onClick={onClickToggle}
        >
          {showDetails ? '-' : '+'}
        </button>
        <span>{`${view.identifier} [${view.childCount}]`}</span>
      </pre>
      {
        showDetails ? (
          <pre className="px-4 py-3 bg-gray-100 text-sm overflow-x-hidden overflow-ellipsis">{stack}</pre>
        ) : null
      }
      {
      showDetails ? (
        view.children.map((v) => (
          <ViewTree key={v.key} view={v} indent={indent + 1} />
        ))
      ) : null
    }
    </div>
  );
};

export default ViewTree;
