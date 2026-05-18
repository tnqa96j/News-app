import routes, { type IRoute } from "@/router/routes";
import { Suspense, useEffect, useMemo, type FC } from "react";
import {
  Route,
  Routes,
  useNavigate,
  useLocation,
  useParams,
  type Params,
  useSearchParams,
  useOutlet,
} from "react-router-dom";
import Footer from "@/components/Footer";
import { Mask, DotLoading } from "@/components/Mask";
import { useAppSelector, useAppDispatch } from "@/store";
import { queryUserInfoAsync } from "@/store/features/userSlice";
import { storage, toastError } from "@/assets/utils";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { KeepAlive } from "keepalive-for-react";

export interface RouteComponentProps<K extends string = string> {
  navigate: ReturnType<typeof useNavigate>;
  location: ReturnType<typeof useLocation>;
  params: Params<K>; // K = key = 路徑參數鍵名
  usp: URLSearchParams;
}

const Element: FC<IRoute> = ({ component: Component, meta, path }) => {
  // 獲取路由資訊，藉由props傳遞給'page'元件
  const navigate = useNavigate(),
    location = useLocation(),
    params = useParams(),
    [usp] = useSearchParams(),
    dispatch = useAppDispatch();

  /* Page title */
  useEffect(() => {
    const title = meta.title || "Daily News";
    document.title = title;
  }, [meta]);

  /* 登入狀態校驗 */
  const { info, status } = useAppSelector((state) => state.user);
  const needLoginPath = [
    "/personal",
    "/favorites",
    "/subscriptions",
    "/update",
  ].includes(path);

  useEffect(() => {
    if (!needLoginPath) return; // 不需要做登入校驗的路由

    const token = storage.get<string>("tk");
    // 沒有token，直接跳轉login page
    if (!token) {
      toastError("Please login first");
      navigate(
        { pathname: "/login", search: `?to=${path}` }, // path = 跳轉登入頁前的當前路徑
        { replace: true },
      );
      return;
    }

    // 有token但redux中沒有userInfo（例如：重整後） => 嘗試重新取得userInfo，若獲取失敗，代表token過期或無效，直接跳轉登入頁
    // status變化過程：idle（嘗試發請求） → loading（什麼都不做） → failed（清除token，跳轉Login頁）
    if (!info) {
      if (status === "idle") {
        dispatch(queryUserInfoAsync());
        return;
      }
      if (status === "failed") {
        storage.remove("tk");
        toastError("Session expired. Please login again.");
        navigate(
          { pathname: "/login", search: `?to=${path}` },
          { replace: true },
        );
        return;
      }
    }
  }, [needLoginPath, info, dispatch, navigate, path, status]);

  // 受保護的路由 且 取得info狀態是 loading 或已經確定無法取得 userInfo（useEffect 會處理重導向） => 顯示 spinner 等待
  if (
    needLoginPath &&
    (status === "loading" || (!info && status !== "succeeded"))
  ) {
    return (
      <Mask fixed opacity="default">
        <DotLoading />
      </Mask>
    );
  }

  return (
    <>
      <Component
        navigate={navigate}
        location={location}
        params={params}
        usp={usp}
      />
      <Footer />
    </>
  );
};

const Layout = () => {
  const location = useLocation();
  const outlet = useOutlet(); // 取得當前路由對應的子元件
  // const navType = useNavigationType();

  // keepAlive機制：根據location.pathname來決定cache key，當pathname相同時，重複使用同一個cache，保持元件狀態；當pathname不同時，切換到新的cache，顯示新的元件
  const currentCacheKey = useMemo(() => location.pathname, [location.pathname]);
  return (
    <KeepAlive activeCacheKey={currentCacheKey} include={["/"]} max={3}>
      <Suspense
        fallback={
          <Mask fixed opacity="default">
            <DotLoading />
          </Mask>
        }
      >
        {outlet}
      </Suspense>
    </KeepAlive>
  );
};

export default function RouterView() {
  useScrollRestoration();
  return (
    <Routes>
      <Route element={<Layout />}>
        {routes.map((item: IRoute) => {
          const { name, path } = item;
          return (
            <Route key={name} path={path} element={<Element {...item} />} />
          );
        })}
      </Route>
    </Routes>
  );
}

/*
dispatch(queryUserInfoAsync())
  .unwrap() // unwrap會在rejected時throw error
  .catch(() => {
    storage.remove("tk");
    oastError("Session expired. Please login again.");
      navigate(
        { pathname: "/login", search: `?to=${path}` },
        { replace: true },
      );
    });
*/
