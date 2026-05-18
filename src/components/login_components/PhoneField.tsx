import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  AsYouType,
  type CountryCode,
} from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";
import "flag-icons/css/flag-icons.min.css";
import type { PhoneFieldProps, ISOSelectProps } from "@/types/form";

const REGION_NAMES = new Intl.DisplayNames(["en"], { type: "region" });
const UNSUPPORTED_FLAGS = new Set(["AC", "TA"]); // 顯示不出國旗的國家
const COUNTRY_DATA = getCountries()
  .filter((iso) => !UNSUPPORTED_FLAGS.has(iso))
  .map((iso) => ({
    iso,
    name: REGION_NAMES.of(iso) ?? iso,
    callingCode: `+${getCountryCallingCode(iso)}`,
    Flag: [...iso]
      .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
      .join(""),
  }));

const CountryCodeSelect = ({
  value,
  onChange,
  placeholder = "placeholder",
  className,
}: ISOSelectProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null),
    ulistRef = useRef<HTMLUListElement>(null),
    focusIndexRef = useRef(-1);

  const selected = COUNTRY_DATA.find((c) => c.iso === value);

  // 點擊ul以外區域關閉ul的監聽器
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  // 打開select時，定位到已經選擇的選項
  const handleUlMount = (ul: HTMLUListElement | null) => {
    ulistRef.current = ul;
    if (!ul || !value) return;
    const index = COUNTRY_DATA.findIndex((c) => c.iso === value);
    if (index === -1) return;
    const item = ul.children[index] as HTMLElement;
    if (!item) return;

    focusIndexRef.current = index;
    ul.scrollTop = item.offsetTop - ul.clientHeight / 2 + item.offsetHeight / 2;
  };
  // onSelect
  const handleSelect = (iso: CountryCode) => {
    onChange(iso);
    setOpen(false);
  };
  // 跳過setState導致的re-render，直接操作DOM修改<li>的class
  const setFocusStyle = (index: number) => {
    const ul = ulistRef.current;
    if (!ul) return;

    const prev = ul.children[focusIndexRef.current] as HTMLElement;
    prev?.classList.remove("bg-accent/60");

    const iso = COUNTRY_DATA[index]?.iso;
    if (iso !== value) {
      const next = ul.children[index] as HTMLElement;
      next?.classList.add("bg-accent/60");
    }

    focusIndexRef.current = index;
  };
  // 無障礙（鍵盤）導航邏輯
  const handleKeyDown = (e: React.KeyboardEvent) => {
    let next: number;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        next = Math.min(
          focusIndexRef.current === -1 ? 0 : focusIndexRef.current + 1,
          COUNTRY_DATA.length - 1,
        );
        setFocusStyle(next);
        ulistRef.current?.children[next]?.scrollIntoView({
          block: "nearest",
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        next = Math.max(
          focusIndexRef.current === -1
            ? COUNTRY_DATA.length - 1
            : focusIndexRef.current - 1,
          0,
        );
        setFocusStyle(next);
        ulistRef.current?.children[next]?.scrollIntoView({
          block: "nearest",
        });
        break;
      case "Enter":
        e.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        if (COUNTRY_DATA[focusIndexRef.current])
          handleSelect(COUNTRY_DATA[focusIndexRef.current].iso);
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* 觸發按鈕 */}
      <Button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex items-center gap-1.5 text-16-20! hover:translate-0 hover:cursor-pointer hover:bg-input/70 active:translate-0",
          "focus:border-ring focus:ring-3 focus:ring-ring/50",
          className,
        )}
      >
        {selected ? (
          <span>{selected.callingCode}</span>
        ) : (
          <span>{placeholder}</span>
        )}
        {open ? <ChevronUp /> : <ChevronDown />}
      </Button>

      {/* 下拉選單 */}
      {open && (
        <div className="absolute left-0 z-50 mt-1 w-64 overflow-hidden rounded-base border bg-popover shadow-lg md:w-80">
          <ul
            ref={handleUlMount}
            role="listbox"
            aria-label="Countries"
            className="relative max-h-56 overflow-y-auto py-1 md:max-h-80"
          >
            {COUNTRY_DATA.map((c) => (
              <li
                key={c.iso}
                role="option"
                aria-selected={c.iso === value}
                className={cn(
                  "flex cursor-pointer items-center justify-between px-3 py-3",
                  c.iso === value
                    ? "bg-accent text-primary"
                    : "hover:bg-accent/30",
                )}
                onClick={() => handleSelect(c.iso)}
              >
                <div className="flex gap-3">
                  <span
                    className={cn(`fi fi-${c.iso.toLowerCase()}`, "shadow-2xs")}
                  />
                  <span className="line-clamp-1 text-16-20">{c.name}</span>
                </div>
                <div>{c.iso === value && <Check />}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/* 手機欄位 */
export default function PhoneField({
  setValue,
  getValues,
  defaultIso,
  watchedIso,
  errors,
}: PhoneFieldProps) {
  const [phoneNumber, setPhoneNumber] = useState(""), // Value of PhoneNumber Field
    [phonePlaceholder, setPhonePlaceholder] = useState("Enter Phone Number"); // Placeholder of PhoneNumber Field

  const updatePlaceholder = useCallback((iso: CountryCode) => {
    // 根據當前ISO field的值更新phone field的placeholder
    try {
      const example = getExampleNumber(iso, examples);
      if (example) {
        setPhonePlaceholder(example.formatNational());
        // formatNational() => 得到範例的"本地格式"(和AsYouType格式一致)
      }
    } catch {
      setPhonePlaceholder("Enter Phone Number");
    }
  }, []);

  useEffect(() => {
    if (!defaultIso) return;
    setValue("countryCodeISO", defaultIso, { shouldValidate: true });
    (async () => updatePlaceholder(defaultIso))();
  }, [defaultIso, setValue, updatePlaceholder]);

  /* Event Handler */
  const handleOnSelectChange = (iso: CountryCode) => {
    setValue("countryCodeISO", iso, { shouldValidate: true });
    updatePlaceholder(iso);
    setPhoneNumber("");
    setValue("phoneNumber", "", { shouldValidate: false });
  };
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 處理在phone field輸入時 => format使用者輸入內容
    const raw = e.target.value;
    const iso = getValues("countryCodeISO") as CountryCode | undefined;

    const formattedPhone = iso ? new AsYouType(iso).input(raw) : raw;
    setPhoneNumber(formattedPhone);
    setValue("phoneNumber", formattedPhone, { shouldValidate: true }); // RHF中儲存的是原始輸入，送出時再統一格式化
  };

  return (
    <Field className="mt-5 md:gap-2">
      <FieldLabel htmlFor="phoneNumber" className="text-16-24">
        Phone Number
      </FieldLabel>

      <div className="flex gap-2.5">
        <CountryCodeSelect
          value={watchedIso}
          placeholder="Country"
          className="h-10 max-w-28 rounded-base border-base bg-input px-2.5 text-16-20 md:h-14 md:max-w-36"
          onChange={(iso) => handleOnSelectChange(iso)}
        />
        <Input
          id="phoneNumber"
          type="tel"
          placeholder={phonePlaceholder}
          className="rounded-base border-base bg-input text-16-20 md:placeholder-shown:text-[20px]"
          value={phoneNumber}
          onChange={handlePhoneInput}
          maxLength={20}
        />
      </div>

      <div className="min-h-5">
        {"countryCodeISO" in errors && errors.countryCodeISO?.message && (
          <FieldError>{errors.countryCodeISO.message}</FieldError>
        )}
        {"phoneNumber" in errors && errors.phoneNumber?.message && (
          <FieldError>{errors.phoneNumber.message}</FieldError>
        )}
      </div>
    </Field>
  );
}

/* 重點是select/focus(鍵盤導航)/hover三種狀態下的<li>背景顏色不同 */
