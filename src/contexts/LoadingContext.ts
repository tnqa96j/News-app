import React, { useContext } from "react";

interface LoadingContextType {
    isLoading: boolean;
    startLoading:() => void;
    stopLoading: () => void;
}

export const LoadingContext = React.createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if(!context) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
}
