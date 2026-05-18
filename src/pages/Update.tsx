import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import type { RouteComponentProps } from "@/router";
import { useUser } from "@/hooks/useUser";
import { useState } from "react";
import { useAppDispatch } from "@/store";
import { useLoading } from "@/contexts/LoadingContext";
import { toastError } from "@/assets/utils";
import { updateUserInfo, uploadAvatar } from "@/api";
import { toast } from "sonner";
import { queryUserInfoAsync } from "@/store/features/userSlice";
import LoadingButton from "@/components/LoadingButton";
import { Spinner } from "@/components/Spinner";
import { useDeviceWidth } from "@/hooks/useDeviceWidth";

interface InfoField {
  name?: string;
  pic?: string;
}

export default function Update({ navigate }: RouteComponentProps) {
  /* GlobalState */
  const { user: info } = useUser(),
    { isDesktop } = useDeviceWidth(),
    { startLoading, stopLoading } = useLoading();
  const dispatch = useAppDispatch();

  /* LocalState */
  const [name, setName] = useState(info?.name),
    [pic, setPic] = useState(info?.pic),
    [isUploading, setIsUploading] = useState(false),
    [errors, setErrors] = useState<InfoField>({});

  const validateFields = (): boolean => {
    const newErrors: InfoField = {};
    if (!name?.trim()) newErrors.name = "Username is required.";
    if (!pic) newErrors.pic = "Avatar is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // 沒有錯誤才回傳true
  };

  /* Event Handler */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // image size limit : 2mb
    const limit = 2 * 1024 * 1024;
    if (file.size > limit) {
      toastError("Image must be less than 5MB");
      return;
    }

    // 立即顯示本地預覽（不等上傳完成）
    const localPreview = URL.createObjectURL(file);
    setPic(localPreview);

    // 上傳到Cloudinary
    setIsUploading(true);
    try {
      const res = await uploadAvatar(file);
      if (res.code === 0 && res.data) {
        setPic(res.data.pic); // 存取傳回的Cloudinary URL
        setErrors((prev) => ({ ...prev, pic: undefined })); // avatar上傳成功時清除pic錯誤
        // toast.success("Image uploaded", { position: "top-center" });
      } else {
        toastError(res.codeText);
        setPic(info?.pic); // 上傳失敗，恢復原圖
      }
    } catch (error) {
      console.log(error);
      toastError("Upload failed");
      setPic(info?.pic);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(localPreview); // 釋放記憶體
    }
  };

  const handleRemovePic = () => {
    setPic("");
    if (errors.pic) setErrors((prev) => ({ ...prev, pic: undefined })); // 移除圖片時清除pic錯誤
  };

  const handleSubmit = async () => {
    // 先驗證欄位
    if (!validateFields()) return;

    startLoading();
    try {
      const res = await updateUserInfo({
        name,
        pic,
      });

      if (res.code === 0 && res.data) {
        await dispatch(queryUserInfoAsync()).unwrap();
        toast.success("Profile updated", { position: "top-center" });
        navigate(-1);
      } else {
        toastError(res.codeText);
      }
    } catch {
      toastError("Update failed");
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="main-bg">
      <NavBar title="Edit Profile" />
      <header className="hidden md:block">
        <Header />
      </header>

      <FieldSet>
        <FieldGroup className="p-base lg:gap-10">
          <h1 className="hidden text-48-64 md:block">Edit Profile</h1>
          {/* avatar */}
          <Field className="md:grid md:grid-cols-2 md:items-center">
            <div className="md:col-span-1 md:max-w-100">
              <FieldLabel className="text-20-24-32">Avatar</FieldLabel>
              <FieldDescription className="lg:text-[16px]">
                Supports .jpg, .jpeg, and .png formats. Max 2MB.
              </FieldDescription>
            </div>

            <div className="flex gap-5 py-3">
              {/* preview image */}
              {pic ? (
                <div className="relative size-18.75 rounded-base border-base bg-primary lg:size-30">
                  <img
                    alt={name}
                    src={pic}
                    className="h-full w-full rounded-base object-cover"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-base bg-black/40">
                      <Spinner className="size-6 text-white" />
                    </div>
                  )}
                  <Button
                    size={isDesktop ? "icon-lg" : "icon-xs"}
                    className="absolute -top-1.5 -right-1.5 rounded-full border-base bg-red-600 lg:-top-3 lg:-right-3"
                    onClick={handleRemovePic}
                    disabled={isUploading}
                  >
                    <X className="size-3 lg:size-4.5 dark:text-text-dark" />
                  </Button>
                </div>
              ) : (
                <label className="flex size-18.75 cursor-pointer items-center justify-center rounded-base border-2 border-dashed border-primary/30 bg-secondary/50 transition-all hover:border-primary hover:bg-secondary lg:size-30">
                  <Plus className="size-8 text-primary/60" />
                  <Input
                    type="file"
                    className="hidden"
                    accept="image/jpg,image/jpeg,image/png"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>

            {errors.pic && (
              <FieldError className="md:col-start-2">{errors.pic}</FieldError>
            )}
          </Field>

          {/* name */}
          <Field className="md:grid md:grid-cols-2 md:items-center">
            <div className="md:max-w-100 md:grid-cols-1">
              <FieldLabel className="text-20-24-32">Username</FieldLabel>
              <FieldDescription className="lg:text-[16px]">
                Must be 20 characters or less.
              </FieldDescription>
            </div>

            <Input
              id="username"
              type="text"
              className="rounded-base border-base bg-secondary text-16-20-24 placeholder:text-primary md:max-w-120 md:placeholder-shown:text-[20px] lg:placeholder-shown:text-[24px]"
              placeholder="Enter username"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name)
                  setErrors((prev) => ({ ...prev, name: undefined })); // 在使用者改動欄位時清除對應的錯誤
              }}
              maxLength={20}
            />
            {errors.name && (
              <FieldError className="md:col-start-2">{errors.name}</FieldError>
            )}
          </Field>

          <Field></Field>
          <Field></Field>

          <Field>
            <LoadingButton
              variant="default"
              type="submit"
              className="my-11 w-full max-w-70 place-self-center shadow-b rounded-full md:my-6 dark:text-text-dark"
              disabled={isUploading}
              onClick={handleSubmit}
            >
              Save
            </LoadingButton>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
/*
有沒有辦法充分使用FieldError？
目前想到的有：
1. avatar欄位是空的
2. name欄位是空的
3. 其他沒想到
*/
