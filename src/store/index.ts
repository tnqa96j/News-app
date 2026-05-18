import { configureStore } from "@reduxjs/toolkit";
import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";

import { newsApiSlice } from "@/store/features/api/newsApiSlice";
import { favoritesApiSlice } from "@/store/features/api/favoritesApiSlice";
import { subscriptionApiSlice } from "@/store/features/api/subscriptionApiSlice";
import { commentApiSlice } from "./features/api/commentApiSlice";
import userSliceReducer from "@/store/features/userSlice";
import commentSliceReducer from "@/store/features/commentSlice";
import reduxLogger from "redux-logger";

const store = configureStore({
  reducer: {
    user: userSliceReducer,
    comment: commentSliceReducer,
    [newsApiSlice.reducerPath]: newsApiSlice.reducer,
    [favoritesApiSlice.reducerPath]: favoritesApiSlice.reducer,
    [subscriptionApiSlice.reducerPath]: subscriptionApiSlice.reducer,
    [commentApiSlice.reducerPath]: commentApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(reduxLogger)
      .concat(newsApiSlice.middleware)
      .concat(favoritesApiSlice.middleware)
      .concat(subscriptionApiSlice.middleware)
      .concat(commentApiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
