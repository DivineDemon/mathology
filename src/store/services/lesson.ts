import { api } from "./core";

export const lessonApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllLessons: build.query({
      query: (token: string) => ({
        url: "/lessons/creator/",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["lessons"],
      transformResponse: (response: {
        total: number;
        page: number;
        size: number;
        lessons: Lesson[];
      }) => response.lessons,
    }),
    postLesson: build.mutation({
      query: ({
        token,
        body,
      }: {
        token: string;
        body: {
          lesson_title: string;
          lesson_description: string;
          lesson_header: string;
          lesson_file: string;
          course_id: number;
          standard_id: number;
        };
      }) => ({
        url: "/lessons/",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      }),
      invalidatesTags: ["lessons"],
    }),
    deleteLesson: build.mutation({
      query: ({ token, id }: { token: string; id: number }) => ({
        url: `/lessons/${id}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["lessons"],
    }),
    updateLesson: build.mutation({
      query: ({
        token,
        id,
        body,
      }: {
        token: string;
        id: number;
        body: {
          lesson_title: string;
          lesson_description: string;
          lesson_header: string;
          lesson_file: string;
          course_id: number;
          standard_id: number;
        };
      }) => ({
        url: `/lessons/${id}`,
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      }),
      invalidatesTags: ["lessons", "lesson"],
    }),
    getLesson: build.query({
      query: ({ token, id }: { token: string; id: number }) => ({
        url: `/lessons/${id}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["lesson"],
      transformResponse: (response: Lesson) => response,
    }),
  }),
});

export const {
  useGetLessonQuery,
  usePostLessonMutation,
  useGetAllLessonsQuery,
  useDeleteLessonMutation,
  useUpdateLessonMutation,
} = lessonApi;
