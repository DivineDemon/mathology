import { useEffect, useState } from "react";

import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import {
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Loader2,
  Plus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import NotFound from "@/components/not-found";
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

import Delete from "../assets/img/delete.svg";
import Edit from "../assets/img/edit-2.svg";
import Sort from "../assets/img/sort.svg";

const ITEMS_PER_PAGE = 10;

const QuestionBank = () => {
  const navigate = useNavigate();
  const { getToken } = useKindeAuth();
  const [token, setToken] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  // const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
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

  const [deleteQuestion, { isLoading: deletingloading }] =
    useDeleteQuestionMutation();

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

  // const uniqueStatuses = [...new Set(questiondata.map((q) => q.status))];

  const filteredData = data?.filter((q) => {
    return (
      (!selectedStandard || q.standard_title === selectedStandard) &&
      (!selectedDifficulty || q.difficulty_level === selectedDifficulty)
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
      <nav className="flex h-16 w-full items-center justify-between border-b px-5 py-2.5">
        <div className="flex items-center justify-center gap-4">
          <SidebarTrigger className="block lg:hidden" />
          <div className="text-3xl font-bold lg:text-4xl">Question Bank</div>
        </div>
        <Button
          variant="default"
          type="button"
          onClick={() => navigate("/questionbank/create-question")}
          className="font-semibold text-white"
        >
          <Plus />
          Create Question
        </Button>
      </nav>
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="size-10 animate-spin text-primary" />
        </div>
      ) : //@ts-ignore
      data?.length > 0 &&
        data?.filter((q) => q.question_type === "Actual").length !== 0 ? (
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
                  ?.filter((q) => q.question_type === "Actual")
                  .map((question, index) => (
                    <TableRow
                      key={index}
                      className={
                        index % 2 === 0
                          ? "bg-white dark:bg-gray-700"
                          : "bg-gray-100 dark:bg-gray-800"
                      }
                      title={question.question_title}
                    >
                      <TableCell className="overflow-hidden truncate font-medium">
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

                      <TableCell
                        className={cn("text-center font-semibold capitalize", {
                          "text-green-500":
                            question.difficulty_level === "easy",
                          "text-blue-500":
                            question.difficulty_level === "medium",
                          "text-red-500": question.difficulty_level === "hard",
                        })}
                      >
                        {question.difficulty_level}
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
                        <DropdownMenu>
                          <DropdownMenuTrigger className="focus:outline-none">
                            <EllipsisVertical className="h-5 w-5 cursor-pointer" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                to={`/dashboard/editquestion/${question.question_id}`}
                                className="flex items-center"
                              >
                                <img
                                  src={Edit}
                                  alt="Edit"
                                  className="mr-2 size-5 invert"
                                />
                                &nbsp; Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(question.question_id)}
                            >
                              {deletingloading ? (
                                <Loader2 className="animate-spin" />
                              ) : (
                                <>
                                  <img
                                    src={Delete}
                                    alt="delete"
                                    className="mr-2"
                                  />
                                  <span className="text-red-600">Delete</span>
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

export default QuestionBank;
