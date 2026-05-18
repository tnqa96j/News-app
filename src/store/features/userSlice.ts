import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { type IUser } from "@/types/user";
import { queryUserInfo } from "@/api";

interface UserState {
  info: IUser | null;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: UserState = {
  info: null,
  status: "idle",
};

export const queryUserInfoAsync = createAsyncThunk(
  "user/queryUserInfo",
  async (_, { rejectWithValue }) => {
    const { code, data, codeText } = await queryUserInfo();
    if (code !== 0 || !data) return rejectWithValue(codeText);
    return data;
  },
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserInfo(state) {
      state.info = null;
      state.status = "idle";
    },
  },
  extraReducers(builder) {
    builder
      .addCase(queryUserInfoAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(queryUserInfoAsync.fulfilled, (state, action) => {
        state.info = action.payload;
        state.status = "succeeded";
      })
      .addCase(queryUserInfoAsync.rejected, (state) => {
        state.info = null;
        state.status = "failed";
      });
  },
});

export const { clearUserInfo } = userSlice.actions;
export default userSlice.reducer;