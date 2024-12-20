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
} from "firebase/firestore";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/providers/UserProvider";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader } from "lucide-react";
import { ModeToggle } from "./ui/modeToggle";
import Link from "next/link";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import type { Container, Engine } from "@tsparticles/engine";

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
  const [email, setEmail] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const { user, setUser, setLoggedIn } = useUser();
  const [loading, setLoading] = useState<boolean>(false);

  const [ init, setInit ] = useState(false);

  useEffect(() => {
      initParticlesEngine(async (engine) => {
          await loadFull(engine);
      }).then(() => {
          setInit(true);
      });
  }, [])

  const particlesLoaded = (container: any): Promise<void> => {
    return new Promise((resolve) => {
      console.log(container);
      resolve();
    });
  };

  useEffect(() => {
    if (user) {
      router.push("/landing");
    } else {
      const storedEmail = localStorage.getItem("rememberMeEmail");
      const storedPassword = localStorage.getItem("rememberMePassword");
      if (storedEmail && storedPassword) {
        setEmail(storedEmail);
        setPassword(storedPassword);
        setRememberMe(true);
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

  const updateUserState = (data: UserData, uid: string) => {
    setUser({
      name: data.name,
      email: data.email,
      type: data.type,
      uid,
    });
    setLoggedIn(true);
  };

  const handleLoginSuccess = (email: string, password: string) => {
    if (rememberMe) {
      localStorage.setItem("rememberMeEmail", email);
      localStorage.setItem("rememberMePassword", password);
    } else {
      localStorage.removeItem("rememberMeEmail");
      localStorage.removeItem("rememberMePassword");
    }
    toast({
      title: "Sign In successful",
      description: "Redirecting to dashboard",
    });
    router.push("/dashboard");
  };

  const loginMsg = async () => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { user } = userCredential;

      const collections = ["Applicant", "Instructor"];
      for (const collectionName of collections) {
        const docRef = doc(db, collectionName, user.uid);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          updateUserState(docSnapshot.data() as UserData, user.uid);
          handleLoginSuccess(email, password);
          return;
        }
      }

      toast({
        title: "Sign In successful",
        description: "Redirecting to dashboard",
      });
    } catch (error) {
      console.error("Error signing in: ", error);
      toast({
        title: "Error signing in",
        description: "Please check your email and password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  async function forgotPassword(event: any): Promise<void> {
    if (email) {
      try {
        // Define collections to search in
        const collectionsToSearch = ["Applicant", "Instructor"];
        let emailFound = false;
  
        // Iterate over each collection
        for (const collectionName of collectionsToSearch) {
          const q = query(collection(db, collectionName), where("email", "==", email));
          const querySnapshot = await getDocs(q);
  
          if (!querySnapshot.empty) {
            emailFound = true;
  
            // Send Firebase reset password email
            const auth = getAuth(); // Initialize Firebase Auth
            await sendPasswordResetEmail(auth, email);
  
            toast({
              title: "Password Reset Link Sent",
              description: `A password reset link has been sent to ${email}`,
              variant: "default",
            });
            break; // Exit loop after finding a match
          }
        }
  
        if (!emailFound) {
          toast({
            title: "Error",
            description: "No matching emails found in our records.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error processing password reset: ", error);
        toast({
          title: "Error",
          description: "An error occurred while processing your request.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
    }
  }
  

  return (
    <div className="relative flex justify-center items-center h-screen">
      {/* Particles Background */}
      <div className="absolute inset-0 -z-10">
        <Particles
          id="tsparticles"
          particlesLoaded={particlesLoaded}
          options={{
            background: { color: { value: "#f9f8ff" } },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: { enable: true, mode: "push" },
                onHover: { enable: true, mode: "repulse" },
                resize: {
                  enable: true,
                },
              },
              modes: {
                push: { quantity: 4 },
                repulse: { distance: 200, duration: 0.4 },
              },
            },
            particles: {
              color: { value: "#000000" },
              links: {
                color: "#000000",
                distance: 150,
                enable: true,
                opacity: 0.5,
                width: 1,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: { default: "bounce" },
                random: false,
                speed: 6,
                straight: false,
              },
              number: {
                density: { enable: true, height:800, width:800 },
                value: 80,
              },
              opacity: { value: 0.5 },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 5 } },
            },
            detectRetina: true,
          }}
        />
      </div>
  
      {/* Main Content */}
      {/* Main Content */}
      <Card className="relative z-10 w-full max-w-md border border-gray-300 bg-white rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl">
        <CardHeader className="text-center py-6">
          <CardTitle className="text-3xl font-extrabold text-gray-900 tracking-wide">
            Sign In
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 mt-2">
            Welcome to Ionots Website
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col space-y-4">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={handleChange(setEmail)}
                className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div className="flex flex-col space-y-4">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={handleChange(setPassword)}
                className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Switch
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={handleRememberMeChange}
                className="focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              <Label htmlFor="remember-me" className="text-sm text-gray-700">
                Remember Me
              </Label>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <div className="flex flex-col items-center space-y-4">
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-md hover:bg-gradient-to-l focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200"
              onClick={loginMsg}
              disabled={!email || !password || loading}
            >
              {loading ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>

            <div
              className="text-sm text-blue-500 hover:underline hover:cursor-pointer mt-2"
              onClick={forgotPassword}
            >
              Forgot password?
            </div>
          </div>
        </CardFooter>
      </Card>

    </div>
  );
  
};

export default SignIn;
