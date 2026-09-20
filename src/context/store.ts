import { configureStore } from "@reduxjs/toolkit";
import menuReducer from "./slices/menuSlice";
import { api } from "./services";
import "./services/authApi";
import "./services/adminApi";
import "./services/analyticsApi";
import "./services/gamesApi";

export const store = configureStore({
  reducer: {
    menu: menuReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
