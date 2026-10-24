import * as React from "react";
import { RouterProvider } from "react-router-dom";
import { ToastProvider } from "@/components/ui";
import { SessionProvider } from "@/features/auth/context/SessionContext";
import { router } from "./router";

export function App() {
  return (
    <ToastProvider>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </ToastProvider>
  );
}

export default App;

