import { Route, Routes } from "react-router-dom";

import GlobalLayout from "./components/global-layout";
import RouteGuard from "./components/route-guard";
import AddLesson from "./pages/add-lesson";
import Login from "./pages/login";
import MyLessons from "./pages/my-lessons";
import PracticeProblems from "./pages/practiceproblem";
import Profile from "./pages/profile";
import QuestionBank from "./pages/questionbank";
import QuestionCreation from "./pages/questioncreation";
import SolutionGuideline from "./pages/solutionguideline";

const App = () => {
  return (
    <Routes>
      <Route index element={<Login />} />
      <Route
        element={
          <RouteGuard>
            <GlobalLayout />
          </RouteGuard>
        }
      >
        <Route path="/dashboard" element={<MyLessons />} />
        <Route path="/dashboard/add-lesson" element={<AddLesson />} />
        <Route path="/dashboard/edit-lesson/:id" element={<AddLesson />} />
        <Route path="/questionbank" element={<QuestionBank />} />
        <Route
          path="/questionbank/create-question"
          element={<QuestionCreation />}
        />
        <Route
          path="/dashboard/editquestion/:id"
          element={<QuestionCreation />}
        />
        <Route path="/practiceproblems" element={<PracticeProblems />} />
        <Route path="/practiceproblems/:id" element={<SolutionGuideline />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default App;
