import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbaar";
import ProtectedAdminRoute from "./components/common/ProtectedAdminRoute";
import ScrollToTop from "./components/common/ScrollToTop";
import Home from "./components/Home/Home";
import ProfilePage from "./pages/UserProfileDetails";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import User from "./components/Admin/UserPage";
import AdminDashboard from "./pages/AdminDashboard";
import Feedback from "./components/Admin/Feedback";
import TestUploader from "./components/Admin/TestManager";
import LiveTests from "./components/Courses/Live Test/LiveTests";
import StartTest from "./components/Courses/Live Test/StartTest";
import UploadOptions from "./pages/UploadOptions";
import UploadLearningMaterial from "./components/Admin/UploadLearningMaterial";
import AdminResults from "./pages/AdminResults";
import TypingTest from "./components/Typing/TypingTest";
import ProgrammingPractice from "./components/Programming/ProgrammingPractice";
import UploadTest from "./pages/UploadTest";
import TestList from "./pages/TestList";
import CoursePage from "./components/common/CoursePage";
import TestEnvironment from "./components/common/TestEnvironment";
import NotFound from "./pages/NotFound";
import { Toaster } from "react-hot-toast";

function App() {
  const [hideNavbar, setHideNavbar] = useState(false);

  useEffect(() => {
    const handler = (e) => setHideNavbar(e.detail);
    window.addEventListener("fullscreen-change", handler);
    return () => window.removeEventListener("fullscreen-change", handler);
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "12px",
            padding: "16px 20px",
            fontSize: "15px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            color: "#fff",
          },
          success: {
            style: {
              background: "#4ade80",
              color: "#1e293b",
              fontWeight: "600",
            },
          },
          error: {
            style: {
              background: "#f87171",
              color: "#1e293b",
              fontWeight: "600",
            },
          },
          loading: { style: { background: "#60a5fa", color: "#fff" } },
        }}
      />

      {/* Navbar — always mounted, visibility controlled via prop */}
      <Navbar hide={hideNavbar} />

      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/course/live-tests" element={<LiveTests />} />
          <Route path="/start-test/:id" element={<StartTest />} />
          <Route path="/course/typing-tests" element={<TypingTest />} />
          <Route path="/programming-test" element={<ProgrammingPractice />} />
          <Route path="/test/start/:testId" element={<TestEnvironment />} />
          <Route path="/course/:courseTitle" element={<CoursePage />} />

          {/* Admin protected routes */}
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/users" element={<User />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/test" element={<TestUploader />} />
            <Route path="/admin/results" element={<AdminResults />} />
            <Route path="/upload-test" element={<UploadTest />} />
            <Route path="/tests" element={<TestList />} />
            <Route path="/upload-options" element={<UploadOptions />} />
            <Route
              path="/upload-learning-material"
              element={<UploadLearningMaterial />}
            />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
