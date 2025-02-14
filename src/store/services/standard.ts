import { api } from "./core";

export const standardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllStandards: builder.query({
      query: (token: string) => ({
        url: "/standards/",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["standards"],
      transformResponse: (response: {
        total: number;
        page: number;
        size: number;
        standards: Standard[];
      }) => response.standards,
    }),
    postStandard: builder.mutation({
      query: ({
        token,
        body,
      }: {
        token: string;
        body: {
          standard_title: string;
        };
      }) => ({
        url: "/standards/",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      }),
      invalidatesTags: ["standards"],
    }),
    getStandard: builder.query({
      query: (token: string) => ({
        url: "/standards/",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["standard"],
      transformResponse: (response: Standard) => response,
    }),
    updateStandard: builder.mutation({
      query: ({
        id,
        token,
        body,
      }: {
        id: string;
        token: string;
        body: {
          standard_title: string;
        };
      }) => ({
        url: `/standards/${id}`,
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      }),
      invalidatesTags: ["standard", "standards"],
    }),
    deleteStandard: builder.mutation({
      query: ({ token, id }: { token: string; id: number }) => ({
        url: `/standards/${id}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["standards"],
    }),
  }),
});

export const {
  useGetStandardQuery,
  useGetAllStandardsQuery,
  usePostStandardMutation,
  useUpdateStandardMutation,
  useDeleteStandardMutation,
} = standardApi;
