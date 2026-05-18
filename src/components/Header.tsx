import { Search, User } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "./ui/input-group";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Logo from "@/assets/image/N.png";

import { cn } from "@/lib/utils";
import { getformatTimeObject } from "@/assets/utils";

import { useDeviceWidth } from "@/hooks/useDeviceWidth";
import { useUser } from "@/hooks/useUser";

import { useState } from "react";
import { useAppSelector } from "@/store";

import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const [search, setSearch] = useState(""),
    [sheetOpen, setSheetOpen] = useState(false);

  const { isDesktop } = useDeviceWidth(),
    { isLoggedIn } = useUser();

  const { info } = useAppSelector((state) => state.user);

  const time = getformatTimeObject(new Date());

  // 導航相關
  const navigate = useNavigate(),
    { pathname } = useLocation();
  const isActive = (path: string) => pathname === path;

  /* 根據網址改變list group的狀態顏色 */
  const handleSearch = (
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<HTMLButtonElement>,
  ) => {
    if ("key" in e && e.key !== "Enter") return;
    const q = search.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setSheetOpen(false);
  };

  return (
    <div className="flex items-center justify-between px-5 py-2 md:justify-start md:px-7.5 md:py-5 xl:px-10 xl:py-7.5">
      {/* Logo */}
      <img
        className="hidden size-12.5 md:block md:flex-none"
        src={Logo}
      />
      {/* date */}
      <section className="flex flex-col items-center md:hidden">
        <p className="text-[24px]">{time.day}</p>
        <p className="text-[12px]">{time.month.toUpperCase().slice(0, 3)}</p>
      </section>
      {/* list group */}
      <section className="hidden md:ml-12.5 md:flex md:flex-auto md:gap-11.25 md:self-end">
        <div
          className={cn(
            "hover-base text-[20px]",
            isActive("/") && "text-primary",
          )}
          onClick={() => navigate("/")}
        >
          Latest News
        </div>
        <div
          className={cn(
            "hover-base text-[20px]",
            isActive("/subscriptions") && "text-primary",
          )}
          onClick={() => navigate("/subscriptions")}
        >
          Subscription
        </div>
        <div
          className={cn(
            "hover-base text-[20px]",
            isActive("/favorites") && "text-primary",
          )}
          onClick={() => navigate("/favorites")}
        >
          Favorites
        </div>
      </section>

      {/* Search Bar & Avatar */}
      <section className="flex items-center gap-5">
        {/* Search Bar = Search Icon + Input Field */}
        {isDesktop ? (
          <div
            className={cn(
              "group flex items-center",
              "size-12.5 rounded-base border border-transparent",
              "focus-within:w-64 focus-within:border-primary focus-within:bg-input",
              "hover:w-64 hover:border-primary hover:bg-input",
              "transition-all duration-500 ease-in-out",
            )}
          >
            <span
              className={cn(
                "flex shrink-0 items-center justify-center",
                "size-8 lg:size-10",
                "transition-all duration-500",
              )}
            >
              <Search
                className={cn(
                  "size-10 shrink-0 text-primary",
                  "group-focus-within:size-6 group-hover:size-6",
                  "transition-all duration-500 ease-in-out",
                )}
              />
            </span>

            <Input
              id="search"
              type="search"
              placeholder="Search news..."
              className={cn(
                "w-0 rounded-base border-none bg-transparent! pl-0! text-16-20 opacity-0 outline-none placeholder:text-primary/60",
                "group-hover:w-full group-hover:pr-4 group-hover:opacity-100",
                "group-focus-within:w-full group-focus-within:pr-4 group-focus-within:opacity-100",
                "focus-visible:border-none focus-visible:ring-0 focus-visible:ring-transparent",
                "transition-all duration-500 ease-in-out",
              )}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
        ) : (
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Search className="size-8 cursor-pointer text-primary lg:size-10" />
            </SheetTrigger>

            <SheetContent>
              <SheetHeader>
                <SheetTitle></SheetTitle>
                <SheetDescription></SheetDescription>
              </SheetHeader>

              <div className="p-base">
                <InputGroup className="h-10 w-full gap-2 rounded-base border-base bg-input pl-2 text-16-20 placeholder:text-primary md:h-14 md:placeholder-shown:text-[20px]">
                  <InputGroupAddon>
                    <Search className="size-8 text-primary" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="search"
                    type="search"
                    placeholder="Search news..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearch}
                  />
                  <InputGroupButton
                    className="h-full px-4 dark:text-text-dark"
                    variant="secondary"
                    onClick={handleSearch}
                  >
                    Search
                  </InputGroupButton>
                </InputGroup>
              </div>

              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline" className="rounded-full">
                    Close
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        )}

        {/* avatar */}
        {isLoggedIn ? (
          <Link to={{ pathname: `/personal` }}>
            <img
              alt={info?.name}
              src={info?.pic}
              className="size-8 circle-base object-cover md:flex-none lg:size-10"
            />
          </Link>
        ) : (
          <Link to={{ pathname: `/login` }}>
            <User className="size-8 rounded-full text-primary hover:bg-primary/30 md:flex-none lg:size-10" />
          </Link>
        )}
      </section>
    </div>
  );
}
