import { useAppSelector } from "@/store";

export const useUser = () => {
  const { info, status } = useAppSelector((state) => state.user);
  return {
    user: info,
    isLoggedIn: !!info,
    isLoading: status === "loading",
  };
};
