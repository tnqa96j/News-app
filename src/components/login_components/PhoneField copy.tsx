import { useVirtualizer } from "@tanstack/react-virtual";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  type CountryCode,
} from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";
import type { PhoneFieldProps } from "@/types/form";
import * as HasFlag from "country-flag-icons/react/3x2";
import { FieldError } from "@/components/ui/field";
import { AsYouType } from "libphonenumber-js";
import { cn } from "@/lib/utils";

interface CountryCodeListHandle {
  scrollToIndex: (
    index: number,
    options?: { align: "start" | "center" | "end" | "auto" },
  ) => void;
}

interface CountryCodeListProps {
  countries: CountryCode[];
  // select action
  selectedIso: CountryCode | "";
  onSelect: (iso: CountryCode) => void;
  // keyboard navigation
  focusIndex: number;
  onFocusedIndexChange: (index: number) => void;
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const countries = getCountries();

const CountryCodeList = forwardRef<CountryCodeListHandle, CountryCodeListProps>(
  (
    { countries, selectedIso, onSelect, focusIndex, onFocusedIndexChange },
    ref,
  ) => {
    const parentRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
      count: countries.length,
      getScrollElement: () => parentRef.current, // 父容器
      estimateSize: () => 44, // 每一項的預估高度 單位是px
      overscan: 5, // 額外渲染上下各5項
    });

    useImperativeHandle(ref, () => ({
      // 使父元件能獲取子元件中的方法(基於ref轉發)
      scrollToIndex: (index, options) =>
        virtualizer.scrollToIndex(index, options),
    }));

