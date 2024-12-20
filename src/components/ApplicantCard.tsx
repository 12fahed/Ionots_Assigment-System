"use client"

import React, { useState, useEffect, ReactNode } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, FileText, GraduationCap, Link } from 'lucide-react';
import { db } from '@/config/firebase';
import { doc, Timestamp, getDoc, updateDoc } from 'firebase/firestore';
import { dateFormat } from '@/constants/dateFormat';
import { Button } from './ui/button';
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator"
import FileViewerModal from './FileViewerModal';
import { SubmitAssignmentDialog } from './SubmissionModal';

interface Assignment {
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

interface SubmitAssignmentData {
  fileUrl: string;
  assignmentLink: string;
  notes: string;
}

interface ApplicantCardProps {
  assignment: Assignment;
}

const statusToStep = {
  'Not Started': 1,
  'In Progress': 2,
  'Submitted': 3,
  'Graded': 4,
};

const statusToColor = {
  'Not Started': 'bg-gray-200',
  'In Progress': 'bg-blue-500',
  'Submitted': 'bg-yellow-500',
  'Graded': 'bg-green-500',
};

export function ApplicantCard({ assignment }: ApplicantCardProps) {

  const { toast } = useToast();
  const assignmentDataJs = assignment.assignmentData
  const userAssignmentData = assignment.userAssignmentData
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAccepted, setIsAccepted] = useState(assignment.accepted);
  const [stage, setStage] = useState(assignment.userAssignmentData.stage)
  const [submitassignmentData, setSubmitAssignmentData] = useState<SubmitAssignmentData | null>(null);

  const currentStep = statusToStep[userAssignmentData.stage];
  const progressPercentage = (currentStep / 4) * 100;

  useEffect(() => {
    const user = localStorage.getItem('user');
    if(user){
      const storedUid = JSON.parse(user).uid
      if (storedUid) {
        setUid(storedUid);
      } 
    }
  }, []); 

  useEffect(() => {
    setIsAccepted(assignment.accepted);
    setStage(assignment.userAssignmentData.stage);
  }, [assignment])

