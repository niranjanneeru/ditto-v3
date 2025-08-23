import { Toaster } from "sonner";
import { ErrorBoundary } from "@components";

import { AppRouter } from "./routes";

function App() {
  return (
    <ErrorBoundary>
      <Toaster position="bottom-right" richColors />
      <AppRouter />
    </ErrorBoundary>
  );
}

export default App;
