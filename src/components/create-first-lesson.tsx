import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Logo from "../assets/img/logo.svg";
import { Button } from "./ui/button";

const CreateFirstLesson = () => {
  const navigate = useNavigate();
  return (
    <div className="flex w-2/5 flex-col items-center justify-center gap-5 rounded-2xl bg-white px-6 py-8 shadow-sm">
      <img src={Logo} className="" alt="Data Not Found" />
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold">Create Your First Lesson</h1>
        <span className="text-center text-sm text-gray-500">
          Start your teaching journey by creating an engaging lesson. Share your
          knowledge and help students learn something new!.
        </span>
      </div>
      <Button
        className="mx-10 w-full"
        onClick={() => navigate("/dashboard/add-lesson")}
      >
        <Plus className="mr-2 h-4 w-4" /> Create New Lesson
      </Button>
    </div>
  );
};

export default CreateFirstLesson;
