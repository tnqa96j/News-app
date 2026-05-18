// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { LoadingProvider } from "./contexts/providers/LoadingProvider.tsx";
import { DialogProvider } from "./contexts/providers/DialogProvider.tsx";
import { ThemeProvider } from "./contexts/providers/ThemeProvider.tsx";
import App from "./App.tsx";
import { Provider } from "react-redux";
import store from "./store/index.ts";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ThemeProvider defaultTheme="light">
      <LoadingProvider>
        <DialogProvider>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <App />
          </GoogleOAuthProvider>
        </DialogProvider>
      </LoadingProvider>
    </ThemeProvider>
  </Provider>,
);
