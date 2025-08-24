import React from "react";
import { createBrowserRouter, RouterProvider, useRouteError, Navigate } from "react-router-dom";

import { ErrorBoundary } from "@components";
import { Home, VoiceAssistant, Health, CallSummary } from "@pages";
import { APP_ROUTES } from "@constants";


const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();
  return (
    <ErrorBoundary>
      <div className="flex flex-col items-center justify-center h-screen w-full">
        <h1 className="text-2xl font-bold text-red-500">Something went wrong</h1>
        <p className="text-gray-500 mt-[10px]">{String(error)}</p>
      </div>
    </ErrorBoundary>
  );
};

const router = createBrowserRouter([
  {
    path: APP_ROUTES.HOME,
    element: <Home />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: `${APP_ROUTES.VOICE_ASSISTANT}/:roomId?`,
    element: (
        <VoiceAssistant />
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: APP_ROUTES.CALL_SUMMARY,
    element: (
        <CallSummary />
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/",
    element: <Navigate to={APP_ROUTES.HOME} replace />,
  },
  {
    path: APP_ROUTES.HEALTH,
    element: <Health />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "*",
    element: <Navigate to={APP_ROUTES.HOME} replace />,
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
