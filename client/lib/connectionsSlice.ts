import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import uniqBy from 'lodash/uniqBy';

import { RailsConnection } from './types';

const connectionsSlice = createSlice({
  name: 'connections',
  initialState: {
    list: [] as RailsConnection[],
    selectedId: '',
  },
  reducers: {
    add: (state, action: PayloadAction<RailsConnection[]>) => {
      const list = uniqBy(state.list.concat(action.payload), 'rid');
      const selectedId = state.selectedId || list[0]?.rid || '';
      return { list, selectedId };
    },

    closed: (state, action: PayloadAction<{ rid: string }>) => {
      const { rid } = action.payload;
      const list = state.list.map((s) => (s.rid === rid ? { ...s, connected: false } : s));
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
