import http from "@/api/http";
import type { ApiResponse } from "@/types/api";

// api呼叫的底層
export const customBaseQuery = async (args: unknown) => {
  try {
    const config =
      typeof args === "string" ? { url: args } : { ...(args as object) };
    const result = (await http(config)) as ApiResponse<unknown>;

    if (result.code !== 0) {
      return {
        error: {
          status: "CUSTOM_FETCH_ERROR",
          data: result.codeText,
        },
      };
    }

    return { data: result.data ?? null };
  } catch (error: unknown) {
    const err = error as {
      status?: number;
      statusText?: string;
      message?: string;
    };
    return {
      error: {
        status: err.status,
        data: err.statusText || err.message,
      },
    };
  }
};