  useEffect(() => {
    const updateAssignment = async () => {
      if (!submitassignmentData) return;
  
      console.log("INSIDE APPLICANT CARD USE EFFECT: ", submitassignmentData);
  
      try {
        setLoading(true);
  
        const docRef = doc(db, "Applicant", uid);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());
          const assignmentTrackData = docSnap.data().assignmentTrack || [];
  
          const updatedAssignments = assignmentTrackData.map((assignment:any) => {
            if (assignment.assignmentId === userAssignmentData.assignmentId) {
              return {
                ...assignment,
                stage: "Submitted",
                submitted: true,
                submittedFiles: [submitassignmentData.fileUrl],
                submittedLink: submitassignmentData.assignmentLink,
                submittedNote: submitassignmentData.notes,
                submittedDate: new Date()
              };
            } 
            return assignment;
          });
  
          await updateDoc(docRef, {
            assignmentTrack: updatedAssignments,
          });
  
          toast({
            title: "Accepted",
            description: "Assignment accepted successfully!",
            variant: "default",
          });
  
          setStage("Submitted");
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error updating document:", error);
        toast({
          title: "Try again later",
          description: "Assignment Cannot be Accepted",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
  
    updateAssignment();
  }, [submitassignmentData, uid, userAssignmentData, toast]);
  
  const handleAssignmentAccept = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "Applicant", uid);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        const assignmentTrackData = docSnap.data().assignmentTrack; 
  
        for (const assignment of assignmentTrackData) {
          if (assignment.assignmentId === userAssignmentData.assignmentId && assignment.accepted === false) {
            assignment.stage = "In Progress";
            assignment.accepted = true;
            break;
          }
        }
  
        await updateDoc(docRef, {
          assignmentTrack: assignmentTrackData,
        });
        
        toast({
          title: "Accepted",
          description: "Assignment accepted successfully!",
          variant: "default",
        });

        setIsAccepted(true);
        setStage("In Progress");
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error updating document:", error);
      toast({
        title: "Try again later",
        description: "Assignment Cannot be Accepted",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {Object.keys(statusToStep).map((status, index) => (
            <div key={status} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index < currentStep ? statusToColor[stage as keyof typeof statusToColor] : 'bg-gray-200'}`}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span className="text-xs mt-1">{status}</span>
            </div>
          ))}
        </div>
        <Progress value={progressPercentage} className="w-full" />
      </div>

      <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">{assignmentDataJs.title}</span>
            <span className="text-xs text-muted-foreground ml-2">{assignmentDataJs.subject}</span>
            {(userAssignmentData.evaluated) && (
              <Badge 
                variant={userAssignmentData.evaluated ? 'outline' : 'secondary'}
                className="text-lg px-2 py-1"
              >
                {userAssignmentData.score}
              </Badge>
            )}
          </div>
          {!isAccepted && (
            <Button 
              onClick={handleAssignmentAccept}
              className="w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept Assignment"
              )}
            </Button>
          )}
          {isAccepted && (
            <>
              {!userAssignmentData.submitted ? (
                <SubmitAssignmentDialog onsubmit={(data:any) =>{  setSubmitAssignmentData(data); }}/>
              ): 
                <FileViewerModal files={userAssignmentData.submittedFiles} title="View Submitted Documents" submittedLink={userAssignmentData.submittedLink} submittedNote={userAssignmentData.submittedNote}/>
              }
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        {(!isAccepted || assignment.assignmentData.note || ( (assignmentDataJs.endDate.seconds < new Date().getTime()/ 1000) && !assignment.userAssignmentData.submitted )) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <FileText className="h-5 w-5" />
              <span className="font-semibold">Note</span>
            </div>
            <p className="text-red-700">
              { !isAccepted ? `Please Accept your Assignmnet before due. ${assignmentDataJs.note}` : (assignmentDataJs.endDate.seconds < new Date().getTime()/ 1000) && !assignment.userAssignmentData.submitted ? `Your deadline for the assignment submission has expired. You can still upload the assignment with a note. ${assignmentDataJs.note}` : `${assignmentDataJs.note}` }
            </p>
          </div>
        )}
        {userAssignmentData.submitted && (
          <Separator className="my-2"/>
        )}
        {userAssignmentData.submitted && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">Submitted Date:</span>
              <span>{dateFormat(userAssignmentData.submittedDate.seconds)}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">Grade:</span>
              <span>{userAssignmentData.score}</span>
            </div>
          </div>
        )}
        <Separator className="my-2"/>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold">Assigned Date:</span>
            <span>{dateFormat(assignmentDataJs.startDate.seconds)}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold">Due Date:</span>
            <span>{dateFormat(assignmentDataJs.endDate.seconds)}</span>
          </div>
        </div>
        <Separator className="my-2"/>
        <div className="grid sm:grid-cols-2 gap-4">
          {assignmentDataJs.file && assignmentDataJs.file.length > 0 && (
            <div>
              <span className="font-semibold p-2">Assignment Files</span>
              <span className="mt-4">
                <FileViewerModal files={assignmentDataJs.file} title="Assignment Files" submittedLink="" submittedNote=""/>
              </span>
            </div>
          )}
          {assignmentDataJs.link && (
            <div>
              <span className="font-semibold p-2">Example Link</span>
              <span className="mt-4">
                <a href={assignmentDataJs.link} target="_blank">
                  <Button className="bg-blue-500 text-white hover:bg-blue-700 border border-blue-500 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Link
                  </Button>
                </a>
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <Separator className="my-2" />
      <CardFooter className="text-sm text-muted-foreground">
        Assignment ID: {assignment.userAssignmentData.assignmentId}
      </CardFooter>
    </Card>
    </div>
  );
}