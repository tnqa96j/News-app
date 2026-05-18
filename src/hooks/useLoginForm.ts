/* 登入表單邏輯 */
import {
  emailLoginSchema,
  phoneLoginSchema,
  type EmailLoginForm,
  type PhoneLoginForm,
} from "@/schemas/login.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef } from "react";
import {
  sendEmailOtp,
  sendPhoneOtp,
  emailLogin,
  phoneLogin,
  googleLogin,
} from "@/api";
import { getErrorMessage, storage, toastError } from "@/assets/utils";
import { toast } from "sonner";
import { useLoading } from "@/contexts/LoadingContext";
// import { type CredentialResponse } from "@react-oauth/google";
import type { RouteComponentProps } from "@/router";
import { useAppDispatch } from "@/store";
import { queryUserInfoAsync } from "@/store/features/userSlice";
import {
  type CountryCode,
  parsePhoneNumberFromString,
  isSupportedCountry,
} from "libphonenumber-js";
import { getCountryForTimezone } from "countries-and-timezones";
import { useGoogleLogin, type CodeResponse } from "@react-oauth/google";

type LoginType = "phone" | "email";
type FormState = {
  countryCodeISO: string;
  phoneNumber: string;
  email: string;
  otp: string;
};

const LOGIN_CONFIG = {
  phone: {
    getAccount: (s: FormState) => {
      const parsed = parsePhoneNumberFromString(
        s.phoneNumber,
        s.countryCodeISO as CountryCode,
      );
      return parsed?.format("E.164") ?? s.phoneNumber;
    },
    sendOtp: sendPhoneOtp,
    login: phoneLogin,
  },
  email: {
    getAccount: (s: FormState) => s.email,
    sendOtp: sendEmailOtp,
    login: emailLogin,
  },
};

// 根據使用者位置決定國碼預設值
const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone,
  DEFAULT_COUNTRY = getCountryForTimezone(TIMEZONE),
  RAW_ISO = DEFAULT_COUNTRY?.id,
  DEFAULT_ISO =
    RAW_ISO && isSupportedCountry(RAW_ISO) ? (RAW_ISO as CountryCode) : "TW";

export const useLoginForm = (
  navigate: RouteComponentProps["navigate"],
  usp: RouteComponentProps["usp"],
) => {
  const [loginType, setLoginType] = useState<LoginType>("phone"),
    [sendCodeText, setSendCodeText] = useState<string>("Send Code"),
    [codeSended, setCodeSended] = useState<boolean>(false);

  const { startLoading, stopLoading } = useLoading();
  const dispatch = useAppDispatch();

  const schema = loginType === "phone" ? phoneLoginSchema : emailLoginSchema;
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      countryCodeISO: "",
      phoneNumber: "",
      email: "",
      otp: "",
    },
  });

  /* countdown */
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const numRef = useRef<number>(61);

  const countdown = () => {
    numRef.current--;
    if (numRef.current === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setSendCodeText("Send Code");
      setCodeSended(false);
      numRef.current = 61;
      return;
    }
    setSendCodeText(`${numRef.current} s`);
  };
  // 元件釋放時將timer清除
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // when tab switch login type
  const handleTabChange = (val: string) => {
    setLoginType(val as LoginType);

    // 清空所有欄位和錯誤
    form.reset();

    // 重置倒數狀態&計時器
    setCodeSended(false);
    setSendCodeText("Send Code");
    if (timerRef.current) clearInterval(timerRef.current); // 清空計時器
    numRef.current = 61;
  };
  // when login successfully
  const handleLoginSuccess = async (token: string, codeText: string) => {
    /*
    1. save token to localstorage
    2. update userInfo in redux
    3. show successful tip
    4. navigate to other page
    */
    storage.set("tk", token);
    await dispatch(queryUserInfoAsync());
    toast.success(codeText, {
      position: "top-center",
    });
    const to = usp.get("to");
    if (to) {
      navigate(to, { replace: true });
    } else {
      navigate(-1);
    }
  };
  // send verify code => only validate "account" field
  const handleSendCode = async () => {
    // 1. validate account (phone/email) field
    const fieldToValidate =
      loginType === "phone"
        ? (["countryCodeISO", "phoneNumber"] as const)
        : (["email"] as const);
    const isValid = await form.trigger(fieldToValidate);
    if (!isValid) { // 有錯誤就不繼續，錯誤會自動顯示在 FieldError
      toastError(
        "Fail to Send Verification Code",
        "Invalid phone number or email",
      );
      return;
    }

    // 2. get correct account value and api through react hook form
    const values = form.getValues(),
      config = LOGIN_CONFIG[loginType],
      account = config.getAccount(values as FormState);

    // 3. disable send code button
    setCodeSended(true); // prevent dbclick
    try {
      // 4. call send code api
      const { code, codeText } = await config.sendOtp(account);
      if (code === 0) {
        toast.success(codeText, {
          position: "top-center",
        });
        // 5. start countdown
        countdown();
        if (!timerRef.current) timerRef.current = setInterval(countdown, 1000);
      } else {
        setCodeSended(false);
        toastError("Fail to Send Verification Code", codeText);
      }
    } catch (error) {
      setCodeSended(false);
      toastError("Fail to Send Verification Code", getErrorMessage(error));
    }
  };
  // login => validate all field include account, otp
  const onSubmit = async (values: PhoneLoginForm | EmailLoginForm) => {
    // 1. validate account (phone/email) + otp field => 這裡不需要再寫驗證，因為呼叫handleSubmit(onSubmit)時，handleSubmit會先進行驗證，通過了才會執行onSubmit
    startLoading();
    // 2. get correct account value and api through react hook form
    const config = LOGIN_CONFIG[loginType],
      account = config.getAccount(values as FormState);

    try {
      // 3. call send code api
      const { code, codeText, data } = await config.login(account, values.otp);
      if (code === 0 && data) {
        await handleLoginSuccess(data.token, codeText);
      } else {
        toastError("Fail to Send Verification Code", codeText);
      }
    } catch (error) {
      toastError("Fail to Send Verification Code", getErrorMessage(error));
    } finally {
      stopLoading();
    }
  };
  // Google Login
  const handleGoogleLogin = async (codeResponse: CodeResponse) => {
    if (!codeResponse.code) return;
    startLoading();
    try {
      // call send code api
      const { code, codeText, data } = await googleLogin(codeResponse.code);
      if (code === 0 && data) {
        await handleLoginSuccess(data.token, codeText);
      } else {
        toastError("Google Login Failed", codeText);
      }
    } catch (error) {
      toastError("Google Login Failed", getErrorMessage(error));
    } finally {
      stopLoading();
    }
  };
  const startGoogleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: handleGoogleLogin,
    onError: (error) =>
      toastError("Google Login Failed", getErrorMessage(error)),
  });

  return {
    defaultIso: DEFAULT_ISO,
    sendCodeText,
    codeSended,
    loginType,
    form,
    handleSendCode,
    onSubmit,
    handleTabChange,
    startGoogleLogin,
  };
};
