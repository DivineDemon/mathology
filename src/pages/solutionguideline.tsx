import { useEffect, useState } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { useGetLessonByIdQuery } from "@/store/services/lesson";
import { Loader2 } from "lucide-react";

const SolutionGuideline = () => {
  const { id } = useParams();
  const { getToken } = useKindeAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const handleToken = async () => {
      if (getToken) {
        const fetchedToken = await getToken();
        setToken(fetchedToken || "");
      }
    };
    handleToken();
  }, [getToken]);

 

  const { data, isLoading } = useGetLessonByIdQuery(
    {
      id: Number(id),
      token: `${token}`,
    },
    {
      skip: !token || !id || isNaN(Number(id)),
      refetchOnMountOrArgChange: true,
    }
  );

  return (
    <div className="flex h-screen w-full flex-col items-start justify-start overflow-y-auto">
      <nav className="flex h-16 w-full items-center justify-between border-b p-5">
        <div className="flex items-center justify-center gap-4">
          <SidebarTrigger className="block lg:hidden" />
          <div className="text-3xl font-bold lg:text-4xl">Lesson View</div>
        </div>
      </nav>
      <div className="flex h-full w-full flex-col items-start justify-start gap-5 p-5">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/dashboard"
                className="font-semibold text-primary dark:text-blue-400"
              >
              My Lesson
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-gray-500 dark:text-gray-300">
               Lesson View
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {isLoading ? (
          <div className="flex w-full h-full justify-center items-center">
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex w-full flex-col items-start justify-start gap-5 rounded-3xl bg-white mb-4 p-8 dark:bg-muted lg:gap-8">
            <div className="flex w-full flex-col gap-4">
              <span className="font-semibold text-primary">
                {data?.course_title}
              </span>
              <div className="flex w-full justify-between text-3xl font-semibold text-[#333333] dark:text-white/50 lg:text-4xl">
                <span>{data?.lesson_title}</span>
                <span className="text-sm bg-primary text-white flex justify-center items-center px-8 rounded-lg">
                  {data?.standard_title}
                </span>
              </div>
            </div>

            <div className="flex w-full flex-col items-start justify-start gap-3">
              <div className="flex flex-wrap gap-2">
                {data?.skill_tags?.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="rounded-md border border-primary bg-primary/15 px-3 py-1 text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full p-4 rounded-lg text-gray-500 ">
              <ReactMarkdown >
                {data?.lesson_file || "No lesson file available."}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolutionGuideline;
