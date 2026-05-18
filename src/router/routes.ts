// 建立路由表
import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { type RouteComponentProps } from "@/router";
import Home from "@/pages/Home";
// import { withKeepAlive } from "keepalive-react-component";

interface RouteMeta {
  title: string;
  [key: string]: string | object | number | boolean;
}

export interface IRoute {
  path: string;
  name: string;
  component:
    | ComponentType<RouteComponentProps>
    | LazyExoticComponent<ComponentType>;
  meta: RouteMeta;
  children?: IRoute[];
}

// Home元件要keep-alive
const routes: IRoute[] = [
  {
    path: "/",
    name: "home",
    component: Home,
    meta: {
      title: "Daily News",
    },
  },
  {
    path: "/detail/:id",
    name: "detail",
    component: lazy(() => import("@/pages/Detail")),
    meta: {
      title: "", // 進頁面後處理
    },
  },
  {
    path: "/search",
    name: "search",
    component: lazy(() => import("@/pages/Search")),
    meta: {
      title: "", // 進頁面後處理
    },
  },
  {
    path: "/personal",
    name: "personal",
    component: lazy(() => import("@/pages/Personal")),
    meta: {
      title: "Personal - Daily News",
    },
  },
  {
    path: "/login",
    name: "login",
    component: lazy(() => import("@/pages/Login")),
    meta: {
      title: "Login - Daily News",
    },
  },
  {
    path: "/favorites",
    name: "favorites",
    component: lazy(() => import("@/pages/Favorites")),
    meta: {
      title: "Favorites - Daily News",
    },
  },
  {
    path: "/subscriptions",
    name: "subscriptions",
    component: lazy(() => import("@/pages/Subscription")),
    meta: {
      title: "Subscriptions - Daily News",
    },
  },
  {
    path: "/update",
    name: "update",
    component: lazy(() => import("@/pages/Update")),
    meta: {
      title: "Update Profile - Daily News",
    },
  },
  {
    path: "*",
    name: "404",
    component: lazy(() => import("@/pages/Page404")),
    meta: {
      title: "404 Not Found - Daily News",
    },
  },
];

export default routes;
