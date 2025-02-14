import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * import { RootState } from "..";
 * import the above type to keep typescript happy while using global store
 */
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BASE_API_URL,
  /**
   * prepareHeaders: (headers, { getState }) => {...}
   * change the function definition below to the above example if you need to access global store
   */
  prepareHeaders: (headers) => {
    /**
     * Add Global Headers Here
     * Any Header Value that needs to be added to every request must be added here.
     * `headers` parameter provides access to the API request headers
     * `getState` function provides access to the current global store
     */

    /**
     * Example getState Usage
     * const token = (getState() as RootState).global.user?.token;
     * if (token) headers.set("Authorization", `Bearer ${token}`);
     */
    return headers;
  },
});

const baseQueryWith401Handling: typeof baseQuery = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    window.location.replace("?intent='terminated'");
  }

  return result;
};

export const api = createApi({
  baseQuery: baseQueryWith401Handling,
  keepUnusedDataFor: 5,
  tagTypes: [
    "course",
    "courses",
    "lesson",
    "lessons",
    "standard",
    "standards",
    "question",
    "questions",
    "skilltag",
    "skilltags",
  ],
  endpoints: () => ({}),
});
