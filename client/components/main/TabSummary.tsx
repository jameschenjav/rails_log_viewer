import React from 'react';
import { ActionDataProps } from '../../lib/types';
import {
  formatDuration, formatTime, getDuration, getStatusColor,
} from '../../lib/utils';

const TabSummary = ({ action: a }: ActionDataProps) => {
  const statusColor = getStatusColor(a.status);
  const totalRuntime = formatDuration(getDuration(a.started, a.finished));
  const sqlCalls = a.orm.filter((o) => !('sql' in o)).length;

  return (
    <div className="px-5 py-2">
      <code className="text-center block">
        {`${a.controller}#${a.action} (${totalRuntime})`}
      </code>
      <dl>
        <dt>Controller</dt>
        <dd>{a.controller}</dd>
        <dt>Action</dt>
        <dd>{a.action}</dd>

        <dt>Method</dt>
        <dd>{a.method}</dd>
        <dt>Format</dt>
        <dd className="uppercase">{a.format}</dd>

        <dt className="full">Source Line</dt>
        <dd>{a.source.length ? `${a.source[0].slice(2)}:${a.source[1]}` : '<UNKNOWN>'}</dd>

        <dt>Started</dt>
        <dd>{formatTime(a.started)}</dd>
        <dt>Finished</dt>
        <dd>{formatTime(a.finished)}</dd>

        <dt className={statusColor}>Status</dt>
        <dd className={statusColor}>{a.status}</dd>
        <dt>Runtime</dt>
        <dd>{totalRuntime}</dd>

        {
        // orm
        a.orm.length ? (
          <>
            <hr />
            <h3>ORM Overview</h3>
            <dt>Total Calls</dt>
            <dd>{a.orm.length}</dd>
            <dt>Runtime</dt>
            <dd>{formatDuration(a.dbRuntime)}</dd>
            <dt>ActiveRecord</dt>
            <dd>{sqlCalls}</dd>
            <dt>SQL Calls</dt>
            <dd>{a.orm.length - sqlCalls}</dd>
          </>
        ) : null
      }
        {
        // view
        a.view.length || a.viewRuntime ? (
          <>
            <hr />
            <h3>Views Overview</h3>
            <dt>Count</dt>
            <dd>{a.view.length}</dd>
            <dt>Runtime</dt>
            <dd>{formatDuration(a.viewRuntime)}</dd>
          </>
        ) : null
      }
      </dl>
      <hr />
      <h3>Params</h3>
      <pre className="p-3 text-xs bg-gray-100">{JSON.stringify(a.params, null, 2)}</pre>
    </div>
  );
};

export default TabSummary;
