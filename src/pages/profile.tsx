import { useEffect, useState } from "react";

import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { CopyCheck, Loader2 } from "lucide-react";

import Edit from "@/assets/img/edit-2.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
// import { parseImage } from "@/lib/utils";
import { useGetUserQuery, usePutUserMutation } from "@/store/services/auth";

const Profile = () => {
  const { getToken } = useKindeAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // const imageRef = useRef<HTMLInputElement>(null);
  const [newImage, _] = useState<string>(
    "https://ui.shadcn.com/avatars/04.png"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [designation, setDesignation] = useState<string>("");

  const { data, isLoading } = useGetUserQuery(`${token}`, {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });

  const [editUser, { isLoading: updating }] = usePutUserMutation();

  const handleToken = async () => {
    if (getToken) {
      const token = await getToken();
      setToken(`${token}`);
    }
  };

  const handleEdit = async () => {
    await editUser({
      body: {
        name,
        designation,
      },
      token: `${token}`,
    });

    setIsEditing(!isEditing);
  };

  // const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     const file = e.target.files[0];
  //     const imageUrl = await parseImage(file);
  //     setNewImage(imageUrl as string);
  //   }
  // };

  useEffect(() => {
    handleToken();
  }, [getToken]);

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setDesignation(data?.designation);
      setEmail(data.email || "");
      // if (data.profile_picture_url) {
      //   setNewImage(data.profile_picture_url);
      // }
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
            <div className="flex items-center gap-3">
              <Button
                type="button"
                className="text-sm"
                onClick={handleEdit}
                disabled={isLoading}
              >
                {isEditing ? (
                  updating ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <CopyCheck /> Save
                    </>
                  )
                ) : (
                  <>
                    <img src={Edit} alt="edit" /> Edit Profile{" "}
                  </>
                )}
              </Button>
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  className="text-sm"
                  disabled={updating}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="mr-auto flex items-end justify-end gap-5">
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
          {/* <input
            ref={imageRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
          />
          {isEditing && (
            <Button
              size="sm"
              type="button"
              variant="default"
              onClick={() => {
                if (imageRef.current) {
                  imageRef.current.click();
                }
              }}
            >
              Update Image
            </Button>
          )} */}
        </div>
        <div className="grid w-full grid-cols-2 items-center justify-center gap-5">
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
              disabled={!isEditing ? true : false}
              className={cn(
                "w-full border bg-gray-100/20",
                !isEditing && "cursor-not-allowed border-none bg-gray-100"
              )}
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
          <div className="col-span-1 flex w-full flex-col items-center justify-center gap-2">
            <Label
              htmlFor="designation"
              className="w-full text-left text-sm font-medium"
            >
              Designation
            </Label>
            <Input
              type="text"
              value={designation}
              disabled={!isEditing ? true : false}
              onChange={(e) => setDesignation(e.target.value)}
              className={cn(
                "w-full border bg-gray-100/20",
                !isEditing && "cursor-not-allowed border-none bg-gray-100"
              )}
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
          <div className="col-span-1 flex w-full flex-col items-center justify-center gap-2">
            <Label
              htmlFor="total_question"
              className="w-full text-left text-sm font-medium"
            >
              Total Questions
            </Label>
            <Input
              type="text"
              value={data?.total_question}
              disabled={true}
              className="w-full bg-gray-100 capitalize"
            />
          </div>
          <div className="col-span-1 flex w-full flex-col items-center justify-center gap-2">
            <Label
              htmlFor="total_lesson"
              className="w-full text-left text-sm font-medium"
            >
              Total Lessons
            </Label>
            <Input
              type="text"
              value={data?.total_lesson}
              disabled={true}
              className="w-full bg-gray-100 capitalize"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
