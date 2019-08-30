<script>
  import FileGroup from './FileGroup.svelte';

  import { uniq } from '../../../api/utils';

  export let viewInfo;

  const sorter = ([p1], [p2]) => p1.localeCompare(p2);

  const splitLines = (lines) => Object.entries(lines)
    .map(([depLine, count]) => {
      const [depth, line] = depLine.split('@');
      return { depth, line, count };
    })
    .sort(({ line: l1 }, { line: l2 }) => l1 - l2);

  const decodeData = ({ path, lines }) => ({ path, lines: splitLines(lines) });

  const extractCategories = ({ pathMap, otherMap }) => {
    const views = [];
    const app = [];
    const outside = [];
    Object.entries(pathMap).forEach(([pathText, data]) => {
      const { path, lines } = decodeData(data);
      const d = {
        path,
        lines: lines.filter(({ line }) => line).map(({ depth, line, count }) => ({
          depth,
          line,
          count,
          desc: `${[...otherMap[`${depth}@${path}:${line}`]].sort().join('; ')} (${count})`,
        })),
      };
      const depths = uniq(lines.map(({ depth }) => depth)).sort((a, b) => a - b);
      const p = `${pathText} (${depths.map((dp) => `@${dp}`).join(' ')})`;

      if (pathText.startsWith('/')) {
        outside.push([p, d]);
      } else if (pathText.startsWith('app/views/')) {
        views.push([`.../${p.slice(10)}`, d]);
      } else {
        app.push([p, d]);
      }
    });

    views.sort(sorter);
    app.sort(sorter);
    outside.sort(sorter);
    return { views, app, outside };
  };

  $: categories = extractCategories(viewInfo);
</script>

<div class="group view-group">
  <div class="title">Views:</div>
  <FileGroup group={categories.views} />
</div>

<div class="group app-group">
  <div class="title">App:</div>
  <FileGroup group={categories.app} />
</div>

<div class="group outside-group">
  <div class="title">Outside:</div>
  <FileGroup group={categories.outside} />
</div>

<style>
  .group:not(:last-child) {
    margin-bottom: 15px;
  }

  .title {
    font-size: 120%;
    margin: 0;
  }
</style>
