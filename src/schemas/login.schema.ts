import { z } from "zod";
import { isValidPhoneNumber, type CountryCode } from "libphonenumber-js";

export const phoneLoginSchema = z
  .object({
    countryCodeISO: z.string().min(1, "Country code is required"), // ISO國碼
    phoneNumber: z.string().min(1, "Phone number is required."),
    otp: z.string().length(6, "Please enter the 6-digit verification code."),
  })
  .superRefine((data, ctx) => {
    if (data.countryCodeISO && data.phoneNumber) {
      const isValid = isValidPhoneNumber(
        data.phoneNumber,
        data.countryCodeISO as CountryCode,
      );

      if (!isValid) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid mobile number",
          path: ["phoneNumber"],
        });
      }
    }
  });

export const emailLoginSchema = z.object({
  email: z.email("Please enter a valid email address."),
  otp: z.string().length(6, "Please enter the 6-digit verification code."),
});

export type PhoneLoginForm = z.infer<typeof phoneLoginSchema>;
export type EmailLoginForm = z.infer<typeof emailLoginSchema>;

/* 
ctx = context = 上下文 
在 Zod 的 .superRefine() 或 .transform() 裡面，Zod 會提供這個 ctx 物件給你
.superRefine() / .refine() => 自訂驗證邏輯
.superRefine() => 跨欄位驗證

z.string() => 預設允許空字串
.min(1) => 確保字串不可為空

z.infer => 兩者聯集，讓元件可以同時用

設計：
選單顯示：Taiwan
選單選了之後顯示：+886
背後儲存的值：TW

國旗：使用country-flag-icons庫
$yarn add country-flag-icons

import { getCountries, getCountryCallingCode } from "libphonenumber-js";
const countries = getCountries(); // 取得所有 ISO 國碼清單: ["TW", "US", "JP", ...]

當使用者切換countryCode時，你可以用 getExampleNumber(country, 'mobile') 獲取該國範例，並把它塞進 phoneNumber 的 placeholder
zod + libphonenumber-js

*/
