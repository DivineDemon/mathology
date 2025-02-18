import { useEffect, useState } from "react";

import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import NotFound from "@/components/not-found";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useGetAllQuestionsQuery } from "@/store/services/question";

import Sort from "../assets/img/sort.svg";

const ITEMS_PER_PAGE = 10;

const QuestionBank = () => {
  const navigate = useNavigate();
  const { getToken } = useKindeAuth();
  const [token, setToken] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  // const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null
  );
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null);

  const { data, isLoading } = useGetAllQuestionsQuery(`${token}`, {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });

  const uniqueTitles = [...new Set(data?.map((q) => q.question_title))];
  const uniqueCourses = [...new Set(data?.map((q) => q.course_title))];
  const uniqueLessons = [...new Set(data?.map((q) => q.lesson_title))];
  const uniqueStandards = [...new Set(data?.map((q) => q.standard_title))];
  const uniqueDifficulties = [...new Set(data?.map((q) => q.difficulty_level))];
  const uniqueTags = [...new Set(data?.flatMap((q) => q.skill_tags))];
  // const uniqueStatuses = [...new Set(data?.map((q) => q.status))];

  const filteredData = data?.filter((q) => {
    return (
      (!selectedTitle || q.question_title === selectedTitle) &&
      (!selectedCourse || q.course_title === selectedCourse) &&
      (!selectedTopic || q.lesson_title === selectedTopic) &&
      (!selectedStandard || q.standard_title === selectedStandard) &&
      (!selectedDifficulty || q.difficulty_level === selectedDifficulty) &&
      (!selectedTag || q.skill_tags.includes(selectedTag))
      // && (!selectedStatus || q.status === selectedStatus)
    );
  });

  const totalItems = filteredData?.length;
  const totalPages = Math.ceil(totalItems! / ITEMS_PER_PAGE);
  const currentData = filteredData?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems!);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleToken = async () => {
    let token: string | undefined = "";

    if (getToken) {
      token = await getToken();
    }

    setToken(token || "");
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pageNumbers.push(i);
      } else if (
        (i === currentPage - delta - 1 || i === currentPage + delta + 1) &&
        totalPages > 7
      ) {
        pageNumbers.push("...");
      }
    }

    return pageNumbers.map((page, index) => {
      if (page === "...") {
        return (
          <span key={index} className="px-2 text-gray-500">
            ...
          </span>
        );
      }
      return (
        <button
          key={index}
          onClick={() => handlePageChange(Number(page))}
          className={cn(
            "size-[44px] rounded-2xl bg-gray-100 font-semibold text-black",
            {
              "bg-primary text-white": page === currentPage,
            }
          )}
        >
          {page}
        </button>
      );
    });
  };

  useEffect(() => {
    handleToken();
  }, [getToken]);

  return (
    <div className="mx-auto flex h-full w-screen flex-col lg:w-full">
      <nav className="flex h-16 w-full items-center justify-between border-b px-5 py-2.5">
        <div className="flex items-center justify-center gap-4">
          <SidebarTrigger className="block lg:hidden" />
          <div className="text-3xl font-bold lg:text-4xl">Practice Problem</div>
        </div>
      </nav>

      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="size-10 animate-spin text-primary" />
        </div>
      ) : //@ts-ignore
      !data?.length > 0 ? (
        <div className="mx-auto flex h-full w-full flex-col justify-between gap-5 p-5">
          <div className="w-full">
            <Table>
              <TableHeader className="truncate">
                <TableRow>
                  {[
                    {
                      label: "Question Title",
                      options: uniqueTitles,
                      setter: setSelectedTitle,
                    },
                    {
                      label: "Course",
                      options: uniqueCourses,
                      setter: setSelectedCourse,
                    },
                    {
                      label: "Lesson",
                      options: uniqueLessons,
                      setter: setSelectedTopic,
                    },
                    {
                      label: "Standard",
                      options: uniqueStandards,
                      setter: setSelectedStandard,
                    },
                    {
                      label: "Difficulty Level",
                      options: uniqueDifficulties,
                      setter: setSelectedDifficulty,
                    },
                    {
                      label: "Tags",
                      options: uniqueTags,
                      setter: setSelectedTag,
                    },
                    // {
                    //   label: "Status",
                    //   options: uniqueStatuses,
                    //   setter: setSelectedStatus,
                    // },
                  ].map(({ label, options, setter }) => (
                    <TableHead key={label}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost">
                            {label} <img src={Sort} className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="max-h-64 w-full min-w-24 overflow-y-auto">
                          <DropdownMenuItem onClick={() => setter(null)}>
                            All
                          </DropdownMenuItem>
                          {options.map((option) => (
                            <DropdownMenuItem
                              key={option}
                              onClick={() => setter(option)}
                            >
                              {option}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody className={cn("text-md", "truncate text-ellipsis")}>
                {currentData
                  ?.filter(
                    (question: Question) =>
                      question.question_type === "Practice"
                  )
                  .map((question, index) => (
                    <TableRow
                      key={index}
                      className={
                        index % 2 === 0
                          ? "bg-white dark:bg-gray-700"
                          : "bg-gray-100 dark:bg-gray-800"
                      }
                    >
                      <TableCell
                        className="cursor-pointer overflow-hidden truncate pl-6 font-medium hover:underline"
                        onClick={() =>
                          navigate(`/practiceproblems/${question.question_id}`)
                        }
                      >
                        {question.question_title}
                      </TableCell>
                      <TableCell className="overflow-hidden truncate pl-6">
                        {question.course_title}
                      </TableCell>
                      <TableCell className="overflow-hidden truncate pl-6">
                        {question.lesson_title}
                      </TableCell>
                      <TableCell className="overflow-hidden truncate pl-6 text-center">
                        {question.standard_title}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "overflow-hidden truncate pl-6 text-center font-semibold",
                          {
                            "text-red-500":
                              question.difficulty_level === "Easy",
                            "text-green-500":
                              question.difficulty_level === "Medium",
                            "text-yellow-500":
                              question.difficulty_level === "Hard",
                            "text-gray-500": !question.difficulty_level,
                          }
                        )}
                      >
                        {question.difficulty_level}
                      </TableCell>
                      <TableCell className="flex gap-1.5 overflow-hidden truncate p-2 pl-6">
                        {question.skill_tags
                          .slice(0, 2)
                          .map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className={cn(
                                "w-1/2 rounded-md bg-white p-2 text-center font-medium",
                                { "bg-muted": index % 2 === 0 }
                              )}
                            >
                              {tag}
                            </span>
                          ))}
                      </TableCell>
                      {/* <TableCell>
                        <span
                          className={cn(
                            "flex items-center justify-center gap-1.5 rounded-md border p-1.5 font-medium",
                            {
                              "border-primary bg-blue-100 text-primary dark:bg-primary/60 dark:text-white":
                                question.status === "Published",
                              "border-yellow-500 bg-orange-100 text-yellow-800":
                                question.status !== "Published",
                            }
                          )}
                        >
                          <Squircle
                            className={cn("size-2 rounded-full", {
                              "bg-primary": question.status === "Published",
                              "bg-orange-400": question.status !== "Published",
                            })}
                          />
                          {question.status}
                        </span>
                      </TableCell> */}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex w-full items-center justify-between p-2">
            <span className="text-sm">
              Showing&nbsp;
              <span className="font-semibold">
                {startItem}-{endItem}
              </span>
              &nbsp; from <span className="font-semibold">{totalItems}</span>
              &nbsp; data
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-2xl border-2 border-gray-300 bg-gray-100 p-2.5 text-primary hover:bg-primary hover:text-white"
              >
                <ChevronLeft className="size-6" />
              </button>
              <div className="w-fit rounded-2xl border-2 border-gray-300 bg-gray-100 text-primary">
                {renderPagination()}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-2xl border-2 border-gray-300 bg-gray-100 p-2.5 text-primary hover:bg-primary hover:text-white"
              >
                <ChevronRight className="size-6" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <NotFound />
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
