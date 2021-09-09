import React, { useState } from 'react';

import { ActionData } from '../../lib/types';

type View = ActionData['view'][0];

interface ViewItemProps {
  view: View,
}

const ViewItem = ({ view: v }: ViewItemProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const stack = v.stack.join('\n') || '<UNKNOWN>';

  const onClickToggle = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div>
      <pre>
        <button
          type="button"
          className="text-blue-500 border-blue-500 my-1 mr-2 px-1 border text-xs rounded"
          onClick={onClickToggle}
        >
          {showDetails ? '-' : '+'}
        </button>
        <span>{`${v.identifier} (${v.stack.length})`}</span>
      </pre>
      {
        showDetails ? (
          <pre className="px-4 py-3 bg-gray-100 text-sm overflow-x-hidden overflow-ellipsis">{stack}</pre>
        ) : null
      }
    </div>
  );
};

export default ViewItem;
