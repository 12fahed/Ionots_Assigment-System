"use client"

import React, { createContext, useState, useContext } from 'react';

interface AssignmentData {
  fileUrl: string;
  assignmentLink: string;
  notes: string;
}

interface AssignmentContextType {
  assignmentData: AssignmentData;
  setAssignmentData: React.Dispatch<React.SetStateAction<AssignmentData>>;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

export const useAssignment = () => {
  const context = useContext(AssignmentContext);
  if (!context) {
    throw new Error('useAssignment must be used within an AssignmentProvider');
  }
  return context;
};

export const AssignmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assignmentData, setAssignmentData] = useState<AssignmentData>({
    fileUrl: '',
    assignmentLink: '',
    notes: '',
  });

  return (
    <AssignmentContext.Provider value={{ assignmentData, setAssignmentData }}>
      {children}
    </AssignmentContext.Provider>
  );
};

