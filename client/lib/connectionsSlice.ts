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
      return { list, selectedId };
    },

    closed: (state, action: PayloadAction<{ rid: string }>) => {
      const { rid } = action.payload;
      const list = state.list.map((s) => (s.rid === rid ? { ...s, connected: false } : s));
      delete rid2Path[rid];
      return { list, selectedId: state.selectedId };
    },

    select: (state, action: PayloadAction<{ rid: string }>) => ({
      ...state,
      selectedId: action.payload.rid,
    }),
  },
});

export const { add, closed, select } = connectionsSlice.actions;

export default connectionsSlice.reducer;
