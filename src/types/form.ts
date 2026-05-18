import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormGetValues,
  FieldErrors,
} from "react-hook-form";
import type { PhoneLoginForm, EmailLoginForm } from "@/schemas/login.schema";
import type { CountryCode } from "libphonenumber-js";

export type LoginFormValues = PhoneLoginForm | EmailLoginForm;

export interface ISOSelectProps {
  value: CountryCode | ''; // RHF中儲存的ISO Field值
  onChange: (iso: CountryCode) => void; // 選項改變時
  placeholder?: string; // ISO Field的placeholder
  className?: string; // ISO Field的樣式
}

export interface PhoneFieldProps {
  setValue: UseFormSetValue<LoginFormValues>;
  getValues: UseFormGetValues<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
  defaultIso: CountryCode;
  watchedIso: CountryCode;
}

export interface EmailFieldProps {
  register: UseFormRegister<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
}

export interface OtpFieldProps {
  setValue: UseFormSetValue<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
  onSendCode: () => void;
  sendCodeText: string;
  codeSended: boolean;
}