    return (
      <div
        ref={parentRef}
        role="listbox" // 告訴螢幕閱讀器這是一個選單列表容器
        aria-label="Select country" // 描述這個列表的用途
        tabIndex={-1} // 使此div可以接收focus但不在tab順序中
        className="h-60 overflow-auto"
      >
        <div
          style={{ height: virtualizer.getTotalSize(), position: "relative" }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const iso = countries[virtualItem.index];
            const Flag = HasFlag[iso];
            const isSelected = iso === selectedIso;
            const isFocus = virtualItem.index === focusIndex;
            return (
              <div
                key={iso}
                role="option" // 代表此div是列表中的一個選項
                aria-selected={isSelected} // 使螢幕閱讀器知道是否被選中
                id={`country-option-${iso}`} // 讓input的aria-activedescendant可以指向這裡
                style={{
                  position: "absolute",
                  top: virtualItem.start,
                  width: "100%",
                  height: 44, // 必須和estimateSize一致，否則item會重疊
                }}
                className={cn(
                  "flex cursor-pointer items-center gap-3 px-3 py-3 hover:bg-accent",
                  isFocus ? "bg-accent" : "",
                  isSelected ? "font-medium text-primary" : "",
                )}
                onClick={() => onSelect(iso)}
                onMouseEnter={() => onFocusedIndexChange(virtualItem.index)} // 滑鼠移入時同步更新 focusedIndex，讓鍵盤和滑鼠 highlight 一致
              >
                {Flag ? (
                  <Flag className="h-3 w-5 shrink-0 shadow-sm" />
                ) : (
                  <span className="h-3 w-5 shrink-0" />
                )}
                <span className="line-clamp-1">{regionNames.of(iso)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

CountryCodeList.displayName = "CountryCodeField";

/* 手機欄位 */
export default function PhoneField({
  setValue,
  getValues,
  defaultIso,
  errors,
}: PhoneFieldProps) {
  const [callingCode, setCallingCode] = useState(""), // Combobox input顯示的文字 => calling code of country code
    [phoneNumber, setPhoneNumber] = useState(""), // Phone input field的值
    [phonePlaceholder, setPhonePlaceholder] = useState("Enter Phone Number"), // Phone input顯示的placeholder
    [open, setOpen] = useState(false), // combobox的開闔狀態
    [search, setSearch] = useState(""), // search keyword
    [focusedIndex, setFocusedIndex] = useState(0); // 儲存當前鍵盤導航focus的選項的index

  const countryCodeFieldRef = useRef<CountryCodeListHandle>(null);

  useEffect(() => {
    (async () => {
      if (defaultIso) {
        setCallingCode(`+${getCountryCallingCode(defaultIso)}`);
        setPhonePlaceholder(
          `${getExampleNumber(defaultIso, examples)?.formatNational()}`,
        );
      }
      setFocusedIndex(0);
    })();
  }, [defaultIso]);

  useEffect(() => {
    setValue("countryCodeISO", defaultIso, { shouldValidate: true });
  }, [defaultIso, setValue]);

  // 透過search過濾country
  const filteredCountries = useMemo(() => {
    if (!search) return countries;

    const lower = search.toLowerCase();
    return countries.filter((c) => {
      const name = regionNames.of(c)?.toLowerCase() ?? "";
      const code = getCountryCallingCode(c);
      return (
        name.includes(lower) ||
        c.toLowerCase().includes(lower) ||
        `+${code}`.includes(lower)
      );
    });
  }, [search]);

  /* Event Handler */
  // 處理combobox開闔邏輯 => 在開啟combobox時檢查目前CountryCodeField有沒有值，如果有則設為search的值
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const iso = getValues("countryCodeISO") as CountryCode | undefined;
      if (iso) {
        setSearch(regionNames.of(iso) ?? "");
      }
    } else {
      setSearch("");
    }
    setOpen(nextOpen);
  };
  // 處理combobox中選項被選中時的邏輯
  const handleSelect = (iso: CountryCode) => {
    setCallingCode(`+${getCountryCallingCode(iso)}`); // Combobox input顯示calling code(ex. +886)
    setValue("countryCodeISO", iso, { shouldValidate: true }); // 將當前ISO值儲存入RHF

    setSearch(""); // 清空search keyword
    setOpen(false); // combobox關閉
    setFocusedIndex(0); // 回復FocusedIndex

    setPhoneNumber(""); // 如果phone number field有輸入，則清除
    setValue("phoneNumber", "", { shouldValidate: true });

    // 取得範例電話號碼並設為phone number field的placeholder
    try {
      const example = getExampleNumber(iso, examples);
      if (example) {
        setPhonePlaceholder(example.formatNational());
        // formatNational() => 得到範例的"本地格式"(和AsYouType格式一致)
      }
    } catch {
      setPhonePlaceholder("Enter Phone Number");
    }

    (document.activeElement as HTMLElement).blur();
  };
  // 處理在phone field輸入時 => format使用者輸入內容
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const iso = getValues("countryCodeISO") as CountryCode | undefined;

    if (iso) {
      const formatter = new AsYouType(iso);
      const formattedPhone = formatter.input(raw);
      setPhoneNumber(formattedPhone);
    }

    // RHF中儲存的是原始輸入，送出時再統一格式化
    setValue("phoneNumber", raw, { shouldValidate: true });
  };
  // 處理鍵盤導航
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault(); // 防止游標在 input 裡移動
        const next = Math.min(focusedIndex + 1, filteredCountries.length - 1);
        setFocusedIndex(next);
        countryCodeFieldRef.current?.scrollToIndex(next, { align: "auto" }); // align: "auto" = 只有在項目不在可視範圍時才捲動
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prev = Math.max(focusedIndex - 1, 0);
        setFocusedIndex(prev);
        countryCodeFieldRef.current?.scrollToIndex(prev, { align: "auto" });
        break;
      }
      case "Enter": {
        e.preventDefault();
        const selected = filteredCountries[focusedIndex];
        if (selected) handleSelect(selected);
        break;
      }
      case "Escape": {
        setOpen(false);
        break;
      }
    }
  };

  const currentIso = getValues("countryCodeISO") as CountryCode | "";

  return (
    <Field className="md:gap-2">
      <FieldLabel htmlFor="phoneNumber" className="text-16-24">
        Phone Number
      </FieldLabel>
      <div className="flex gap-2.5">
        <Combobox open={open} onOpenChange={handleOpenChange}>
          <ComboboxInput
            role="combobox" // 代表是一個結合輸入和下拉選單的元件
            aria-expanded={open} // 選單是否展開(給螢幕閱讀器讀出「展開/收合」)
            aria-haspopup="listbox" // 告知有一個listbox彈出選單
            aria-autocomplete="list" // 輸入會過濾下方的列表
            aria-controls="country-listbox" // 指向 listbox 的 id（給螢幕閱讀器建立關聯）
            aria-activedescendant={
              // 指向目前 focus 的選項 id，讓螢幕閱讀器可以讀出「目前在哪個選項」
              open && filteredCountries[focusedIndex]
                ? `country-option-${filteredCountries[focusedIndex]}`
                : undefined
            }
            value={open ? search : callingCode}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={(e) => open && e.target.select()} // 開啟時全選，讓使用者直接輸入覆蓋，不需要手動清空
            placeholder="Country"
            className="h-10 w-full max-w-28 rounded-base border-base bg-input text-16-20 md:h-14 md:max-w-36"
          />
          <ComboboxContent className="w-54 rounded-base">
            {filteredCountries.length === 0 ? (
              <ComboboxEmpty>No countries found.</ComboboxEmpty>
            ) : (
              <CountryCodeList
                ref={countryCodeFieldRef}
                countries={filteredCountries}
                selectedIso={currentIso}
                focusIndex={focusedIndex}
                onSelect={handleSelect}
                onFocusedIndexChange={setFocusedIndex}
              />
            )}
          </ComboboxContent>
        </Combobox>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder={phonePlaceholder}
          className="rounded-base border-base bg-input text-16-20 md:placeholder-shown:text-[20px]"
          value={phoneNumber}
          onChange={handlePhoneInput}
        />
      </div>
      {"countryCodeISO" in errors && errors.countryCodeISO?.message && (
        <FieldError>{errors.countryCodeISO.message}</FieldError>
      )}
      {"phoneNumber" in errors && errors.phoneNumber?.message && (
        <FieldError>{errors.phoneNumber.message}</FieldError>
      )}
    </Field>
  );
}

// 這個欄位的值要怎麼辦？

/* {
  (country) => {
    // const Flag = HasFlag[country];
    return (
      <ComboboxItem
        key={country}
        value={`${regionNames.of(country)} ${country}`}
        className="text-16-20"
      >
        <div className="flex items-center gap-3 px-1 py-2 hover:cursor-pointer">
          <span className="h-3 w-5">
            <img
              alt={country}
              src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${country}.svg`}
              className="h-full w-full shadow-sm"
            />
            {Flag && (
                 <Flag className="h-3 w-5 shadow-sm" />
                )}
          </span>
          <span>{regionNames.of(country)}</span>
        </div>
      </ComboboxItem>
    );
  };
} */
