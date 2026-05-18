import http from "./http";
import { type ApiResponse } from "@/types/api";
import type { IUser } from "@/types/user";

interface LoginData {
  token: string;
}

/*user */
export const queryUserInfo = () =>
  http.get("/api/user/info") as Promise<ApiResponse<IUser>>;

export const updateUserInfo = (data: { name?: string; pic?: string }) =>
  http.patch("/api/user/info", data) as Promise<ApiResponse<IUser>>;

export const uploadAvatar = (
  file: File,
): Promise<ApiResponse<{ pic: string }>> => {
  const formData = new FormData();
  formData.append("file", file);

  return http.post("/api/user/avatar", formData) as Promise<
    ApiResponse<{ pic: string }>
  >;
};

/* send otp & login */
// email
export const sendEmailOtp = (email: string) => {
  return http.post("/api/auth/code/email", { email }) as Promise<ApiResponse>;
};

export const emailLogin = (email: string, code: string) => {
  return http.post("/api/auth/login/email", {
    email,
    code,
  }) as Promise<ApiResponse<LoginData>>;
};

// phone
export const sendPhoneOtp = (phone: string) => {
  return http.post("/api/auth/code/phone", { phone }) as Promise<ApiResponse>;
};

export const phoneLogin = (phone: string, code: string) => {
  return http.post("/api/auth/login/phone", {
    phone,
    code,
  }) as Promise<ApiResponse<LoginData>>;
};

// google
export const googleLogin = (code: string) => {
  return http.post("/api/auth/login/google", {
    code,
  }) as Promise<ApiResponse<LoginData>>;
};
