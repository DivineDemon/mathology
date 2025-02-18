import { useEffect, useState } from "react";

import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Loader2, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import LessonCard from "@/components/lesson-card";
import NotFound from "@/components/not-found";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRegisterMutation } from "@/store/services/auth";
import { useGetAllLessonsQuery } from "@/store/services/lesson";

const MyLessons = () => {
  const navigate = useNavigate();
  const [register] = useRegisterMutation();
  const { getToken, user } = useKindeAuth();
  const [token, setToken] = useState<string>("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [standardFilter, setStandardFilter] = useState<string>("");

  const { data, isLoading } = useGetAllLessonsQuery(`${token}`, {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });

  const handleToken = async () => {
    let token: string | undefined = "";

    if (getToken) {
      token = await getToken();
    }

    setToken(token || "");
  };

  const handleUserRegister = async () => {
    if (token) {
      await register({
        body: {
          account_type: "creator",
          email: `${user?.email}`,
          designation: "Content Creator",
          profile_picture_url: `${user?.picture}`,
          name: `${user?.given_name} ${user?.family_name}`,
        },
        token: `${token}`,
      });
    }
  };

  const handleFilter = () => {
    if (!data) return;

    let filteredLessons = [...data];

    if (standardFilter) {
      filteredLessons = filteredLessons.filter(
        (lesson) => lesson.standard_title === standardFilter
      );
    }

    if (searchQuery) {
      filteredLessons = filteredLessons.filter((lesson) =>
        lesson.lesson_title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setLessons(filteredLessons);
  };

  useEffect(() => {
    handleToken();
  }, []);

  useEffect(() => {
    if (token) {
      handleUserRegister();
    }
  }, [token]);

  useEffect(() => {
    if (data) {
      setLessons(data);
    }
  }, [data]);

  useEffect(() => {
    handleFilter();
  }, [searchQuery, standardFilter, data]);

  return (
    <div className="flex h-screen w-full flex-col">
      <nav className="flex h-16 w-full items-center justify-between border-b px-5 py-2.5">
        <div className="flex items-center justify-center gap-4">
          <SidebarTrigger className="block lg:hidden" />
          <div className="text-3xl font-bold lg:text-4xl">My Lessons</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-2 dark:border-gray-700 dark:bg-muted">
            <Search className="size-5 text-primary dark:text-white" />
            <Input
              value={searchQuery}
              placeholder="Search by Topic"
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none bg-transparent shadow-none"
            />
          </div>

          <Select value={standardFilter} onValueChange={setStandardFilter}>
            <SelectTrigger className="w-[180px] border-gray-300 font-semibold dark:border-gray-700">
              <SelectValue placeholder="Standard" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="K1">K1</SelectItem>
              <SelectItem value="K2">K2</SelectItem>
              <SelectItem value="K3">K3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </nav>
      <div className="grid h-full w-full grid-cols-1 items-start justify-start gap-5 overflow-y-auto p-5 md:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          <div className="col-span-1 flex h-full w-full items-center justify-center md:col-span-2 xl:col-span-4">
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>
        ) : lessons.length > 0 ? (
          lessons?.map((lesson, idx) => (
            <LessonCard key={idx} lesson={lesson} token={token} />
          ))
        ) : (
          <div className="col-span-1 flex h-full w-full items-center justify-center md:col-span-2 xl:col-span-4">
            <NotFound />
          </div>
        )}
        <div
          onClick={() => navigate("/dashboard/add-lesson")}
          className="fixed bottom-14 right-10 z-[2] flex size-16 cursor-pointer items-center justify-center rounded-full bg-primary text-white lg:bottom-24 lg:right-8"
        >
          <Plus className="size-8" />
        </div>
      </div>
    </div>
  );
};

export default MyLessons;
