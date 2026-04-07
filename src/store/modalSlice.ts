import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { genId } from '@/utils/genId';
import { ModalKey, ModalPayload, ModalPropsMap, ModalState } from '@/models/modal';

const initialState: ModalState = { stack: [] };

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    pushModal: {
      reducer(state, action: PayloadAction<ModalPayload>) {
        state.stack.push(action.payload);
      },
      prepare: <K extends ModalKey>(key: K, props?: ModalPropsMap[K]) => {
        if (typeof document !== 'undefined') {
          const el = document.activeElement as HTMLElement | null;
          el?.blur?.(); // 모바일 키보드/포커스 끊기
        }
        const id = genId();
        return { payload: { id, key, props } as ModalPayload<K> };
      },
    },
    popModal(state) {
      if (state.stack.length) {
        state.stack.pop();
      }
    },
    closeById(state, action: PayloadAction<string>) {
      state.stack = state.stack.filter(i => i.id !== action.payload);
    },
    closeAll(state) {
      state.stack = [];
    },
  },
});

export const { pushModal, popModal, closeById, closeAll } = modalSlice.actions;
export default modalSlice.reducer;
