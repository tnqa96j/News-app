import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldGroup, FieldSet } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { GoogleLogo } from "@/components/ui/GoogleLogo";
import NavBar from "@/components/NavBar";
import loginImg from "@/assets/image/login.png";
import LoadingButton from "@/components/LoadingButton";
import PhoneField from "@/components/login_components/PhoneField";
import EmailField from "@/components/login_components/EmailField";
import OtpField from "@/components/login_components/OtpField";

import { useLoginForm } from "@/hooks/useLoginForm";
import { type RouteComponentProps } from "@/router";
import type { CountryCode } from "libphonenumber-js";

export default function Login({ navigate, usp }: RouteComponentProps) {
  const {
    loginType,
    form,
    sendCodeText,
    codeSended,
    defaultIso,
    handleSendCode,
    onSubmit,
    handleTabChange,
    startGoogleLogin,
  } = useLoginForm(navigate, usp);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = form;

  return (
    <div className="main-bg">
      <NavBar title="Login" />

      <div className="grid grid-cols-1 p-base md:gap-10 md:py-17.5 lg:grid-cols-2 lg:gap-22.5 lg:py-32.5">
        {/* title & image */}
        <section className="[Title] hidden md:order-1 md:col-span-full md:flex md:items-center lg:col-span-1 lg:grid">
          <div className="grow">
            <h1 className="text-48-64 font-bold text-primary md:leading-[100%] lg:max-w-85.75">
              Welcome Back!
            </h1>
            <p className="text-[20px] leading-12.5 text-primary">
              Log in for a personalized experience.
            </p>
          </div>

          <div className="lg:place-self-end">
            <img
              src={loginImg}
              className="w-full md:max-w-75 lg:max-w-118"
              alt="LoginImg"
            />
          </div>
        </section>

        {/* login form */}
        <section className="[Login] col-span-full md:order-2 lg:order-2 lg:col-span-1">
          <FieldSet>
            <FieldGroup className="flex w-full">
              {/* tabs */}
              <Tabs defaultValue={loginType} onValueChange={handleTabChange}>
                <TabsList variant="line" className="w-full">
                  <TabsTrigger value="phone" className="text-16-24">
                    Phone Login
                  </TabsTrigger>
                  <TabsTrigger value="email" className="text-16-24">
                    Email Login
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {loginType === "phone" ? (
                <PhoneField
                  setValue={setValue}
                  getValues={getValues}
                  defaultIso={defaultIso}
                  watchedIso={(watch("countryCodeISO") as CountryCode) || ""}
                  errors={errors}
                />
              ) : (
                <EmailField register={register} errors={errors} />
              )}

              {/* verification code */}
              <OtpField
                sendCodeText={sendCodeText}
                codeSended={codeSended}
                onSendCode={handleSendCode}
                setValue={setValue}
                errors={errors}
              />

              <Field>
                <LoadingButton
                  className="h-11.5 w-full shadow-b rounded-full md:h-16.5 dark:text-text-dark"
                  onClick={handleSubmit(onSubmit)}
                >
                  Login
                </LoadingButton>
              </Field>

              <Field>
                <div className="flex items-center gap-4">
                  <div className="h-px grow bg-primary"></div>
                  <span className="text-center text-16-24">or Login with</span>
                  <div className="h-px grow bg-primary"></div>
                </div>
              </Field>

              <Field>
                <Button
                  className="flex h-11.5 w-full items-center gap-4 shadow-b rounded-full bg-white text-16-24 text-primary md:h-16.5"
                  onClick={() => startGoogleLogin()}
                >
                  <GoogleLogo className="size-6 lg:size-10" />
                  Google
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </section>
      </div>
    </div>
  );
}

/*
1. 表單驗證
2. 倒數計時
3. 元件拆分（？
*/

/*
我需要把field換成react hook form的元件嗎？
目前點的時候還是會頓一下
*/

/*
我有很多問題要問：
1. 驗證countrycode的部分我用了libphonenumber-js庫，你覺得ok嗎？
2. 我目前是用shadcn的combobox元件(Gemini推薦，它說combobox的效能比select好)，利用libphonenumber-js取得所有的country code，用迴圈渲染所有的country code，但我目前點擊combobox時還是會頓一下才會出現選單，請問我要怎麼避免這種卡頓？
A：虛擬列表，只渲染當前可見的幾筆
安裝：$ yarn add @tanstack/react-virtual

3. 你可以詳細教我react hook form嗎？我有點看不懂你上面在寫什麼
4. 現在的代碼已經有點太長了，你建議怎麼拆分？（目前這個Login.tsx是Login頁）
5. 我倒數計時的邏輯跟你不一樣應該沒關係吧？
6. 我想根據使用者所在的地方決定contrycode的default value，上面的兩種做法是Gemini教的，你的建議是？
7. 我有點看不懂你寫的loginConfig
8. 我的設計是設計：
選單顯示：Taiwan（國家名稱）
選單選了之後顯示：+886（電話區碼）
背後儲存的值：TW（ISO值）
9. gemini有建議我當使用者切換countryCode時，你可以用 getExampleNumber(country, 'mobile') 獲取該國範例，並把它塞進 phoneNumber 的 placeholder，具體來說要怎麼做呢？

疑問：
1. 我們在前端利用countrycode(ISO)來驗證phoneNumber，那我們需要把countrycode也傳到後端嗎？還是就傳手機號碼就好？還是需要進行什麼處理？
疑慮：例如在台灣是0922222222，如果傳8860922222222是不是反而會打不通啊？
2. 

RHF(React Hook Form)
核心概念：由RHF接管表單的狀態，開發者不需要自己寫useState來儲存每個欄位的值
useForm給的工具：
const {
  register,       // 把欄位「登記」給 RHF 管理（原生input可以使用）
  handleSubmit,   // 點提交時「先驗證」，通過才執行你的 function
  getValues,      // 手動讀取當前表單的值
  setValue,       // 手動設定某個欄位的值（給非原生 input 用）
  trigger,        // 手動觸發某欄位的驗證
  formState: { errors }, // 所有欄位的錯誤訊息
  reset,          // 清空整個表單
} = useForm({
  resolver: zodResolver(schema), // 把 zod schema 接進來當驗證規則
  defaultValues: { email: "", otp: "" },
});

* 對於原生input元件：
register('email')回傳的是 { name, ref, onChange, onBlur }，所以可以直接用展開運算子傳給input
=> 等同於：
<Input
  name="email"
  ref={...}
  onChange={...}
  onBlur={...}   // blur 時觸發驗證
/>
* 對於非原生input元件：
shadcn 的 Select、Combobox、InputOTP 不是原生 <input>，RHF 沒辦法直接用 register 追蹤它們，要手動通知：
<Combobox
  onValueChange={(v) => {
    setValue("countryCodeISO", v, { shouldValidate: true });
    // shouldValidate: true → 設值的同時也觸發驗證
  }}
/>

trigger：局部驗證（可指定），例如：
  const isValid = await trigger(["countryCodeISO", "phoneNumber"]); // 發送驗證碼前，只驗證account欄位
`
handleSubmit：驗證全部欄位

errors：顯示錯誤訊息

---
useVirtualizer的原理：
真實DOM只渲染「目前可見的10幾個DOM節點」
*/

/*
FieldError：代表「一個欄位」的錯誤物件
{
    type: string,
    message: string
}

FieldErrors：代表「整個表單」的錯誤集合
{
    email?:FieldError,
    otp?: FieldError
}
*/
{/* <GoogleLogin
      onSuccess={handleGoogleLogin}
      onError={() => toast.warning("Google login failed.")}
 /> */}
