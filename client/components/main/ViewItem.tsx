import React, { useState } from 'react';

import { ActionData } from '../../lib/types';

type View = ActionData['view'][0];

interface ViewItemProps {
  view: View,
}

function ViewItem({ view: v }: ViewItemProps) {
  const [showStack, setShowStack] = useState(false);

  const stack = v.stack.join('\n') || '<UNKNOWN>';

  const onClickStackToggle = () => {
    setShowStack(!showStack);
  };

  return (
    <div>
      <pre>
        <span> - </span>
        <span>{v.identifier.slice(2)}</span>

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
          <pre className="px-4 py-3 bg-gray-100 text-sm overflow-x-hidden overflow-ellipsis">{stack}</pre>
        ) : null
      }
    </div>
  );
}

export default ViewItem;
