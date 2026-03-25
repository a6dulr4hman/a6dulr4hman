import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";

const MainContainer = lazy(() => import("./components/MainContainer"));
const MyWorks = lazy(() => import("./pages/MyWorks"));
const Resume = lazy(() => import("./pages/Resume"));
import { LoadingProvider } from "./context/LoadingProvider";
import { ConfigProvider } from "./context/ConfigContext";

const App = () => {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <LoadingProvider>
                <Suspense>
                  <MainContainer />
                </Suspense>
              </LoadingProvider>
            }
          />
          <Route
            path="/myworks"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <MyWorks />
              </Suspense>
            }
          />
          <Route
            path="/resume"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <Resume />
              </Suspense>
            }
          />
        </Routes>
        <Analytics />
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
