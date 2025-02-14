import { ReactNode } from "react";

import { KindeProvider } from "@kinde-oss/kinde-auth-react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import store from "@/store";

import { ThemeProvider } from "./theme-provider";
import { SidebarProvider } from "./ui/sidebar";
import { Toaster } from "./ui/sonner";
import { TooltipProvider } from "./ui/tooltip";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <KindeProvider
      clientId={`${import.meta.env.VITE_KINDE_CLIENT_ID}`}
      domain={`${import.meta.env.VITE_KINDE_AUTH_DOMAIN}`}
      logoutUri={window.location.origin}
      redirectUri={`${window.location.origin}/dashboard`}
      isDangerouslyUseLocalStorage={true}
    >
      <Provider store={store}>
        <ThemeProvider defaultTheme="light">
          <SidebarProvider>
            <BrowserRouter>
              <Toaster
                richColors={true}
                toastOptions={{
                  duration: 1500,
                  className: "bg-transparent",
                }}
              />
              <TooltipProvider>{children}</TooltipProvider>
            </BrowserRouter>
          </SidebarProvider>
        </ThemeProvider>
      </Provider>
    </KindeProvider>
  );
};

export default Providers;
