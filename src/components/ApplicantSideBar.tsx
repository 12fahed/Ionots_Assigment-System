"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { FileText, ChevronRight, Lock, LogOut, User, Settings, Menu } from "lucide-react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { getFirestore, doc, getDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUser } from "@/providers/UserProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import logo from "@/public/logo.png"
import Image from "next/image";

const Sidebar = dynamic(() => import("@/components/ui/sidebar").then((mod) => mod.Sidebar), { ssr: false });
const SidebarContent = dynamic(() => import("@/components/ui/sidebar").then((mod) => mod.SidebarContent), { ssr: false });
const SidebarHeader = dynamic(() => import("@/components/ui/sidebar").then((mod) => mod.SidebarHeader), { ssr: false });
const SidebarProvider = dynamic(() => import("@/components/ui/sidebar").then((mod) => mod.SidebarProvider), { ssr: false });

interface Assignment {
  id: string;
  title: string;
  subject: string;
  daysLeft: number;
  accepted: boolean;
  assignmentData: {
      title: string;
      endDate: Timestamp;
      file: string[];
      link: string;
      note: string;
      startDate: Timestamp; 
      subject: string;
  };
  userAssignmentData: {
    assignmentId: string;
    accepted: boolean;
    stage: 'Not Started' | 'In Progress' | 'Submitted' | 'Graded';
    submitted: boolean;
    submittedFiles: string[];
    submittedLink: string,
    submittedNote: string,
    submittedDate: Timestamp
    remarks: string;
    score: number;
    evaluated: boolean
  }
}

interface ApplicantSideBarProps {
  onAssignmentSelect: (assignment: Assignment) => void;
}

export function ApplicantSideBar({ onAssignmentSelect }: ApplicantSideBarProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const { user, setUser, setLoggedIn } = useUser();
  const router = useRouter();
  
  function handleAssignmentSelect(assignment:any){
    console.log("Assignemnt",assignment)
    onAssignmentSelect(assignment)
  }

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setLoggedIn(false);
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      router.push("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      const uid = user?.uid;
      if (!uid) return;

      try {
        const applicantDocRef = doc(db, "Applicant", uid);
        const applicantSnapshot = await getDoc(applicantDocRef);

        if (!applicantSnapshot.exists()) return;
        const { assignmentTrack } = applicantSnapshot.data();

        const assignmentsData: Assignment[] = [];
        for (let assignment of assignmentTrack) {

          const assignmentId = assignment.assignmentId
          const accepted = assignment.accepted
          const assignedDocRef = doc(db, "Assigned", assignmentId);
          const assignedSnapshot = await getDoc(assignedDocRef);

          if (assignedSnapshot.exists()) {
            const { title, subject, endDate } = assignedSnapshot.data();
            const assignmentData = assignedSnapshot.data()
            const daysLeft = Math.ceil((endDate.toDate() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            assignmentsData.push({
              id: assignmentId,
              title,
              subject,
              daysLeft,
              accepted, 
              assignmentData: {
                title: assignmentData.title,
                endDate: assignmentData.endDate,
                file: assignmentData.file,
                link: assignmentData.link,
                note: assignmentData.note,
                startDate: assignmentData.startDate, 
                subject: assignmentData.subject,
              },
              userAssignmentData: {
                assignmentId: assignment.assignmentId,
                accepted: assignment.accepted,
                stage: assignment.stage,
                submitted: assignment.submitted,
                submittedFiles: assignment.submittedFiles,
                submittedLink: assignment.submittedLink,
                submittedNote: assignment.submittedNote,
                submittedDate: assignment.submittedDate,
                remarks: assignment.remarks,
                score: assignment.score,
                evaluated: assignment.evaluated,
              }

            });
          }
        }

        setAssignments(assignmentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <SidebarProvider className="w-[20%]">
      <div className="flex h-screen">
        <Sidebar>
          <SidebarHeader className="border-b px-4 py-4 flex justify-between items-center">
            <Image
              src={logo}
              alt="logo"
              width={100}
              height={100}
              className="rounded-md"
            />
            <h2 className="text-lg font-semibold">Project Assignments</h2>
          </SidebarHeader>
          <SidebarContent>
            <div className="flex flex-col gap-2 p-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="cursor-pointer transition-colors hover:bg-accent" onClick={() => handleAssignmentSelect(assignment)}>
                  <CardContent className="flex items-start gap-3 p-4">
                    <FileText className="mt-1 h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                      {assignment.accepted === false ? (
                        <p className="mt-1 text-sm text-red-500">Click To Accept</p>
                      ) : (
                        <p className="mt-1 text-sm text-red-500">{assignment.daysLeft} days left to submit</p>
                      )}
                    </div>
                    <ChevronRight className="mt-1 h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </SidebarContent>
          <SidebarFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="link" className="ml-4 border border-black bg-blue-100 p-4">
                  <Settings className="mr-2 h-4 w-4" />
                  {`${user?.name || "User"}`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link href="/auth/change-password" className="flex items-center">
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
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 p-4">
          <div className="md:hidden">
            <SidebarTrigger>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </SidebarTrigger>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
