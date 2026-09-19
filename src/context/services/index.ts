import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessToken } from "@/lib/auth-token";

const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "/backend/v1";

  // If in browser and on HTTPS, ensure request is also HTTPS (or relative) to prevent Mixed Content
  if (typeof window !== "undefined") {
    if (window.location.protocol === "https:" && url.startsWith("http://")) {
      url = url.replace(/^http:/, "https:");
    }
  }

  if (url.endsWith("/backend")) {
    url = `${url}/v1`;
  }
  return url;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      const token = getAccessToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Auth", "Onboarding", "Analytics"],
  endpoints: () => ({}),
});
