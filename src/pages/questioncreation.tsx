import { ChangeEvent, useEffect, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { CircleCheckBig, CloudUpload, Info, Loader2, X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import AddLessonModal from "@/components/add_lesson_modal";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import CustomToast from "@/components/ui/custom-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { extractPdfText } from "@/lib/utils";
import { useGetAllCoursesQuery } from "@/store/services/course";
import { useGetAllLessonsQuery } from "@/store/services/lesson";
import {
  useGetQuestionQuery,
  usePostQuestionMutation,
  useUpdateQuestionMutation,
} from "@/store/services/question";
import { useGetAllStandardsQuery } from "@/store/services/standard";

const questionFormSchema = z.object({
  standard: z.string().min(1, "Standard is required"),
  course: z.string().min(1, "Course is required"),
  lesson: z.string().min(1, "Lesson is required"),
  difficulty_level: z.enum(["easy", "medium", "hard"], {
    errorMap: () => ({
      message: "Please select a difficulty level: Easy, Medium, or Hard",
    }),
  }),
  skill_tags: z
    .array(
      z.object({
        id: z.string(),
        value: z.string(),
      })
    )
    .min(1, { message: "At least one skill tag is required" }),
  question_title: z.string().min(1, "Question title is required"),
  question_description: z.string().min(1, "Question description is required"),
  question_type: z.enum(["Practice", "Actual"], {
    errorMap: () => ({
      message: "Please select a question type: Practice or Actual",
    }),
  }),
  answer_type: z.enum(["Short Answer", "MCQs", "Long Answer"], {
    errorMap: () => ({
      message: "Please select an answer type: Short, MCQ, or Long",
    }),
  }),
  answer: z.string().optional(),
});

const AddTopic = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useKindeAuth();
  const lRef = useRef<HTMLInputElement>(null);
  const [token, setToken] = useState<string>("");
  const [lesson, setLesson] = useState<string>("");
  const [preview, setPreview] = useState<boolean>(false);
  const [currentSkill, setCurrentSkill] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [postQuestion, { isLoading: posting }] = usePostQuestionMutation();
  const [updateQuestion, { isLoading: updating }] = useUpdateQuestionMutation();

  const form = useForm<z.infer<typeof questionFormSchema>>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      standard: "",
      course: "",
      lesson: "",
      difficulty_level: "easy",
      skill_tags: [],
      question_title: "",
      question_description: "",
      question_type: "Practice",
      answer_type: "Short Answer",
      answer: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    // @ts-ignore
    name: "skill_tags",
  });

  const { data, isLoading: questionLoading } = useGetQuestionQuery(
    {
      id: Number(id),
      token: `${token}`,
    },
    {
      skip: !token || token === "" || !id || id === "" || isNaN(Number(id)),
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: standards, isLoading: standardloading } =
    useGetAllStandardsQuery(`${token}`, {
      skip: !token,
      refetchOnMountOrArgChange: true,
    });

  const { data: courses, isLoading: courseLoading } = useGetAllCoursesQuery(
    `${token}`,
    {
      skip: !token,
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: lessons, isLoading: lessaonsLoading } = useGetAllLessonsQuery(
    `${token}`,
    {
      skip: !token,
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

  const addSkills = () => {
    const rawSkills = currentSkill
      .split(/,\s?/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s);

    const uniqueInputSkills = Array.from(new Set(rawSkills));
    const presentSkills = fields.map((field) => field.value);

    const duplicateSkills = uniqueInputSkills.filter((skill) =>
      presentSkills.includes(skill)
    );

    if (duplicateSkills.length > 0) {
      //@ts-ignore
      toast.custom(() => (
        <CustomToast
          type="error"
          title="Error"
          description="Duplicate skills detected. Please remove duplicates."
        />
      ));

      return;
    }

    uniqueInputSkills.forEach((skill) =>
      append({
        id: "",
        value: skill,
      })
    );
    setCurrentSkill("");
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);

      const pdfText = await extractPdfText(file);
      setLesson(pdfText);
    }
  };

  const toggleInput = () => {
    if (lRef.current) {
      lRef.current.click();
    }
  };

  const handleSubmit = async (values: z.infer<typeof questionFormSchema>) => {
    const newQuestion = {
      question_title: values.question_title,
      question_description: values.question_description,
      status: "draft",
      difficulty_level: values.difficulty_level,
      question_type: values.question_type,
      solution_file: lesson,
      course_id: Number(
        courses?.filter((course) => course.course_title === values.course)[0]
          .course_id
      ),
      standard_id: Number(
        standards?.filter(
          (standard) => standard.standard_title === values.standard
        )[0].standard_id
      ),
      lesson_id: Number(
        lessons?.filter((lesson) => lesson.lesson_title === values.lesson)[0]
          .lesson_id
      ),
      skill_tags: values.skill_tags.map((tag) => tag.value),
      answer_type: values.answer_type,
    };

    try {
      if (!id) {
        await postQuestion({
          token: `${token}`,
          body: newQuestion,
        });
      } else {
        await updateQuestion({
          id: Number(id),
          token: `${token}`,
          body: newQuestion,
        });
      }
      toast.custom(() => (
        <CustomToast
          title="Success"
          type="success"
          description={`Question ${id ? "updated" : "created"} successfully`}
        />
      ));
      if (values.question_type === "Actual") {
        navigate("/questionbank");
      } else {
        navigate("/practiceproblems");
      }
    } catch (error) {
      toast.custom(() => (
        <CustomToast
          title="Error"
          type="error"
          description="Something went wrong"
        />
      ));
    }
  };

  useEffect(() => {
    handleToken();

    if (data) {
      form.setValue("standard", data?.standard_title);
      form.setValue("course", data?.course_title);
      form.setValue("lesson", data?.lesson_title);
      form.setValue(
        "difficulty_level",
        data?.difficulty_level as "easy" | "medium" | "hard"
      );
      const skills = data?.skill_tags.map((skill) => {
        return {
          id: "",
          value: skill,
        };
      });
      form.setValue("skill_tags", skills);
      form.setValue("question_title", data?.question_title);
      form.setValue("question_description", data?.question_description);
      form.setValue(
        "question_type",
        data?.question_type as "Practice" | "Actual"
      );
      form.setValue(
        "answer_type",
        data?.answer_type as "Short Answer" | "Long Answer"
      );
      form.setValue("answer", data?.solution_file);
    }
  }, [getToken, data]);

  return (
    <>
      <AddLessonModal
        open={preview}
        setOpen={setPreview}
        text={data?.solution_file}
        type="text"
      />
      <div className="flex h-screen w-full flex-col items-start justify-start overflow-y-auto">
        <nav className="flex h-16 w-full items-center justify-between border-b p-5">
          <div className="flex items-center justify-center gap-4">
            <SidebarTrigger className="block lg:hidden" />
            <div className="text-3xl font-bold lg:text-4xl">
              {id ? "Edit" : "Add"} Question
            </div>
          </div>
        </nav>
        <div className="flex h-full w-full flex-col items-start justify-start gap-5 p-5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/questionbank"
                  className="font-semibold text-primary dark:text-blue-400"
                >
                  Question Bank
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-gray-500 dark:text-gray-300">
                  Question {id ? "Updation" : "Creation"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {!standardloading &&
          !courseLoading &&
          !lessaonsLoading &&
          !questionLoading ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="grid w-full grid-cols-4 gap-6"
              >
                <FormField
                  control={form.control}
                  name="standard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Standard" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* @ts-ignore */}
                          {standards?.map((standard: Standard) => (
                            <SelectItem
                              key={standard.standard_id}
                              value={standard.standard_title}
                            >
                              {standard.standard_title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="course"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* @ts-ignore */}
                          {courses?.map((course: Course) => (
                            <SelectItem
                              key={course.course_id}
                              value={course.course_title}
                            >
                              {course.course_title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <FormField
                control={form.control}
                name="lesson"
                render={({ field }) => (
                  <FormItem className="col-span-2 w-full">
                    <FormLabel>Lesson</FormLabel>
                    <Input placeholder="Lesson Name" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
                <FormField
                  control={form.control}
                  name="lesson"
                  render={({ field }) => (
                    <FormItem className="col-span-2 w-full">
                      <FormLabel>Lesson</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Lesson" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* @ts-ignore */}
                          {lessons?.map((lesson: Lesson) => (
                            <SelectItem
                              key={lesson.lesson_id}
                              value={lesson.lesson_title}
                            >
                              {lesson.lesson_title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="difficulty_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Difficulty Level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-3 flex flex-col items-start justify-start gap-3">
                  <FormField
                    control={form.control}
                    name="skill_tags"
                    render={() => (
                      <FormItem className="col-span-3 w-full">
                        <FormLabel>Skill Tags</FormLabel>
                        <FormControl>
                          <div className="flex w-full items-center justify-center gap-5">
                            <Input
                              placeholder="Geometry"
                              value={currentSkill}
                              onChange={(e) => setCurrentSkill(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              onClick={addSkills}
                              type="button"
                              variant="default"
                            >
                              Add
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {fields.length > 0 && (
                    <div className="col-span-4 grid grid-cols-4 gap-5">
                      <div className="col-span-3 flex w-full max-w-full items-center justify-start gap-2.5 overflow-x-auto">
                        {form.watch("skill_tags").map((tag, index) => (
                          <div
                            key={index}
                            onClick={() => remove(index)}
                            className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-primary bg-primary/20 px-4 py-1 text-blue-700"
                          >
                            <span className="pb-0.5 text-[14px] capitalize">
                              {tag.value}
                            </span>
                            <X className="size-3.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <FormField
                  control={form.control}
                  name="question_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Question Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="question_description"
                  render={({ field }) => (
                    <FormItem className="col-span-3 w-full">
                      <FormLabel>Question Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Question Description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="question_type"
                  render={({ field }) => (
                    <FormItem className="col-span-2 w-full">
                      <FormLabel>Question Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Question Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Practice">Practice</SelectItem>
                          <SelectItem value="Actual">Actual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="answer_type"
                  render={({ field }) => (
                    <FormItem className="col-span-2 w-full">
                      <FormLabel>Answer Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || "Short Answer"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an answer type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Short Answer">
                            Short Answer
                          </SelectItem>
                          <SelectItem value="Long Answer">
                            Long Answer
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem className="col-span-4 w-full">
                      <FormLabel>Answers</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={"Please Enter Your Answer Here."}
                          className="flex-1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-4 flex h-full w-full items-center justify-center gap-5 rounded-lg bg-white px-5 py-[110px] lg:gap-10 lg:p-[110px]">
                  <div className="relative flex w-full cursor-pointer items-center justify-center gap-5 rounded-lg bg-primary px-4 py-4 text-white lg:w-96 lg:px-10">
                    {id && (
                      <div
                        onClick={() => setPreview(true)}
                        className="absolute -right-2.5 -top-2.5 flex size-5 items-center justify-center rounded-full border bg-white p-1 shadow-md transition-colors hover:bg-primary/20"
                      >
                        <span className="text-sm">
                          <Info className="text-black" />
                        </span>
                      </div>
                    )}
                    <div
                      onClick={toggleInput}
                      className="flex w-full cursor-pointer items-center justify-center gap-5 rounded-lg bg-primary text-white"
                    >
                      <input
                        type="file"
                        className="hidden"
                        ref={lRef}
                        multiple={false}
                        onChange={(e) => handleUpload(e)}
                        accept="application/pdf"
                      />
                      {fileName ? (
                        <span>
                          <CircleCheckBig className="size-8" />
                        </span>
                      ) : (
                        <span>
                          <CloudUpload className="size-8" />
                        </span>
                      )}

                      <div className="flex flex-col items-center justify-center">
                        <span className="w-full text-left font-medium">
                          {fileName ? "File Uploaded" : "Upload Solution"}
                        </span>
                        <span className="w-full text-left text-xs text-white/80">
                          {fileName ? fileName : "Supported formats: .pdf"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-4 flex w-full cursor-pointer items-end justify-end pb-5">
                  <Button
                    type="submit"
                    variant="default"
                    disabled={posting || updating}
                    className="w-fit text-white"
                  >
                    {posting || updating ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <span className="mx-auto flex h-full w-full items-center justify-center">
              <Loader2 className="size-10 animate-spin text-primary" />
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default AddTopic;
