"use client";

import { store } from "@/context/store";
import { ThemeProvider } from "@/context/theme";
import AuthSessionProvider from "@/components/providers/AuthSessionProvider";
import NavigationLoader from "@/components/providers/NavigationLoader";
import { IndexType } from "@/interfaces/index.interface";
import { Provider } from "react-redux";

const Providers = ({ children }: IndexType) => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthSessionProvider>
          <NavigationLoader />
          {children}
        </AuthSessionProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default Providers;
