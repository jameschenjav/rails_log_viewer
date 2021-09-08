import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ActionData } from './types';

const actionsSlice = createSlice({
  name: 'actions',
  initialState: {
    lists: {} as { [rid: string]: ActionData[] },
    selections: {} as { [rid: string]: string }, // rid -> aid
  },
  reducers: {
    push: (state, action: PayloadAction<ActionData & { rid: string }>) => {
      const { rid, ...data } = action.payload;
      const list = [...(state.lists[rid] || [])];
      list.push(data);
      return { lists: { ...state.lists, [rid]: list }, selections: state.selections };
    },

    choose: (state, action: PayloadAction<{ rid: string, aid: string }>) => {
      const { lists, selections } = state;
      const { rid, aid } = action.payload;
      return {
        lists,
        selections: {
          ...selections,
          [rid]: aid,
        },
      };
    },

    clearList: (state, action: PayloadAction<{ rid: string }>) => {
      const { lists, selections } = state;
      const { rid } = action.payload;
      return {
        lists: {
          ...lists,
          [rid]: [],
        },
        selections: {
          ...selections,
          [rid]: '',
        },
      };
    },
  },
});

export const { push, choose, clearList } = actionsSlice.actions;

export default actionsSlice.reducer;
