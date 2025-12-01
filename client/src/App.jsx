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
import LearningEnvironment from "./components/common/LearningEnvironment";
import { Toaster } from "react-hot-toast";
import UploadProgram from "./pages/UploadProgram";
import TestFileView from "./pages/TestFileView";
import CourseLearnPage from "./components/common/CourseLearnPage";
import VerifyAccess from "./components/common/AccessProtectedRoute";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

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

      {/* Navbar always renders */}
      <Navbar hide={hideNavbar} />

      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />

          {/* USER PROTECTED ROUTES */}
          <Route
            path="/course/live-tests"
            element={
              <VerifyAccess>
                <LiveTests />
              </VerifyAccess>
            }
          />

          <Route
            path="/start-test/:id"
            element={
              <VerifyAccess>
                <StartTest />
              </VerifyAccess>
            }
          />

          <Route
            path="/course/typing-tests"
            element={
              <VerifyAccess>
                <TypingTest />
              </VerifyAccess>
            }
          />

          <Route
            path="/programming-test"
            element={
              <VerifyAccess>
                <ProgrammingPractice />
              </VerifyAccess>
            }
          />

          <Route
            path="/test/:courseTitle/:testId"
            element={
              <VerifyAccess>
                <TestEnvironment />
              </VerifyAccess>
            }
          />

          <Route
            path="/test/view/:id"
            element={
              <VerifyAccess>
                <TestFileView />
              </VerifyAccess>
            }
          />

          <Route
            path="/course/:courseTitle"
            element={
              <VerifyAccess>
                <CoursePage />
              </VerifyAccess>
            }
          />

          <Route
            path="/course/:category/:courseTitle"
            element={
              <VerifyAccess>
                <LearningEnvironment />
              </VerifyAccess>
            }
          />

          <Route
            path="/learn/:courseTitle"
            element={
              <VerifyAccess>
                <CourseLearnPage />
              </VerifyAccess>
            }
          />

          {/* ✅ FULLY PROTECTED ADMIN ROUTES */}
          <Route
            element={
              <VerifyAccess>
                <ProtectedAdminRoute />
              </VerifyAccess>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/users" element={<User />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/test" element={<TestUploader />} />
            <Route path="/admin/results" element={<AdminResults />} />
            <Route path="/upload-test" element={<UploadTest />} />
            <Route path="/upload-program" element={<UploadProgram />} />
            <Route path="/tests" element={<TestList />} />
            <Route path="/upload-options" element={<UploadOptions />} />
            <Route
              path="/upload-learning-material"
              element={<UploadLearningMaterial />}
            />
          </Route>

          {/* NOT FOUND */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
