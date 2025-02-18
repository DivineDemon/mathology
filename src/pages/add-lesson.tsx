import { ChangeEvent, useEffect, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { CircleCheckBig, CloudUpload, Loader2, X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

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
import {
  useGetLessonQuery,
  usePostLessonMutation,
  useUpdateLessonMutation,
} from "@/store/services/lesson";
import { useGetAllStandardsQuery } from "@/store/services/standard";

const lessonFormSchema = z.object({
  standard: z.string().min(1, "Standard is required"),
  course: z.string().min(1, "Course is required"),
  lesson: z.string().min(1, "Lesson is required"),
  skill_tags: z
    .array(
      z.object({
        id: z.string(),
        value: z.string(),
      })
    )
    .min(1, { message: "At least one skill tag is required" }),
  lesson_description: z.string().min(1, "Lesson description is required"),
});

const AddLesson = () => {
  const { id } = useParams();
  const { getToken } = useKindeAuth();
  const navigate = useNavigate();
  const lRef = useRef<HTMLInputElement>(null);
  const lhRef = useRef<HTMLInputElement>(null);
  const [token, setToken] = useState<string>("");
  const [lesson, setLesson] = useState<string>("");
  const [lessonHeader, setLessonHeader] = useState<string>("");
  const [currentSkill, setCurrentSkill] = useState<string>("");
  const [postLesson, { isLoading: posting }] = usePostLessonMutation();
  const [updateLesson, { isLoading: updating }] = useUpdateLessonMutation();
  const [lessonHeaderFileName, setLessonHeaderFileName] = useState<string>("");
  const [lessonFileName, setLessonFileName] = useState<string>("");

  const form = useForm<z.infer<typeof lessonFormSchema>>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      standard: "",
      course: "",
      lesson: "",
      skill_tags: [],
      lesson_description: "",
    },
  });

  const { data } = useGetLessonQuery(
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    // @ts-ignore
    name: "skill_tags",
  });

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

  const handleToken = async () => {
    let token: string | undefined = "";

    if (getToken) {
      token = await getToken();
    }

    setToken(token || "");
  };

  const toggleInput = (toToggle: string) => {
    if (toToggle === "lh") {
      if (lhRef.current) {
        lhRef.current.click();
      }
    } else {
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
          const imageUrl = URL.createObjectURL(file);
          setLessonHeader(imageUrl);
          setLessonHeaderFileName(file.name);
        } else {
          toast.custom(() => (
            <CustomToast
              type="error"
              title="Error"
              description="Please upload a valid image file (png, jpg, jpeg)."
            />
          ));
        }
      } else if (type === "l") {
        if (file.type === "application/pdf") {
          const pdfText = await extractPdfText(file);
          setLesson(pdfText);
          setLessonFileName(file.name);
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

  const handleSubmit = async (values: z.infer<typeof lessonFormSchema>) => {
    const newLesson = {
      lesson_title: values.lesson,
      lesson_description: values.lesson_description,
      lesson_header: lessonHeader,
      lesson_file: lesson,
      course_id: Number(
        courses?.filter((course) => course.course_title === values.course)[0]
          .course_id
      ),
      standard_id: Number(
        standards?.filter(
          (standard) => standard.standard_title === values.standard
        )[0].standard_id
      ),
      skill_tags: values.skill_tags.map((tag) => tag.value),
    };

    try {
      if (!id) {
        await postLesson({
          token,
          body: newLesson,
        });
      } else {
        await updateLesson({
          id: Number(id),
          token,
          body: newLesson,
        });
      }

      toast.custom(() => (
        <CustomToast
          title="Success"
          type="success"
          description={`Topic ${id ? "Updated" : "Created"} Successfully!`}
        />
      ));
      navigate("/dashboard");
    } catch (error) {
      toast.custom(() => (
        <CustomToast
          title="Error"
          type="error"
          description="Something went wrong!"
        />
      ));
    }
  };

  useEffect(() => {
    handleToken();

    if (data) {
      form.setValue("standard", data.standard_title);
      form.setValue("course", data.course_title);
      form.setValue("lesson", data.lesson_title);
      form.setValue("lesson_description", data.lesson_description);

      const skills = data?.skill_tags.map((skill) => {
        return {
          id: "",
          value: skill,
        };
      });
      form.setValue("skill_tags", skills);
    }
  }, [getToken, data]);

  return (
    <div className="flex h-screen w-full flex-col items-start justify-start overflow-y-auto">
      <nav className="flex h-16 w-full items-center justify-between border-b p-5">
        <div className="flex items-center justify-center gap-4">
          <SidebarTrigger className="block lg:hidden" />
          <div className="text-3xl font-bold lg:text-4xl">
            {id ? "Edit" : "Add"} Lesson
          </div>
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
                My Lessons
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-gray-500 dark:text-gray-300">
                {id ? "Edit" : "Add"} Lesson
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {!standardloading && !courseLoading ? (
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
              <FormField
                control={form.control}
                name="lesson"
                render={({ field }) => (
                  <FormItem className="col-span-2 w-full">
                    <FormLabel>Lesson</FormLabel>
                    <Input placeholder="Lesson Name" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="col-span-4 flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="skill_tags"
                  render={() => (
                    <FormItem className="col-span-4 w-full">
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
                  <div className="col-span-4 flex w-full max-w-full items-center justify-start gap-5 overflow-x-auto">
                    {form.watch("skill_tags").map((tag, index) => (
                      <div
                        key={index}
                        onClick={() => remove(index)}
                        className="flex w-fit cursor-pointer items-center justify-center gap-2 rounded-md border border-primary bg-primary/20 px-4 py-1 text-blue-700"
                      >
                        <span className="pb-0.5 text-[14px] capitalize">
                          {tag.value}
                        </span>
                        <X className="size-3.5" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <FormField
                control={form.control}
                name="lesson_description"
                render={({ field }) => (
                  <FormItem className="col-span-4 w-full">
                    <FormLabel>Lesson Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Lesson Description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="col-span-4 flex h-full w-full items-center justify-center gap-5 rounded-lg bg-white px-5 py-[110px] lg:gap-10 lg:p-[65px]">
                <div
                  onClick={() => toggleInput("lh")}
                  className="flex w-full cursor-pointer items-center justify-center gap-5 rounded-lg bg-gray-100 px-4 py-4 lg:w-96 lg:px-10"
                >
                  <input
                    type="file"
                    className="hidden"
                    ref={lhRef}
                    multiple={false}
                    onChange={(e) => handleUpload(e, "lh")}
                    accept="image/png, image/jpg, image/jpeg"
                  />
                  {lessonHeaderFileName ? (
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
                      {lessonHeaderFileName
                        ? "File Uploaded"
                        : "Upload Lesson Header"}
                    </span>
                    <span className="w-full text-left text-xs text-gray-400">
                      {lessonHeaderFileName
                        ? lessonHeaderFileName
                        : "Supported formats: .png, .jpg, .jpeg"}
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => toggleInput("l")}
                  className="flex w-full cursor-pointer items-center justify-center gap-5 rounded-lg bg-primary px-4 py-4 text-white lg:w-96 lg:px-10"
                >
                  <input
                    type="file"
                    className="hidden"
                    ref={lRef}
                    multiple={false}
                    onChange={(e) => handleUpload(e, "l")}
                    accept="application/pdf"
                  />
                  {lessonFileName ? (
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
                      {lessonFileName ? "File Uploaded" : "Upload Lesson"}
                    </span>
                    <span className="w-full text-left text-xs text-white/80">
                      {lessonFileName
                        ? lessonFileName
                        : "Supported formats: .pdf"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-span-4 flex w-full cursor-pointer items-end justify-end pb-5">
                <Button
                  type="submit"
                  variant="default"
                  className="w-fit text-white"
                  disabled={posting || updating}
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
  );
};

export default AddLesson;
