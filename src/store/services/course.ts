import { api } from "./core";

export const courseApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllCourses: build.query({
      query: (token: string) => ({
        url: "/courses/",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["courses"],
      transformResponse: (response: {
        total: number;
        page: number;
        size: number;
        data: Course[];
        courses: Course[];
      }) => response.courses,
    }),
    postCourse: build.mutation({
      query: ({
        token,
        body,
      }: {
        token: string;
        body: {
          course_title: string;
        };
      }) => ({
        url: "/courses/",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      }),
      invalidatesTags: ["courses"],
    }),
    getCourse: build.query({
      query: ({ id, token }: { id: string; token: string }) => ({
        url: `/courses/${id}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["course"],
      transformResponse: (response: Course) => response,
    }),
    updateCourse: build.mutation({
      query: ({
        id,
        token,
        body,
      }: {
        id: number;
        token: string;
        body: {
          course_title: string;
        };
      }) => ({
        url: `/courses/${id}`,
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      }),
      invalidatesTags: ["courses", "course"],
    }),
    deleteCourse: build.mutation({
      query: ({ id, token }: { id: string; token: string }) => ({
        url: `/courses/${id}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["courses"],
    }),
  }),
});

export const {
  useGetCourseQuery,
  useGetAllCoursesQuery,
  usePostCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} = courseApi;
