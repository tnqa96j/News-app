import React, { useState, useCallback } from "react";
import { LoadingContext } from "@/contexts/LoadingContext";
export const LoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-999 bg-black/10"></div>
      )}
    </LoadingContext.Provider>
  );
};
/*
LoadingProvider：isLoading時的全域遮罩
關於在哪裡startLoading和stopLoading可以再想想
*/