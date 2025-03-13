import { ChangeEvent, useEffect, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import Controlled from "@uiw/react-codemirror";
import { MathJax, MathJaxContext } from "better-react-mathjax";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { cn, extractPdfText, parseImage, truncateString } from "@/lib/utils";
import { useGetAllCoursesQuery } from "@/store/services/course";
import { useGetAllLessonsQuery } from "@/store/services/lesson";
import {
  useGetQuestionQuery,
  usePostQuestionMutation,
  useUpdateQuestionMutation,
} from "@/store/services/question";
import { useGetAllStandardsQuery } from "@/store/services/standard";

const config = {
  loader: { load: ["input/asciimath", "output/chtml"] },
};

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
    .min(2, { message: "Minimum 2 tags allowed." }),
  question_title: z
    .string()
    .min(30, "Question title must be 30 characters ")
    .max(45, "Question title max 45 characters ."),
  question_description: z
    .string()
    .min(1, "Question description is required")
    .max(250, "Maximum 250 characters allowed."),
  question_type: z.enum(["Practice", "Actual"], {
    errorMap: () => ({
      message: "Please select a question type: Practice or Actual",
    }),
  }),
  answer_type: z.enum(["Short Answer", "Long Answer"], {
    errorMap: () => ({
      message: "Please select an answer type: Short or Long",
    }),
  }),
  answer: z
    .string()
    .min(1, "Answer is required")
    .max(50, "Enforce a character limit (e.g., 50 characters)."),
});

