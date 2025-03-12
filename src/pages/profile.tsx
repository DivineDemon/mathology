import { useEffect, useState } from "react";

import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import CustomToast from "@/components/ui/custom-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetUserQuery,
  usePutUserMutation,
  useUserStatsQuery,
} from "@/store/services/auth";

const Profile = () => {
  const { getToken } = useKindeAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newImage, _] = useState<string>(
    "https://ui.shadcn.com/avatars/04.png"
  );
  const [token, setToken] = useState<string | null>(null);
  const { data } = useGetUserQuery(`${token}`, {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });
  const [editUser, { isLoading }] = usePutUserMutation();
  const [designation, setDesignation] = useState<string>("");
  const { data: stats } = useUserStatsQuery(`${token}`, {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });

  const handleToken = async () => {
    if (getToken) {
      const token = await getToken();
      setToken(`${token}`);
    }
  };

  const handleEdit = async () => {
    const response = await editUser({
      body: {
        name,
        designation,
      },
      token: `${token}`,
    });

    if (response.error) {
      toast.custom(() => (
        <CustomToast
          type="error"
          title="Error"
          description="Something went wrong!"
        />
      ));
    } else {
      toast.custom(() => (
        <CustomToast
          type="success"
          title="Success"
          description="Successfully updated Profile!"
        />
      ));
    }
  };

  useEffect(() => {
    handleToken();
  }, [getToken]);

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setDesignation(data?.designation);
      setEmail(data.email || "");
    }
  }, [data]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-start p-5">
      <div className="flex w-full flex-col gap-5 rounded-3xl bg-white p-5 dark:border-muted dark:bg-muted">
        <div className="flex w-full items-center justify-center border-b pb-5">
          <div className="flex flex-1 items-center justify-between gap-1 lg:gap-2.5">
            <div className="flex flex-col gap-3">
              <span className="text-2xl font-bold lg:text-4xl">My Profile</span>
              <span className="text-sm text-gray-400">
                This information will be displayed publicly, so be careful what
                you share.
              </span>
            </div>
            <Button
              type="button"
              className="text-sm"
              onClick={handleEdit}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 items-start justify-center gap-[20%]">
          <div className="space-y-8">
            <div className="mb-10 flex">
              <img
                src={
                  data?.profile_picture_url
                    ? data.profile_picture_url
                    : newImage !== "https://ui.shadcn.com/avatars/04.png"
                      ? newImage
                      : "https://ui.shadcn.com/avatars/04.png"
                }
                alt="user-dp"
                className="size-32 rounded-full border"
              />
            </div>
            <div className="col-span-1 flex w-full flex-col items-center justify-center gap-2">
              <Label
                htmlFor="name"
                className="w-full text-left text-sm font-medium"
              >
                Name
              </Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border bg-gray-100/20"
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={true}
                className="w-full bg-gray-100"
              />
            </div>
          </div>
          <div className="grid aspect-square grid-cols-2 gap-10">
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-primary/5 p-10">
              <h1 className="text-6xl font-extrabold text-primary">
                {stats?.total_lessons}
              </h1>
              <p className="text-primary">Total Lessons</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-primary/5 p-10">
              <h1 className="text-6xl font-extrabold text-primary">
                {stats?.published_lessons}
              </h1>
              <p className="text-primary">Published Lessons</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-primary/5 p-10">
              <h1 className="text-6xl font-extrabold text-primary">
                {stats?.actual_questions}
              </h1>
              <p className="text-primary">Questions</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-primary/5 p-10">
              <h1 className="text-6xl font-extrabold text-primary">
                {stats?.practice_questions}
              </h1>
              <p className="text-primary">Practice Problems</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
