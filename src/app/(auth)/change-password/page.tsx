"use client";
import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { db, auth } from "@/config/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/providers/UserProvider";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

interface UserData {
  name: string;
  email: string;
  type: string;
  uid: string;
}

const SignIn: React.FC = () => {
  const { toast } = useToast();
  const router = useRouter();
  const isMounted = useRef(true);
  const [password, setPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>(""); // For new password
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const { user, setUser, setLoggedIn } = useUser();
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    if (!user) {
      router.push("/auth");
    } else {
      const storedEmail = localStorage.getItem("rememberMeEmail");
      const storedPassword = localStorage.getItem("rememberMePassword");
      if (storedEmail && storedPassword) {
        setEmail(storedEmail);
        setPassword(storedPassword);
        setRememberMe(true);
        if (user.email) {
          setEmail(user.email);
        }
      }
    }
    return () => {
      isMounted.current = false;
    };
  }, [user, router]);

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setter(e.target.value);

  const handleRememberMeChange = (checked: boolean) => setRememberMe(checked);

  // const updateUserState = (data: UserData, uid: string) => {
  //   setUser({
  //     name: data.name,
  //     email: data.email,
  //     type: data.type,
  //     uid,
  //   });
  //   setLoggedIn(true);
  // };

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      if (newPassword !== confirmPassword) {
        toast({
          title: "Error",
          description: "Enter confirmed password correctly",
          variant: "destructive",
        });
        return;
      }
      if (!newPassword) {
        toast({
          title: "Error",
          description: "Please enter a new password",
          variant: "destructive",
        });
        return;
      }
      // console.log(user?.email, password, newPassword);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // console.log(userCredential);
      if (userCredential.user) {
        await updatePassword(userCredential.user, newPassword);

        toast({
          title: "Password Updated",
          description: "Your password has been reset successfully",
        });

        setPassword("");
        setNewPassword("");
        setConfirmPassword("");

        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error resetting password: ", error);
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center items-center h-screen"
      suppressHydrationWarning
    >
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Type in your new password</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-4">
            <div className="flex flex-col items-start space-y-2">
              <Label htmlFor="email">Email</Label>
              <p>{user?.email}</p>{" "}
            </div>
            <div className="flex flex-col items-start space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={handleChange(setPassword)}
              />
            </div>
            <div className="flex flex-col items-start space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={handleChange(setNewPassword)}
              />
            </div>
            <div className="flex flex-col items-start space-y-2">
              <Label htmlFor="new-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={handleChange(setConfirmPassword)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={handleRememberMeChange}
              />
              <Label htmlFor="remember-me">Remember Me</Label>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col items-center w-full space-y-2">
            <Button
              className="w-full"
              onClick={handleResetPassword}
              disabled={
                !password || !newPassword || !confirmPassword || loading
              }
            >
              {loading ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Reset Password"
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignIn;
