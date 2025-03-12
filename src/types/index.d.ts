declare type Course = {
  course_title: string;
  course_id: number;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
};

declare type Lesson = {
  standard_title: string;
  lesson_id: number;
  lesson_description: string;
  lesson_file: string;
  updated_at: string | null;
  lesson_title: string;
  user_id: string;
  course_title: string;
  lesson_header: string;
  created_at: string;
  deleted_at: string;
  skill_tags: string[];
  status: string;
  is_published: boolean | null;
};

declare type Standard = {
  standard_id: number;
  standard_title: string;
  created_at: string;
  updated_at: string | null;
};

declare type Question = {
  question_id: number;
  user_id: string;
  question_title: string;
  question_description: string;
  status: string;
  difficulty_level: string;
  question_type: string;
  answer_type: string;
  solution_file: string;
  created_at: string;
  updated_at: string | null;
  lesson_title: string;
  course_title: string;
  standard_title: string;
  skill_tags: string[];
  image_url: string | null;
};

declare type User = {
  user_id?: string;
  name: string;
  email: string;
  designation: string;
  account_type: string;
  profile_picture_url: string;
  created_at?: string;
  updated_at?: string | null;
  total_question?: number;
  total_lesson?: number;
};
