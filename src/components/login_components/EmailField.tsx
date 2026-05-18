import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type EmailFieldProps } from "@/types/form";

export default function EmailField({ register, errors }: EmailFieldProps) {
  return (
    <Field className="md:gap-2 mt-5">
      <FieldLabel htmlFor="email" className="text-16-24">
        Email Adress
      </FieldLabel>
      <Input
        id="email"
        type="email"
        placeholder="Enter Email Adress"
        className="rounded-base border-base bg-input text-16-20 md:placeholder-shown:text-[20px]"
        maxLength={254}
        {...register("email")}
      />
      <div className="min-h-5">
        {"email" in errors && errors.email?.message && (
          <FieldError>{errors.email.message}</FieldError>
        )}
      </div>
    </Field>
  );
}
