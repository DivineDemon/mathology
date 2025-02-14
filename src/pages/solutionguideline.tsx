import { useEffect, useState } from "react";

import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Paperclip, X } from "lucide-react";
import { useParams } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useGetQuestionQuery } from "@/store/services/question";

const SolutionGuideline = () => {
  const { id } = useParams();
  const { getToken } = useKindeAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [token, setToken] = useState<string | null>(null);

  const { data } = useGetQuestionQuery(
    {
      id: Number(id),
      token: `${token}`,
    },
    {
      skip: !token || token === "" || !id || id === "" || isNaN(Number(id)),
      refetchOnMountOrArgChange: true,
    }
  );

  const handleToken = async () => {
    let token: string | undefined = "";

    if (getToken) {
      token = await getToken();
    }

    setToken(token || "");
  };

  const removeFile = (name: string) => {
    const temp = files.filter((file) => file.name !== name);
    setFiles(temp);
  };

  useEffect(() => {
    handleToken();
  }, [getToken]);

  return (
    <div className="flex h-screen w-full flex-col items-start justify-start overflow-y-auto">
      <nav className="flex h-16 w-full items-center justify-between border-b p-5">
        <div className="flex items-center justify-center gap-4">
          <SidebarTrigger className="block lg:hidden" />
          <div className="text-3xl font-bold lg:text-4xl">
            Practice Problems
          </div>
        </div>
      </nav>
      <div className="flex h-full w-full flex-col items-start justify-start gap-5 p-5">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/practiceproblems"
                className="font-semibold text-primary dark:text-blue-400"
              >
                Practice Problems
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-gray-500 dark:text-gray-300">
                Solution Guildelines
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex w-full flex-col items-start justify-start gap-5 rounded-3xl bg-white p-8 dark:bg-muted lg:gap-8">
          <div className="flex flex-col gap-4">
            <span className="font-semibold dark:text-gray-300">
              Question 01:
            </span>
            <span className="text-3xl font-semibold text-[#333333] dark:text-white/50 lg:text-4xl">
              {data?.question_title}
            </span>
          </div>
          <div className="flex w-full flex-col gap-2.5 lg:gap-4">
            <span className="font-semibold dark:text-gray-300">
              Solution Guidelines:
            </span>
            <span>{data?.solution_file}</span>
          </div>
          <div className="flex w-full flex-col items-start justify-start gap-3">
            <span className="text-lg font-semibold dark:text-gray-300">
              Solution Attachment:
            </span>
            <div className="flex h-11 w-72 cursor-pointer items-center justify-start gap-3.5 rounded-lg border bg-gray-100 shadow dark:border-gray-600 dark:bg-gray-600 md:p-2 lg:h-16 lg:w-[35%]">
              <span className="rounded-xl border-2 bg-white p-2">
                <Paperclip className="size-3 text-primary dark:text-blue-500 lg:size-4" />
              </span>
              <div className="flex flex-col items-start justify-center">
                <span className="text-gray-400">Add Solution Attachment</span>
              </div>
            </div>
            <div className="mx-auto flex w-full items-start justify-start gap-2.5 overflow-x-auto">
              {files &&
                files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex shrink-0 items-start justify-start gap-2.5"
                  >
                    <p className="flex items-center justify-center gap-2.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white dark:border dark:border-gray-600 dark:bg-muted dark:text-white/50">
                      <span>{file.name}</span>
                      <X
                        className="size-3 cursor-pointer"
                        onClick={() => removeFile(file.name)}
                      />
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionGuideline;
