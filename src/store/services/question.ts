import { api } from "./core";

export const questionApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllQuestions: build.query({
      query: (token: string) => ({
        url: "/questions/creator/",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["questions"],
      transformResponse: (response: {
        total: number;
        page: number;
        size: number;
        questions: Question[];
      }) => response.questions,
    }),
    postQuestion: build.mutation({
      query: ({
        token,
        body,
      }: {
        token: string;
        body: {
          question_title: string;
          question_description: string;
          status: string;
          difficulty_level: string;
          question_type: string;
          answer_type: string;
          solution_file: string;
          standard_id: number;
          course_id: number;
          lesson_id: number;
          skill_tags: string[];
        };
      }) => ({
        url: "/questions/",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      }),
      invalidatesTags: ["questions"],
    }),
    getQuestion: build.query({
      query: ({ id, token }: { id: number; token: string }) => ({
        url: `/questions/id/?question_id=${id}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["question"],
      transformResponse: (response: Question) => response,
    }),
    updateQuestion: build.mutation({
      query: ({
        id,
        token,
        body,
      }: {
        id: number;
        token: string;
        body: {
          question_title: string;
          question_description: string;
          status: string;
          difficulty_level: string;
          question_type: string;
          answer_type: string;
          solution_file: string;
          standard_id: number;
          course_id: number;
          lesson_id: number;
          skill_tags: string[];
        };
      }) => ({
        url: `/questions/${id}`,
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      }),
      invalidatesTags: ["question", "questions"],
    }),
    deleteQuestion: build.mutation({
      query: ({ id, token }: { id: number; token: string }) => ({
        url: `/questions/${id}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["questions"],
    }),
  }),
});

export const {
  useGetQuestionQuery,
  usePostQuestionMutation,
  useGetAllQuestionsQuery,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} = questionApi;
