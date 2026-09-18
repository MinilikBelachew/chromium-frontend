"use client";

import { store } from "@/context/store";
import { ThemeProvider } from "@/context/theme";
import { IndexType } from "@/interfaces/index.interface";
import { Provider } from "react-redux";

const Providers = ({ children }: IndexType) => {
  return (
    <Provider store={store}>
      <ThemeProvider>{children}</ThemeProvider>
    </Provider>
  );
};

export default Providers;
