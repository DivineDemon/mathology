import { useState } from "react";

import { EllipsisVertical, Loader2, Trash, Edit } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDeleteLessonMutation } from "@/store/services/lesson";

import Delete1 from "../assets/img/delete1.svg";
import { Button } from "./ui/button";
import CustomToast from "./ui/custom-toast";
import { Dialog, DialogContent } from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const LessonCard = ({ lesson, token }: { lesson: Lesson; token: string }) => {
  const navigate = useNavigate();
  const [deleteLesson, { isLoading }] = useDeleteLessonMutation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDelete = async () => {
    setShowConfirmModal(false);
    const response = await deleteLesson({ id: lesson.lesson_id, token });

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
    <>
      <Card
        className="w-full cursor-pointer p-0"
        onClick={() => navigate(`/practiceproblems/${lesson.lesson_id}`)}
      >
        <CardContent className="p-0">
          <div
            className={cn(
              "relative flex w-full flex-col items-center justify-center gap-2.5 rounded-2xl p-3.5 hover:bg-gray-100 dark:hover:bg-gray-800",
              { "border border-[#FF3D60]": lesson.is_published }
            )}
          >
            <div className="absolute inset-x-0 top-5 z-[1] flex w-full items-center justify-center px-5">
              {lesson.is_published && (
                <span className="mr-auto rounded-full bg-[#FF3D60] px-3 py-1 text-xs text-white">
                  Draft
                </span>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="ml-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EllipsisVertical className="rounded-md bg-white bg-opacity-70 text-black" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-24" align="end">
                  <DropdownMenuItem className="border-b">
                    <Link
                      to={`/dashboard/edit-lesson/${lesson.lesson_id}`}
                      className="flex w-full items-center justify-start gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Edit size={13} /> Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfirmModal(true);
                    }}
                    className="cursor-pointer border-b"
                  >
                    <span className=" flex w-full items-center justify-start gap-2 text-red-600"> <Trash size={13} /> Delete</span>
                  </DropdownMenuItem>
                  {lesson.is_published && (
                    <DropdownMenuItem>
                      <Link
                        to={`/dashboard/edit-lesson/${lesson.lesson_id}`}
                        className="flex w-full items-center justify-start"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Publish
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <img
              src={lesson.lesson_header}
              alt="geometry"
              className="aspect-video w-full rounded-2xl object-cover"
            />
            <div className="flex w-full items-center justify-between">
              <span className="text-sm font-semibold text-primary dark:text-gray-300">
                {lesson.course_title}
              </span>
              <span className="rounded-md bg-primary px-3 text-white">
                {lesson.standard_title}
              </span>
            </div>
            <span className="line-clamp-1 w-full pb-0.5 text-left text-xl font-bold !leading-[20px] text-black dark:text-gray-300">
              {lesson.lesson_title}
            </span>
            <span className="line-clamp-1 w-full text-left text-sm !leading-[16px] text-gray-500">
              {lesson.lesson_description}
            </span>
            <div className="flex w-full flex-wrap items-start justify-start gap-1.5 pb-1.5">
              {lesson.skill_tags?.slice(0, 3).map((skill, idx) => (
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

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="px-16 py-14">
          <div className="flex flex-col items-center justify-center gap-4">
            <img src={Delete1} alt="" />
            <h1 className="text-2xl font-extrabold">Are you sure?</h1>
            <p className="text-center text-gray-400">
              Do you really want to delete these records? This process cannot be
              undone.
            </p>
          </div>
          <div className="mt-4 flex w-full justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LessonCard;
