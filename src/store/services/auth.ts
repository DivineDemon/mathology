import { api } from "./core";

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation({
      query: ({ body, token }: { body: User; token: string }) => ({
        url: "/auth/register",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      }),
    }),
    getUser: build.query({
      query: (token: string) => ({
        url: "/users/me",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["user"],
      transformResponse: (response: User) => response,
    }),
    putUser: build.mutation({
      query: ({
        token,
        body,
      }: {
        token: string;
        body: {
          name: string;
          designation: string;
        };
      }) => ({
        url: "/users/edit",
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      }),
      invalidatesTags: ["user"],
      transformResponse: (response: User) => response,
    }),
    userStats: build.query({
      query: (token: string) => ({
        url: "/user-statistics/count",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      transformResponse: (response: {
        practice_questions: number;
        actual_questions: number;
        total_lessons: number;
        published_lessons: number;
      }) => response,
    }),
  }),
});

export const {
  useRegisterMutation,
  useGetUserQuery,
  usePutUserMutation,
  useUserStatsQuery,
} = authApi;
