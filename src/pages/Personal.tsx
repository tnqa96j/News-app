import NavBar from "@/components/NavBar";
import Header from "@/components/Header";
import { ChevronRight, Bell, Star, Moon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useState, useMemo } from "react";
import { useDeviceWidth } from "@/hooks/useDeviceWidth";
import type { RouteComponentProps } from "@/router";
import { useAppDispatch } from "@/store";
import { clearUserInfo } from "@/store/features/userSlice";
import { storage, getformatTimeObject } from "@/assets/utils";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import { useTheme } from "@/contexts/ThemeContext";
import { useDialog } from "@/contexts/DialogContext";
import { cn } from "@/lib/utils";
import { useLoading } from "@/contexts/LoadingContext";

export default function Personal({ navigate }: RouteComponentProps) {
  const dispatch = useAppDispatch(),
    { user: info } = useUser(),
    { isMobile } = useDeviceWidth(),
    { theme, setTheme } = useTheme(),
    { openDialog } = useDialog(),
    { startLoading } = useLoading();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const LIST = [
    {
      icon: Bell,
      title: "Subscription",
      onClick: () => navigate("/subscriptions"),
    },
    {
      icon: Star,
      title: "My Favorites",
      onClick: () => navigate("/favorites"),
    },
    {
      icon: Moon,
      title: "Dark Mode",
      onClick: () => {
        if (isMobile) setIsDrawerOpen(!isDrawerOpen);
      },
    },
    {
      icon: LogOut,
      title: "Log Out",
      onClick: () => {
        openDialog({
          title: "Log out?",
          description:
            "Are you sure you want to log out? You will need to enter your credentials again to sign back in.",
          confirmVariant: "destructive",
          onConfirm: () => {
            // sign out
            startLoading();
            dispatch(clearUserInfo()); // 清除redux中的資訊
            storage.remove("tk"); // 清除token
            navigate("/login?to=/personal", { replace: true }); // 跳轉
            toast.success("Logout successfully", { position: "top-center" });
          },
        });
      },
    },
  ];

  // isDark?
  const isDark = theme === "dark";
  // join time
  const userJoinTime = useMemo(() => {
    if (info?.createdAt) {
      return getformatTimeObject(info?.createdAt);
    }
  }, [info?.createdAt]);

  const toggleTheme = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <div className="main-bg">
      <NavBar title="Personal" />
      <header className="hidden md:block">
        <Header />
      </header>
      <div className="p-base">
        {/* user info */}
        <section
          className="[info] left-to-right mb-6 flex w-full items-center gap-6 rounded-base bg-newsItem-gradient p-5 lg:gap-9 lg:px-12 lg:py-9 dark:left-to-right-dark dark:bg-newsItem-gradient-dark"
          onClick={() => {
            if (isMobile) {
              navigate("/update");
            }
          }}
        >
          <img
            className="size-18.75 circle-base object-cover md:size-30"
            src={info?.pic}
            alt={info?.name}
          />

          <div className="flex grow flex-col">
            <h1 className="text-24-32-40 md:leading-none">{info?.name}</h1>
            <p className="hidden text-[20px] md:block">
              Join in {userJoinTime?.month} {userJoinTime?.day} ,{" "}
              {userJoinTime?.year}
            </p>

            <Button
              className={cn(
                "justify-start bg-transparent px-0 text-16-24 text-text-light",
                "max-md:after:hidden md:h-13 md:place-self-end md:shadow-b md:rounded-full md:bg-primary md:px-19 md:text-[24px] md:text-text-dark",
                "dark:text-text-dark",
              )}
              onClick={() => navigate("/update")}
            >
              Edit Profile
            </Button>
          </div>

          <ChevronRight className="size-7.5 md:hidden" />
        </section>

        {/* list */}
        <section className="border-t border-t-primary text-20-24-32">
          {LIST.map((item) => {
            const Icon = item.icon;
            const isSwitch = item.title === "Dark Mode";
            return (
              <div
                key={item.title}
                onClick={item.onClick}
                className="flex w-full cursor-pointer items-center gap-10 rounded-base p-4 hover:bg-primary/10 lg:p-6"
              >
                <Icon className="size-7.5 shrink-0 lg:size-10" />

                <p className="grow">{item.title}</p>

                {isSwitch ? (
                  <>
                    <Switch
                      checked={isDark}
                      onCheckedChange={toggleTheme}
                      className="hidden md:block"
                    />
                    <ChevronRight className="size-7.5 md:hidden" />
                  </>
                ) : (
                  <ChevronRight className="size-7.5" />
                )}
              </div>
            );
          })}
        </section>
      </div>

      {isMobile && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle></DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <div className="flex items-center justify-between p-base">
              <span className="text-[20px]">Dark Mode</span>
              <Switch checked={isDark} onCheckedChange={toggleTheme} />
            </div>
            <DrawerFooter></DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
