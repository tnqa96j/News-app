import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type InputMode = "add" | "reply" | "edit" | "";

interface CommentState {
  mode: InputMode; // 輸入模式
  text: string; // 輸入框中的文字(only for isMobile)
}

interface EditingState {
  originalText: string; // 編輯前的內容
  targetId: string | null; // 要編輯的留言
}

const initialState: CommentState & EditingState = {
  mode: "add",
  text: "",
  originalText: "",
  targetId: null,
};

const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<InputMode>) {
      state.mode = action.payload;
    },
    setText(state, action: PayloadAction<string>) {
      state.text = action.payload;
    },
    startEdit(state, action: PayloadAction<{ id: string; text: string }>) {
      state.mode = "edit";
      state.targetId = action.payload.id;
      state.originalText = action.payload.text;
    },
    resetInput(state, action: PayloadAction<{ keepText?: boolean } | undefined>) {
      state.mode = "";
      state.targetId = null;
      state.originalText = "";
      // 只有在明確要求 keepText 為 true 時才保留，否則預設清空 => 編輯完成 / 取消編輯的時候
      if (!action.payload?.keepText) {
        state.text = "";
      }
    },
  },
});

export const { setMode, setText, startEdit, resetInput } = commentSlice.actions;
export default commentSlice.reducer;

/*
TS with redux
1. initialState定義型別
2. type RootState = ReturnType<typeof store.getState>;
   type AppDispatch = typeof store.dispatch;
   export const useAppDispatch = () => useDispatch<AppDispatch>();
   export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
*/
