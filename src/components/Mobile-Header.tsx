import {
  Home,
  LogOut,
  Menu,
  User,
  History,
  Lock,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ui/modeToggle";
import Image from "next/image";

import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useUser } from "@/providers/UserProvider";
import { auth } from "@/config/firebase";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const MobileHeader = ({ userType }: { userType: string }) => {
  const { theme } = useTheme();
  const { user, setUser, setLoggedIn } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setLoggedIn(false);
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      router.push("/auth");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const pathname = usePathname();
  const getLinkClasses = (path: string) => {
    return pathname === path
      ? "flex items-center gap-2 px-2 py-2 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-700 shadow-lg dark:shadow-blue-600/50 transition-all duration-300 ease-in-out"
      : "flex items-center gap-2 px-2 py-2 text-gray-700 dark:text-gray-300 transition-all duration-300 ease-in-out hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/50";
  };

  return (
    <header className="flex w-screen h-14 items-center justify-between gap-4 border-b  px-4 mt-3 lg:h-[60px] lg:px-6  md:hidden lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="flex flex-col w-[50%]">
          {/* Links */}

          <nav className="grid gap-2 text-sm font-medium mt-[20%] space-y-3">
            <Link href="/dashboard" className={getLinkClasses("/dashboard")}>
              <Home className="h-4 w-4" />
              Home
            </Link>


            {(userType === "hod" || userType === "principal" || userType === "examdept") && (
                <>
                  <Link href="/dashboard/history" className={getLinkClasses("/dashboard/history")}>
                    <History className="h-4 w-4" />
                    Past Notifications
                  </Link>
                </>
            )}

          </nav>

          {/* Account Dropdown */}
          <div className="mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="link" className="ml-4">
                  <User className="mr-2 h-4 w-4" />
                  {`${user?.name}`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
              <DropdownMenuItem>
                <Link
                  href="/auth/change-password"
                  className="flex items-center"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </Link>
              </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex float-right space-x-3">
        <ModeToggle />
      </div>
    </header>
  );
};

export default MobileHeader;
