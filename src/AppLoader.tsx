import { lazy, Suspense } from "react";
import AppBootstrap from "./AppBootstrap";

const App = lazy(() => import("./App"));

export default function AppLoader() {
  return (
    <Suspense fallback={<AppBootstrap />}>
      <App />
    </Suspense>
  );
}
