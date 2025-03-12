import { useEffect, useState } from "react";

import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { ChevronLeft, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import NotFound from "@/components/question-not";
import { Button } from "@/components/ui/button";
import CustomToast from "@/components/ui/custom-toast";
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
import {
  useDeleteQuestionMutation,
  useGetAllQuestionsQuery,
} from "@/store/services/question";
import { useGetAllStandardsQuery } from "@/store/services/standard";

import Edit from "../assets/img/edit.svg";
import Sort from "../assets/img/sort.svg";

const ITEMS_PER_PAGE = 10;

const PracticeProblem = () => {
  const navigate = useNavigate();
  const { getToken } = useKindeAuth();
  const [token, setToken] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null
  );
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null);

  const { data, isLoading } = useGetAllQuestionsQuery(`${token}`, {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });

  const { data: standards } = useGetAllStandardsQuery(`${token}`, {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });

  const [deleteQuestion] = useDeleteQuestionMutation();

  const filteredData = data?.filter((q) => {
    return (
      (!selectedStandard || q.standard_title === selectedStandard) &&
      (!selectedDifficulty || q.difficulty_level === selectedDifficulty)
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

  const handleDelete = async (id: number) => {
    const response = await deleteQuestion({
      id,
      token,
    });

    if (response.data) {
      toast.custom(() => (
        <CustomToast
          type="success"
          title="Success"
          description="Question deleted successfully!"
        />
      ));
    } else {
      toast.custom(() => (
        <CustomToast
          type="error"
          title="Error"
          description="Something went wrong!"
        />
      ));
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
          type="button"
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
      <nav className="flex h-16 w-full shrink-0 items-center justify-between border-b px-5 py-2.5">
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
      data?.length > 0 &&
        data?.filter((q) => q.question_type === "Practice").length !== 0 ? (
        <div className="mx-auto flex h-full w-full flex-col justify-between gap-5 p-5">
          <div className="w-full">
            <Table>
              <TableHeader className="truncate">
                <TableRow>
                  <TableHead>Question Title</TableHead>

                  <TableHead>Course</TableHead>

                  <TableHead>Lesson</TableHead>

                  <TableHead>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          className="w-full"
                          variant="ghost"
                        >
                          Standard <img src={Sort} className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-24">
                        <DropdownMenuItem
                          onClick={() => setSelectedStandard(null)}
                        >
                          All
                        </DropdownMenuItem>
                        {standards?.map((standard) => (
                          <DropdownMenuItem
                            key={standard.standard_id}
                            onClick={() =>
                              setSelectedStandard(standard.standard_title)
                            }
                          >
                            {standard.standard_title}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableHead>

                  <TableHead>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="w-full"
                          type="button"
                          variant="ghost"
                        >
                          Difficulty Level&nbsp;
                          <img src={Sort} className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => setSelectedDifficulty(null)}
                        >
                          All
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setSelectedDifficulty("easy")}
                        >
                          Easy
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setSelectedDifficulty("medium")}
                        >
                          Medium
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setSelectedDifficulty("hard")}
                        >
                          Hard
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableHead>

                  <TableHead>Tags</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className={cn("text-md", "truncate text-ellipsis")}>
                {currentData
                  ?.filter((q) => q.question_type === "Practice")
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
                        className="overflow-hidden truncate font-medium hover:cursor-pointer hover:underline"
                        onClick={() =>
                          navigate(`/practiceproblems/${question.question_id}`)
                        }
                      >
                        {question.question_title}
                      </TableCell>

                      <TableCell className="overflow-hidden truncate">
                        {question.course_title}
                      </TableCell>

                      <TableCell className="overflow-hidden truncate">
                        {question.lesson_title}
                      </TableCell>

                      <TableCell className="text-center">
                        {question.standard_title}
                      </TableCell>

                      <TableCell>
                        <div className="flex w-full items-center justify-center">
                          <div
                            className={cn(
                              "w-fit text-center font-semibold capitalize",
                              {
                                "rounded-lg bg-green-200 px-2 py-0.5 text-green-700":
                                  question.difficulty_level === "easy",
                                "rounded-lg bg-[#FEEBC8] px-2 py-0.5 text-yellow-700":
                                  question.difficulty_level === "medium",
                                "rounded-lg bg-red-200 px-2 py-0.5 text-red-700":
                                  question.difficulty_level === "hard",
                              }
                            )}
                          >
                            {question.difficulty_level}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell
                        className={cn(
                          "flex w-full gap-1.5 overflow-hidden truncate p-2"
                        )}
                      >
                        {question.skill_tags
                          .slice(0, 2)
                          .map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className={cn(
                                "w-fit shrink-0 rounded-md bg-white p-2 text-center font-medium",
                                { "bg-muted": index % 2 === 0 }
                              )}
                            >
                              {tag}
                            </span>
                          ))}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link
                            to={`/dashboard/editquestion/${question.question_id}`}
                            className="flex items-center"
                          >
                            <span className="flex size-8 items-center justify-center rounded-full bg-[#FEEBC8]">
                              <img src={Edit} alt="Edit" className="size-4" />
                            </span>
                          </Link>
                          <div
                            className="flex size-8 items-center justify-center rounded-full bg-red-200 text-red-600"
                            onClick={() => handleDelete(question.question_id)}
                          >
                            <Trash2 className="size-4" />
                          </div>
                        </div>
                      </TableCell>
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
                type="button"
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
                type="button"
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

export default PracticeProblem;
