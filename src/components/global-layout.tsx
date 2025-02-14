import { Outlet } from "react-router-dom";

import AppSidebar from "./app-sidebar";
import { ThemeProvider } from "./theme-provider";
import { SidebarProvider } from "./ui/sidebar";

const Layout = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <SidebarProvider>
        <div className="flex h-full w-full items-center justify-center">
          <AppSidebar />
          <div className="flex h-full w-full flex-col bg-gray-100 transition-[width] dark:bg-sidebar">
            <Outlet />
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default Layout;
