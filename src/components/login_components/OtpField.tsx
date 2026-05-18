import { TimerReset } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import type { OtpFieldProps } from "@/types/form";
import { cn } from "@/lib/utils";

export default function OtpField({
  sendCodeText,
  codeSended,
  errors,
  onSendCode,
  setValue,
}: OtpFieldProps) {
  return (
    <Field className="md:gap-2">
      <FieldLabel htmlFor="verificationCode" className="text-16-24">
        Verification Code
      </FieldLabel>

      <div className="flex flex-wrap items-center gap-2.5">
        <InputOTP
          id="otp-verification"
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          containerClassName="w-full flex-[3_4]"
          onChange={(val) => setValue("otp", val, { shouldValidate: true })}
        >
          <InputOTPGroup
            className={cn(
              "w-full flex-1",
              "*:data-[slot=input-otp-slot]:h-10 *:data-[slot=input-otp-slot]:text-[16px]",
              "*:data-[slot=input-otp-slot]:first:rounded-l-[10px] *:data-[slot=input-otp-slot]:last:rounded-r-[10px]",
              "md:*:data-[slot=input-otp-slot]:h-14 md:*:data-[slot=input-otp-slot]:text-[20px]",
              "lg:*:data-[slot=input-otp-slot]:first:rounded-l-[12px] lg:*:data-[slot=input-otp-slot]:last:rounded-r-[12px]",
            )}
          >
            <InputOTPSlot
              index={0}
              className="w-full flex-1 border-base bg-input"
            />
            <InputOTPSlot
              index={1}
              className="w-full flex-1 border-base bg-input"
            />
            <InputOTPSlot
              index={2}
              className="w-full flex-1 border-base bg-input"
            />
          </InputOTPGroup>
          <InputOTPSeparator className="mx-1 flex-none" />
          <InputOTPGroup
            className={cn(
              "w-full flex-1",
              "*:data-[slot=input-otp-slot]:h-10 *:data-[slot=input-otp-slot]:text-[16px]",
              "*:data-[slot=input-otp-slot]:first:rounded-l-[10px] *:data-[slot=input-otp-slot]:last:rounded-r-[10px]",
              "md:*:data-[slot=input-otp-slot]:h-14 md:*:data-[slot=input-otp-slot]:text-[20px]",
              "lg:*:data-[slot=input-otp-slot]:first:rounded-l-[12px] lg:*:data-[slot=input-otp-slot]:last:rounded-r-[12px]",
            )}
          >
            <InputOTPSlot
              index={3}
              className="w-auto flex-1 border-base bg-input"
            />
            <InputOTPSlot
              index={4}
              className="w-full flex-1 border-base bg-input"
            />
            <InputOTPSlot
              index={5}
              className="w-full flex-1 border-base bg-input"
            />
          </InputOTPGroup>
        </InputOTP>

        <Button
          className="h-10 flex-[1_4] rounded-base p-2 lg:h-14 lg:text-[16px] dark:text-text-dark"
          disabled={codeSended}
          onClick={onSendCode}
        >
          {codeSended && <TimerReset />}
          {sendCodeText}
        </Button>
      </div>
      <div className="min-h-5">
        {"otp" in errors && errors.otp?.message && (
          <FieldError>{errors.otp.message}</FieldError>
        )}
      </div>
    </Field>
  );
}
