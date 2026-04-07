import { configureStore } from '@reduxjs/toolkit';
import modalReducer from './modalSlice';

export const store = configureStore({
  reducer: {
    modal: modalReducer,
  },
  middleware: getdefaultMiddleware =>
    getdefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['modal.stack'],
        ignoredActions: ['modal/pushModal'],
        ignoredActionPaths: ['payload.props', 'payload.props.message'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
