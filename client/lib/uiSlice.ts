import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import isEqual from 'lodash/isEqual';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    formats: [] as string[],
    tabs: [] as string[],
    activeFormat: '',
    activeTab: '',
  },
  reducers: {
    setActiveFormat: (state, action?: PayloadAction<string>) => ({ ...state, activeFormat: action?.payload || '' }),

    setActiveTab: (state, action?: PayloadAction<string>) => ({ ...state, activeTab: action?.payload || '' }),

    updateFormats: (state, action: PayloadAction<string[]>) => {
      const { formats, activeFormat } = state;
      const newFormats = action.payload;
      if (isEqual(formats, newFormats)) return state;

      return {
        ...state,
        formats: newFormats,
        activeFormat: newFormats.find((fmt) => fmt === activeFormat) || '',
      };
    },

    updateTabs: (state, action: PayloadAction<string[]>) => {
      const { tabs } = state;
      const tbs = action.payload;
      if (isEqual(tabs, tbs)) return state;

      return {
        ...state,
        tabs: tbs,
        activeTab: tbs[0],
      };
    },
  },
});

export const {
  setActiveFormat, setActiveTab, updateFormats, updateTabs,
} = uiSlice.actions;

export default uiSlice.reducer;
