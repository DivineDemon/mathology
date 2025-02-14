import { useEffect, useState } from "react";

import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { CirclePower } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { items } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useGetUserQuery } from "@/store/services/auth";

import { Button } from "./ui/button";
import WarningModal from "./warning-modal";

const AppSidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { getToken, logout } = useKindeAuth();
  const [open, setOpen] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);

  const { data } = useGetUserQuery(`${token}`, {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });

  const handleToken = async () => {
    if (getToken) {
      const token = await getToken();
      setToken(`${token}`);
    }
  };

  useEffect(() => {
    handleToken();
  }, [getToken]);

  return (
    <>
      <WarningModal
        open={open}
        setOpen={setOpen}
        message="Logout"
        cta={logout}
      />

      <Sidebar className="border-r border-gray-300">
        <SidebarHeader className="h-16 border-b border-gray-300 bg-gray-100 dark:bg-sidebar">
          <div className="flex h-full w-full items-center justify-center gap-1.5">
            <span
              className="cursor-pointer text-left text-4xl font-bold text-primary dark:text-white"
              onClick={() => navigate("/")}
            >
              Mathology
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent className="flex w-full flex-col items-center justify-start bg-gray-100 p-2.5 dark:bg-sidebar">
          {items.map((item, idx) => (
            <Link
              to={item.url}
              key={idx}
              className={cn(
                "group flex w-full items-center justify-center gap-2.5 rounded-md px-5 py-3 hover:bg-primary/80 hover:text-white",
                {
                  "bg-primary text-white": pathname === item.url,
                }
              )}
            >
              <img
                src={item.icon}
                alt="item-icon"
                className={cn("size-4 group-hover:invert", {
                  invert: pathname === item.url,
                })}
              />
              <span className="flex-1 text-left text-sm font-bold">
                {item.title}
              </span>
            </Link>
          ))}
        </SidebarContent>

        <SidebarFooter className="w-full border-t border-gray-300 bg-gray-100 pt-2.5 dark:bg-sidebar">
          <div className="flex w-full items-center justify-center gap-2.5">
            <img
              src={`${data?.profile_picture_url}`}
              alt="User"
              className="size-10 shrink-0 cursor-pointer rounded-md border"
              onClick={() => navigate("/profile")}
            />
            <div
              onClick={() => navigate("/profile")}
              className="flex w-32 flex-col items-center justify-center"
            >
              <span className="w-full overflow-hidden truncate text-left font-semibold capitalize">
                {data?.name}
              </span>
              <span className="w-full overflow-hidden truncate text-left text-xs font-light">
                {data?.designation}
              </span>
            </div>
            <Button
              onClick={() => setOpen(true)}
              variant="outline"
              size="icon"
              className="shrink-0 text-red-500"
            >
              <CirclePower />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default AppSidebar;
