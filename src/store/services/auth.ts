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
      transformResponse: (response: User) => response,
    }),
  }),
});

export const { useRegisterMutation, useGetUserQuery } = authApi;
