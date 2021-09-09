import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import uniqBy from 'lodash/uniqBy';

import { RailsConnection } from './types';

export const rid2Path: Record<string, string> = {};

const reselectConnection = (rid: string, list: RailsConnection[]): string => {
  if (!rid) return list[0]?.rid || '';

  const current = list.find(({ rid: id }) => id === rid);
  if (current?.connected) return rid;

  return list[0]?.rid || '';
};

const updatePaths = (list: RailsConnection[]): void => {
  list.forEach(({ rid, path }) => {
    rid2Path[rid] = path;
  });
};

const reorderConnections = (list: RailsConnection[]): void => {
  list.sort((c1, c2) => Number(c2.connected) - Number(c1.connected) || c2.started.localeCompare(c1.started));
};

const connectionsSlice = createSlice({
  name: 'connections',
  initialState: {
    list: [] as RailsConnection[],
    selectedId: '',
  },
  reducers: {
    add: (state, action: PayloadAction<RailsConnection[]>) => {
      const list = uniqBy(state.list.concat(action.payload), 'rid');
      updatePaths(action.payload);
      const selectedId = reselectConnection(state.selectedId, list);
      reorderConnections(list);
      return { list, selectedId };
    },

    closed: (state, action: PayloadAction<{ rid: string }>) => {
      const { rid } = action.payload;
      const list = state.list.map((s) => (s.rid === rid ? { ...s, connected: false } : s));
      delete rid2Path[rid];
      reorderConnections(list);
      return { list, selectedId: state.selectedId };
    },

    remove: (state, action: PayloadAction<{ ridList: string[] }>) => {
      const { selectedId } = state;
      const rids = new Set(action.payload.ridList.filter((rid) => rid !== selectedId));

      const list = state.list.filter(({ rid }) => !rids.has(rid));
      reorderConnections(list);
      return {
        ...state,
        list,
      };
    },

    select: (state, action: PayloadAction<{ rid: string }>) => ({
      ...state,
      selectedId: action.payload.rid,
    }),
  },
});

export const {
  add, closed, remove, select,
} = connectionsSlice.actions;

export default connectionsSlice.reducer;
