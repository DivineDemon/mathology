import { useEffect, useState } from "react";

import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import Image from "../assets/img/image.svg";
import Loginbg from "../assets/img/loginbg.svg";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const { login, isAuthenticated } = useKindeAuth();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (email) {
      await login({
        authUrlParams: {
          connection_id: `${import.meta.env.VITE_KINDE_EMAIL_CONNECTION_ID}`,
          login_hint: email,
        },
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-end bg-[#F5F6FA] p-2 dark:bg-gray-900 md:p-5">
      <nav className="flex h-12 w-full max-w-7xl items-center justify-start px-5">
        <span className="text-4xl font-bold text-primary dark:text-white">
          Mathology
        </span>
      </nav>
      <div className="grid h-[calc(100vh-1px)] w-full max-w-7xl grid-cols-2 gap-5 overflow-hidden p-5">
        <div className="relative col-span-2 flex w-full flex-col items-center justify-center gap-5 rounded-3xl border bg-[#FFFFFF] p-5 shadow-md dark:bg-gray-700/50 md:col-span-1 lg:p-10 xl:p-20">
          <div className="mb-5 flex w-full flex-col items-start justify-start gap-2">
            <span className="w-full text-center text-4xl font-extrabold">
              Login
            </span>
            <span className="text-md w-full text-center font-medium text-gray-400">
              Login to your existing account of Mathology
            </span>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col items-center justify-center gap-3"
          >
            <Label htmlFor="email" className="text-md w-full text-left">
              Email
            </Label>
            <Input
              className="border-sm mb-6 border bg-[#F8F7FC] shadow"
              type="email"
              placeholder="johndoe@email.com"
              value={email}
              required={true}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full"
            >
              Login
            </Button>
          </form>
        </div>
        <div className="relative col-span-1 hidden h-full w-full items-center justify-center rounded-3xl bg-blue-500 shadow-lg dark:bg-blue-500 md:flex">
          <img
            src={Loginbg}
            alt="login-image"
            className="z-0 h-full object-cover"
          />
          <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center rounded-3xl p-10">
            <p className="mt-4 w-full text-pretty text-center text-2xl font-bold text-white">
              Learn Mathematics in Easy Way!
            </p>
            <img src={Image} alt="uniform" className="h-full w-[70%]" />
          </div>
        </div>
      </div>
      <footer className="flex h-8 w-full items-center justify-center pt-4 text-xs">
        &copy; {new Date().getFullYear()} &nbsp;
        <span className="text-primary">mathology.</span>&nbsp; All Rights
        Reserved
      </footer>
    </div>
  );
};

export default Login;
