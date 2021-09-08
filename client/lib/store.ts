import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import connectionsSliceReducer from './connectionsSlice';
import actionsSliceReducer from './actionsSlice';
import uiSliceReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    connections: connectionsSliceReducer,
    actions: actionsSliceReducer,
    ui: uiSliceReducer,
  },
});

export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof store.getState>;

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const dispatch = store.dispatch.bind(store);

export default store;
