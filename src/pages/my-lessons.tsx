import { useEffect, useState } from "react";

import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Loader2, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

// import NotFound from "@/components/not-found";
import CreateFirst from "@/components/create-first-lesson";
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
import { useGetAllCoursesQuery } from "@/store/services/course";
import { useGetAllLessonsQuery } from "@/store/services/lesson";

const MyLessons = () => {
  const navigate = useNavigate();
  const [register] = useRegisterMutation();
  const { getToken, user } = useKindeAuth();
  const [token, setToken] = useState<string>("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [standardFilter, setStandardFilter] = useState<string>("");
  const [courseFilter, setCourseFilter] = useState<string>("");

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

    if (standardFilter && standardFilter !== "All") {
      filteredLessons = filteredLessons.filter(
        (lesson) => lesson.standard_title === standardFilter
      );
    }
    if (courseFilter && courseFilter !== "All") {
      filteredLessons = filteredLessons.filter(
        (lesson) => lesson.course_title === courseFilter
      );
    }
    if (searchQuery) {
      filteredLessons = filteredLessons.filter((lesson) =>
        lesson.lesson_title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setLessons(filteredLessons);
  };

  const { data: courses } = useGetAllCoursesQuery(`${token}`, {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });

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
  }, [searchQuery, standardFilter, courseFilter, data]);

  return (
    <div className="flex h-screen w-full flex-col">
      <nav className="flex h-16 w-full items-center justify-between border-b px-5 py-3">
        <div className="flex items-center justify-center gap-4">
          <SidebarTrigger className="block lg:hidden" />
          <div className="text-3xl font-bold lg:text-4xl">My Lessons</div>
        </div>
        <div
          onClick={() => navigate("/dashboard/add-lesson")}
          className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md bg-primary p-2 text-sm text-white"
        >
          <Plus className="size-4" />
          Create New Lesson
        </div>
      </nav>

      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex w-1/3 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-2 dark:border-gray-700 dark:bg-muted">
          <Search className="size-5 text-primary dark:text-white" />
          <Input
            value={searchQuery}
            placeholder="Search by Topic"
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 border-none bg-transparent shadow-none"
          />
        </div>

        <div className="flex items-center gap-4">
          <Select value={standardFilter} onValueChange={setStandardFilter}>
            <SelectTrigger className="h-8 w-[140px] border-gray-300 font-light dark:border-gray-700">
              <SelectValue placeholder="All Standard" />
            </SelectTrigger>
            <SelectContent className="font-extralight">
              <SelectItem value="All" className="font-extralight">
                All Standard
              </SelectItem>
              <SelectItem value="K1">K1</SelectItem>
              <SelectItem value="K2">K2</SelectItem>
              <SelectItem value="K3">K3</SelectItem>
            </SelectContent>
          </Select>

          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="h-8 w-[140px] border-gray-300 font-light dark:border-gray-700">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Courses</SelectItem>
              {courses?.map((course: Course, idx) => (
                <SelectItem key={idx} value={course.course_title}>
                  {course.course_title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid h-full w-full grid-cols-1 items-start justify-start gap-5 overflow-y-auto p-5 md:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          <div className="col-span-1 flex h-full w-full items-center justify-center md:col-span-2 xl:col-span-4">
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>
        ) : !data || data.length === 0 ? (
          // Case 1: No lessons fetched from API
          <div className="col-span-1 flex h-full w-full flex-col items-center justify-center text-gray-500 md:col-span-2 xl:col-span-4">
            <CreateFirst />
          </div>
        ) : lessons.length === 0 ? (
          // Case 2: Lessons exist but none match the filters
          <div className="col-span-1 flex h-full w-full flex-col items-center justify-center text-gray-500 md:col-span-2 xl:col-span-4">
            <NotFound />
          </div>
        ) : (
          // Case 3: Lessons exist and match search/filter criteria
          lessons.map((lesson, idx) => (
            <LessonCard key={idx} lesson={lesson} token={token} />
          ))
        )}
      </div>
    </div>
  );
};

export default MyLessons;