const AddTopic = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useKindeAuth();
  const lRef = useRef<HTMLInputElement>(null);
  const lhRef = useRef<HTMLInputElement>(null);
  const [token, setToken] = useState<string>("");
  const [lesson, setLesson] = useState<string>("");
  const [qImage, setQImage] = useState<string>("");
  const [preview, setPreview] = useState<boolean>(false);
  const [currentSkill, setCurrentSkill] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [modalType, setModalType] = useState<"image" | "text">("image");
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
      .split(/\s*,\s*/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s);

    const uniqueInputSkills = Array.from(new Set(rawSkills));

    const invalidSkills = uniqueInputSkills.filter((skill) => skill.length > 7);
    if (invalidSkills.length > 0) {
      //@ts-ignore
      toast.custom(() => (
        <CustomToast
          type="error"
          title="Error"
          description={`Skills must be 7 characters or less: ${invalidSkills.join(", ")}`}
        />
      ));
      return;
    }

    const presentSkills = fields.map((field) => field.value.toLowerCase());

    const duplicateSkills = uniqueInputSkills.filter((skill) =>
      presentSkills.includes(skill)
    );

    if (duplicateSkills.length > 0) {
      //@ts-ignore
      toast.custom(() => (
        <CustomToast
          type="error"
          title="Error"
          description={`Duplicate skills detected: ${duplicateSkills.join(", ")}`}
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

  const toggleInput = (toToggle: string) => {
    if (toToggle === "lh") {
      if (lhRef.current) {
        lhRef.current.click();
      }
    } else {
      console.log(toToggle);
      if (lRef.current) {
        lRef.current.click();
      }
    }
  };

  const handleUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (type === "lh") {
        if (file.type.startsWith("image/")) {
          const imageUrl = await parseImage(file);
          setQImage(imageUrl as string);
        } else {
          toast.custom(() => (
            <CustomToast
              type="error"
              title="Error"
              description="Please upload a valid image file (png, jpg, jpeg)."
            />
          ));
        }
      }

      if (type === "l") {
        if (file.type === "application/pdf") {
          const pdfText = await extractPdfText(file);
          setLesson(pdfText);
          setFileName(file.name);
        } else {
          toast.custom(() => (
            <CustomToast
              type="error"
              title="Error"
              description="Please upload a valid PDF file."
            />
          ));
        }
      }
    }
  };

  const handleSubmit = async (values: z.infer<typeof questionFormSchema>) => {
    const newQuestion = {
      question_title: values.question_title,
      question_description: values.question_description,
      status: "draft",
      difficulty_level: values.difficulty_level,
      question_type: values.question_type,
      solution_file: `${values.answer},${lesson}`,
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
      image_url: qImage,
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

  const questionDescription = form.watch("question_description");

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
      form.setValue("answer", data?.solution_file.split(",")[0]);
    }
  }, [getToken, data]);

  useEffect(() => {
    const updateMathJax = async () => {
      // @ts-ignore
      if (typeof window !== "undefined" && window.MathJax) {
        try {
          // @ts-ignore
          await window.MathJax.startup.promise;
          // @ts-ignore
          window.MathJax.typeset();
        } catch (error) {
          console.error("MathJax update failed:", error);
        }
      }
    };

    updateMathJax();
  }, [questionDescription]);

  return (
    <>
      <AddLessonModal
        open={preview}
        setOpen={setPreview}
        text={data?.solution_file.split(",")[1]}
        // @ts-ignore
        image={data?.image_url}
        type={modalType}
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
                      <FormLabel className="text-black">Standard</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn("", {
                              "border border-red-500 bg-red-500/10":
                                form.formState.errors.standard,
                            })}
                          >
                            <SelectValue placeholder="Standard" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* @ts-ignore */}
                          {standards?.map((standard: Standard, idx) => (
                            <SelectItem
                              key={idx}
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
                      <FormLabel className="text-black">Course</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn("", {
                              "border border-red-500 bg-red-500/10":
                                form.formState.errors.course,
                            })}
                          >
                            <SelectValue placeholder="Course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* @ts-ignore */}
                          {courses?.map((course: Course, idx) => (
                            <SelectItem key={idx} value={course.course_title}>
                              {course.course_title}
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
                  name="lesson"
                  render={({ field }) => (
                    <FormItem className="col-span-2 w-full">
                      <FormLabel className="text-black">Lesson</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn("", {
                              "border border-red-500 bg-red-500/10":
                                form.formState.errors.lesson,
                            })}
                          >
                            <SelectValue placeholder="Lesson" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* @ts-ignore */}
                          {lessons?.map((lesson: Lesson, idx) => (
                            <SelectItem key={idx} value={lesson.lesson_title}>
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
                      <FormLabel className="text-black">
                        Difficulty Level
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn("", {
                              "border border-red-500 bg-red-500/10":
                                form.formState.errors.difficulty_level,
                            })}
                          >
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
                        <FormLabel className="text-black">Skill Tags</FormLabel>
                        <FormControl>
                          <div className="flex w-full items-center justify-center gap-5">
                            <Input
                              placeholder="Geometry"
                              value={currentSkill}
                              onChange={(e) => setCurrentSkill(e.target.value)}
                              className={cn("flex-1", {
                                "border border-red-500 bg-red-500/10":
                                  form.formState.errors.skill_tags,
                              })}
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
                      <FormLabel className="text-black">
                        Question Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Question Title"
                          className={cn("", {
                            "border border-red-500 bg-red-500/10":
                              form.formState.errors.question_title,
                          })}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-4 grid w-full grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="question_description"
                    render={({ field }) => (
                      <FormItem className="font-code col-span-1 w-full">
                        <FormLabel className="text-black">
                          Question Description&nbsp;
                          <span className="text-[10px] text-muted-foreground">
                            {form.watch("question_description").length}/150
                            characters
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Controlled
                            value={field.value}
                            height="200px"
                            onChange={field.onChange}
                            basicSetup={{ lineNumbers: true }}
                            className={cn(
                              "overflow-hidden rounded-lg border bg-white text-xs",
                              {
                                "border border-red-500 bg-red-500/10":
                                  form.formState.errors.question_title,
                              }
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="col-span-1 flex h-full w-full flex-col items-center justify-center gap-3">
                    <Label className="mt-2 w-full text-left">
                      Description Preview
                    </Label>
                    <div className="h-full w-full rounded-lg bg-white px-2">
                      <MathJaxContext config={config}>
                        <MathJax>{`\\(${questionDescription}\\)`}</MathJax>
                      </MathJaxContext>
                    </div>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="question_type"
                  render={({ field }) => (
                    <FormItem className="col-span-2 w-full">
                      <FormLabel className="text-black">
                        Question Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn("", {
                              "border border-red-500 bg-red-500/10":
                                form.formState.errors.question_type,
                            })}
                          >
                            <SelectValue placeholder="Question Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Practice">Practice</SelectItem>
                          <SelectItem value="Actual">Question</SelectItem>
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
                      <FormLabel className="text-black">Answer Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || "Short Answer"}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn("", {
                              "border border-red-500 bg-red-500/10":
                                form.formState.errors.answer_type,
                            })}
                          >
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
                      <FormLabel className="text-black">Answers</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please Enter Your Answer Here."
                          className={cn("flex-1", {
                            "border border-red-500 bg-red-500/10":
                              form.formState.errors.answer,
                          })}
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
                        onClick={() => {
                          setModalType("text");
                          setPreview(true);
                        }}
                        className="absolute -right-2.5 -top-2.5 flex size-5 items-center justify-center rounded-full border bg-white p-1 shadow-md transition-colors hover:bg-primary/20"
                      >
                        <span className="text-sm">
                          <Info className="text-black" />
                        </span>
                      </div>
                    )}
                    <div
                      onClick={() => toggleInput("l")}
                      className="flex w-full cursor-pointer items-center justify-center gap-5 rounded-lg bg-transparent text-white"
                    >
                      <input
                        type="file"
                        className="hidden"
                        ref={lRef}
                        multiple={false}
                        onChange={(e) => handleUpload(e, "l")}
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
                  <div className="relative flex w-full cursor-pointer items-center justify-center gap-5 rounded-lg bg-gray-100 px-4 py-4 text-black lg:w-96 lg:px-10">
                    {id && (
                      <div
                        onClick={() => {
                          setModalType("image");
                          setPreview(true);
                        }}
                        className="absolute -right-2.5 -top-2.5 flex size-5 items-center justify-center rounded-full border bg-white p-1 shadow-md transition-colors hover:bg-primary/20"
                      >
                        <span className="text-sm">
                          <Info className="text-black" />
                        </span>
                      </div>
                    )}
                    <div
                      onClick={() => toggleInput("lh")}
                      className="flex w-full cursor-pointer items-center justify-center gap-5 rounded-lg bg-transparent"
                    >
                      <input
                        type="file"
                        className="hidden"
                        ref={lhRef}
                        multiple={false}
                        onChange={(e) => handleUpload(e, "lh")}
                        accept="image/png, image/jpg, image/jpeg"
                      />
                      {qImage ? (
                        <span>
                          <CircleCheckBig className="size-8 text-primary" />
                        </span>
                      ) : (
                        <span>
                          <CloudUpload className="size-8 text-primary" />
                        </span>
                      )}

                      <div className="flex flex-col items-center justify-center">
                        <span className="w-full text-left font-medium">
                          {qImage ? "File Uploaded" : "Upload Question Image"}
                          <span className="ml-1 text-xs text-gray-400">
                            (Optional)
                          </span>
                        </span>
                        <span className="w-full text-left text-xs text-gray-400">
                          {qImage
                            ? truncateString(qImage, 30)
                            : "Supported formats: .png, .jpg"}
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
