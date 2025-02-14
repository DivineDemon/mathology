import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Link } from "react-router-dom";

import MaxWidthWrapper from "./max-width-wrapper";
// import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";

const Navbar = () => {
  const { logout } = useKindeAuth();

  return (
    <div className="sticky inset-x-0 top-0 z-40 h-16 w-full border-b bg-background transition-all">
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="z-40 flex font-semibold">
            React<span className="text-primary">Lab</span>
          </Link>
          <div className="flex h-full items-center space-x-4">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => logout()}
            >
              Logout
            </Button>
            {/* <ModeToggle /> */}
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
};

export default Navbar;
