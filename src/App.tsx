import { Toaster } from "./components/ui/sonner";
import { HashRouter } from "react-router-dom";
import RouterView from "@/router";

import { useEffect } from "react";
import { useAppDispatch } from "./store";
import { queryUserInfoAsync } from "@/store/features/userSlice";
import { storage } from "./assets/utils";

export default function App() {

  const dispatch = useAppDispatch();
  useEffect(() => {
    // 因為redux重整後store會重置
    const token = storage.get("tk");
    if (token) {
      dispatch(queryUserInfoAsync());
    }
  }, [dispatch]);

  return (
    <HashRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <div className="min-w-75">
        <RouterView />
        <Toaster />
      </div>
    </HashRouter>
  );
}
