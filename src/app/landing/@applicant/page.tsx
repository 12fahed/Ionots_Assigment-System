"use client"

import React, { useState } from 'react';
import { ApplicantSideBar } from '@/components/ApplicantSideBar';
import { ApplicantCard } from '@/components/ApplicantCard';
import { Timestamp } from 'firebase/firestore';

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

export default function Dashboard() {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const handleAssignmentSelect = (assignment: Assignment) => {
    console.log(assignment)
    setSelectedAssignment(assignment);
  };

  return (
    <div className="flex h-screen">
      <ApplicantSideBar onAssignmentSelect={handleAssignmentSelect}/>
      <main className="flex-1 overflow-y-auto p-4">
        {selectedAssignment ? (
          <ApplicantCard assignment={selectedAssignment} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg text-gray-500">Select an assignment to view details</p>
          </div>
        )}
      </main>
    </div>
  );
}

