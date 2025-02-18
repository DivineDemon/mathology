import { EllipsisVertical, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useDeleteLessonMutation } from "@/store/services/lesson";

import Delete from "../assets/img/delete.svg";
import Edit from "../assets/img/edit-2.svg";
import CustomToast from "./ui/custom-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const LessonCard = ({ lesson, token }: { lesson: Lesson; token: string }) => {
  const [deleteLesson, { isLoading }] = useDeleteLessonMutation();

  const handleDelete = async () => {
    const response = await deleteLesson({
      id: lesson.lesson_id,
      token,
    });

    if (response.data) {
      toast.custom(() => (
        <CustomToast
          type="success"
          title="Success"
          description="Lesson deleted successfully!"
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

  return (
    <Card className="w-full p-0">
      <CardContent className="p-0">
        <div className="relative flex w-full flex-col items-center justify-center gap-2.5 p-3.5">
          <div className="absolute right-5 top-6 z-[1]">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <EllipsisVertical className="text-primary" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mr-20 w-24">
                <DropdownMenuItem className="border-b">
                  <Link
                    to={`/dashboard/edit-lesson/${lesson.lesson_id}`}
                    className="flex items-center justify-center gap-3"
                  >
                    <img src={Edit} alt="edit" /> Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete}>
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <img src={Delete} alt="delete" className="mr-2" />{" "}
                      <span className="text-red-600">Delete</span>
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <img
            src={lesson.lesson_header}
            alt="geometry"
            className="aspect-square w-full rounded-2xl object-cover"
          />
          <div className="flex w-full items-center justify-between">
            <span className="text-sm font-semibold text-primary dark:text-gray-300">
              {lesson.course_title}
            </span>
            <span className="rounded-md bg-primary px-3 text-white">
              {lesson.standard_title}
            </span>
          </div>
          <span className="w-full text-left text-xl font-bold !leading-[20px] text-black dark:text-gray-300">
            {lesson.lesson_title}
          </span>
          <span className="line-clamp-1 w-full text-left text-sm !leading-[16px] text-gray-500">
            {lesson.lesson_description}
          </span>
          <div className="flex w-full flex-wrap items-start justify-start gap-1.5 pb-1.5">
            {lesson.skill_tags?.slice(0, 2).map((skill, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="bg-gray-100 lowercase text-gray-400 dark:bg-gray-600 dark:text-gray-300"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonCard;
