import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessToken } from "@/lib/auth-token";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "http://localhost:3001/backend/v1";

export const api = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders: headers => {
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
