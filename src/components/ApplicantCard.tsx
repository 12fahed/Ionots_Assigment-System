"use client"

import React, { useState, useEffect, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, FileText, GraduationCap } from 'lucide-react';
import { db } from '@/config/firebase';
import { doc, Timestamp, getDoc, updateDoc } from 'firebase/firestore';
import { dateFormat } from '@/constants/dateFormat';
import { Button } from './ui/button';
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    remarks: string;
    score: number;
    evaluated: boolean
  }
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
  }, [assignment]);

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
      setIsAccepted(true);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {Object.keys(statusToStep).map((status, index) => (
            <div key={status} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index < currentStep ? statusToColor[userAssignmentData.stage as keyof typeof statusToColor] : 'bg-gray-200'}`}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span className="text-xs mt-1">{status}</span>
            </div>
          ))}
        </div>
        <Progress value={progressPercentage} className="w-full" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center text-3xl">
            <div className="flex justify-between space-x-4 items-center text-3xl">
              <span>{assignmentDataJs.title}</span>
              <Badge variant={userAssignmentData.evaluated === true ? 'default' : 'secondary'}>
                {userAssignmentData.score}
              </Badge>
            </div>
            {!isAccepted && (
              <Button 
                onClick={handleAssignmentAccept}>
                { loading ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ): (
                  "Accept Assignment"
                )}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center">
              <GraduationCap className="mr-2 h-4 w-4" />
              <span className="font-semibold">Subject:</span>
              <span className="ml-2">{assignmentDataJs.subject}</span>
            </div>
            <div className="flex items-center">
              <CalendarDays className="mr-2 h-4 w-4" />
              <span className="font-semibold">Due Date:</span>
              <span className="ml-2">{dateFormat(assignmentDataJs.endDate.seconds)}</span>
            </div>
            <div className="flex items-start">
              <FileText className="mr-2 h-4 w-4 mt-1" />
              <div>
                <span className="font-semibold">Description:</span>
                <p className="mt-1">{assignmentDataJs.note}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}