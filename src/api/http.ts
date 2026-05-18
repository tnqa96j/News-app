import qs from "qs";
import { toast } from "sonner";
import { storage, isPlainObject } from "@/assets/utils";

type Method =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS"
  | "TRACE"
  | "CONNECT";
type ResponseType = "json" | "text" | "blob" | "arraybuffer";

interface HttpConfig {
  url?: string;
  method?: Method | string;
  credentials?: RequestCredentials;
  headers?: Record<string, string>; // http標頭，固定是一個鍵值對皆為字串型別的物件
  body?: Record<string, unknown> | string | FormData | null; // 發送給後端的request body，通常是不確定裡面有什麼的物件
  params?: Record<string, string | number | boolean> | null; // URL參數
  responseType?: ResponseType;
  signal?: AbortSignal | null;
}

async function http<T>(config: HttpConfig = {}): Promise<T> {
  const defaultConfig: Required<
    Omit<HttpConfig, "url" | "body" | "params" | "signal">
  > &
    Pick<HttpConfig, "url" | "body" | "params" | "signal"> = {
    url: "",
    method: "GET",
    credentials: "include",
    headers: {},
    body: null,
    params: null,
    responseType: "json",
    signal: null,
    ...config,
  };

  const {
    url,
    method,
    credentials,
    headers,
    body,
    params,
    responseType,
    signal,
  } = defaultConfig;

  // 處理URL params(處理url和params)
  if (!url) throw new TypeError("url must be required");
  const finalUrl: string =
    params && isPlainObject(params)
      ? `${url}${url.includes("?") ? "&" : "?"}${qs.stringify(params)}`
      : url;

  // 處理Http method種類
  const finalMethod: string = method.toUpperCase();

  // 處理Request Header
  const finalHeaders: HeadersInit = !isPlainObject(headers)
    ? {}
    : { ...headers };

  // 處理Request body
  let finalBody: BodyInit | null = null;
  if (isPlainObject(body)) {
    finalBody = qs.stringify(body);
    finalHeaders["Content-Type"] = "application/x-www-form-urlencoded";
  } else if (typeof body === "string") {
    finalBody = body;
  } else if (body instanceof FormData) {
    finalBody = body; // 上傳文件的格式是formdata
  }

  // 處理token
  const token = storage.get<string>("tk"); // token是string型別
  if (token) {
    // 只要是打自己後端的 API 就帶 token（含 /api 的路徑）
    // 第三方 API（ipapi.co、Guardian 等）不帶
    const isOwnApi = url.includes("/api/");

    if (isOwnApi) {
      finalHeaders["authorization"] = `Bearer ${token}`;
    }
  }
  /*   const safeList = [
    // 只有在特定api請求時才需要攜帶這個標頭
    "/user",
    "/comments",
  ];
  // url: /api/user_info?xxx=xxx&xxx=xxx...，舉例：reg匹配：[/api,/user_info,...]，$1抓到/user_info
  if (token) {
    const reg = /\/api(\/[^/?#]+)/, // 匹配一連串連續字元直到遇到/、? 或 #
      [, $1] = reg.exec(url) || [];

    const isSafe = $1 && safeList.some((item) => $1.startsWith(item));

    if (isSafe) {
      finalHeaders["authorization"] = `Bearer ${token}`;
    } 
  } */

  // 發送請求
  const fetchOptions: RequestInit = {
    method: finalMethod,
    credentials,
    headers: finalHeaders,
    cache: "no-cache",
    signal,
  };

  // 只有特定請求method才會加入body
  if (/^(POST|PUT|PATCH)$/i.test(finalMethod) && finalBody)
    fetchOptions.body = finalBody;

  try {
    const response = await fetch(finalUrl, fetchOptions); // fetch方法回傳值為Promise<Response>類型
    const { status, statusText } = response;

    if (status >= 200 && status < 400) {
      const type = responseType.toLowerCase();
      let result: unknown;
      switch (type) {
        case "text":
          result = await response.text();
          break;
        case "arraybuffer":
          result = await response.arrayBuffer();
          break;
        case "blob":
          result = await response.blob();
          break;
        default:
          result = await response.json();
          break;
      }
      return result as T;
    }
    return Promise.reject({
      code: -100,
      status,
      statusText,
    });
  } catch (error) {
    // 失敗的統一提示
    toast.warning("Error Occurrs", {
      description: "The network is currently busy. Please try again later.",
      position: "top-center",
      classNames: {
        description: "text-destructive!",
        title: "text-destructive!",
        icon: "text-destructive!",
      },
    });

    return Promise.reject(error);
  }
}

//動態擴充http函式的屬性
type HttpRequestWithoutBody = (
  url: string,
  config?: HttpConfig,
) => Promise<unknown>;
type HttpRequestWithBody = (
  url: string,
  body?: string | Record<string, unknown> | FormData,
  config?: HttpConfig,
) => Promise<unknown>;
const methodWithoutBody = ["get", "head", "delete", "options"] as const; // HttpRequestWithoutBody系請求
const methodWithBody = ["post", "put", "patch"] as const; // HttpRequestWithBody系請求
type HttpClient = typeof http &
  Record<(typeof methodWithBody)[number], HttpRequestWithBody> &
  Record<(typeof methodWithoutBody)[number], HttpRequestWithoutBody>;

const httpClient: HttpClient = http as HttpClient;

methodWithoutBody.forEach((m) => {
  httpClient[m] = (url: string, config: HttpConfig = {}): Promise<unknown> => {
    return http({ ...config, url, method: m.toUpperCase() });
  };
});

methodWithBody.forEach((m) => {
  httpClient[m] = (
    url: string,
    body: string | Record<string, unknown> | undefined | FormData,
    config: HttpConfig = {},
  ): Promise<unknown> => {
    return http({ ...config, url, body, method: m.toUpperCase() });
  };
});

export default httpClient;
