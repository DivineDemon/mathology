import { useEffect, useState } from "react";

import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useGetUserQuery } from "@/store/services/auth";

const Profile = () => {
  const { getToken } = useKindeAuth();
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
    <div className="flex h-screen w-full flex-col items-center justify-start">
      <nav className="flex h-16 w-full items-center justify-between border-b p-5">
        <div className="flex items-center justify-center gap-4">
          <SidebarTrigger className="block lg:hidden" />
          <div className="text-3xl font-bold lg:text-4xl">Profile</div>
        </div>
      </nav>
      <div className="h-full w-full p-5">
        <div className="flex w-full flex-col gap-5 rounded-3xl bg-white p-5 dark:border-muted dark:bg-muted">
          <div className="flex w-full items-center justify-center border-b pb-5">
            <div className="flex flex-1 flex-col items-start gap-1 lg:gap-2.5">
              <span className="text-2xl font-bold lg:text-4xl">My Profile</span>
              <span className="text-sm text-gray-400">
                This information will be displayed publicly, so be careful what
                you share.
              </span>
            </div>
            <img
              src={`${data?.profile_picture_url}`}
              alt="user-dp"
              className="size-20 rounded-full border"
            />
          </div>
          <div className="grid w-full grid-cols-3 items-center justify-center gap-5">
            <div className="col-span-1 flex w-full flex-col items-center justify-center gap-2">
              <Label
                htmlFor="name"
                className="w-full text-left text-sm font-medium"
              >
                Name
              </Label>
              <Input
                type="text"
                value={data?.name}
                disabled={true}
                className="w-full bg-gray-100 capitalize"
              />
            </div>
            <div className="col-span-1 flex w-full flex-col items-center justify-center gap-2">
              <Label
                htmlFor="email"
                className="w-full text-left text-sm font-medium"
              >
                Email
              </Label>
              <Input
                type="email"
                value={data?.email}
                disabled={true}
                className="w-full bg-gray-100"
              />
            </div>
            <div className="col-span-1 flex w-full flex-col items-center justify-center gap-2">
              <Label
                htmlFor="designation"
                className="w-full text-left text-sm font-medium"
              >
                Designation
              </Label>
              <Input
                type="text"
                value={data?.designation}
                disabled={true}
                className="w-full bg-gray-100"
              />
            </div>
            <div className="col-span-1 flex w-full flex-col items-center justify-center gap-2">
              <Label
                htmlFor="account_type"
                className="w-full text-left text-sm font-medium"
              >
                Account Type
              </Label>
              <Input
                type="text"
                value={data?.account_type}
                disabled={true}
                className="w-full bg-gray-100 capitalize"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
