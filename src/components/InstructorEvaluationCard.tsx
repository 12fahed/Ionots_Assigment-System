"use client"

import { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dateFormat } from '@/constants/dateFormat'
import FileViewerModal from './FileViewerModal'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import EvaluationModal from './EvaluationModal'
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Assignment {
  assignmentId: string
  accepted: boolean
  stage: 'Not Started' | 'In Progress' | 'Submitted' | 'Graded'
  submitted: boolean
  submittedFiles: string[]
  submittedLink: string
  submittedNote: string
  submittedDate: Timestamp
  remarks: string
  score: number
  evaluated: boolean
}

interface Applicant {
  id: string
  email: string
  group: string[]
  name: string
  subjectEnrolled: string[]
  type: "applicant"
  assignmentTrack: Assignment[]
}

interface AssignedAssignment {
  title: string
  endDate: Timestamp
  file: string[]
  link: string
  note: string
  startDate: Timestamp
  subject: string
}

export default function ApplicantAssignmentDetail({ applicantId, assignmentId }: { applicantId: string, assignmentId: string }) {
  const [applicant, setApplicant] = useState<Applicant | null>(null)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [assignedAssignment, setAssignedAssignment] = useState<AssignedAssignment | null>(null)
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false)
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch applicant data
      const applicantDoc = await getDoc(doc(db, 'Applicant', applicantId))
      if (applicantDoc.exists()) {
        const applicantData = applicantDoc.data() as Applicant
        setApplicant(applicantData)
        const foundAssignment = applicantData.assignmentTrack.find(a => a.assignmentId === assignmentId)
        if (foundAssignment) {
          setAssignment(foundAssignment)
        }
      }

      // Fetch assigned assignment data
      const assignedDoc = await getDoc(doc(db, 'Assigned', assignmentId))
      if (assignedDoc.exists()) {
        const assignedData = assignedDoc.data() as AssignedAssignment
        setAssignedAssignment(assignedData)
      }
    }

    fetchData()
  }, [applicantId, assignmentId])

  const handleEvaluate = async (score: number, remarks: string) => {
    if (applicant && assignment) {
      const updatedAssignmentTrack = applicant.assignmentTrack.map(a => 
        a.assignmentId === assignmentId 
          ? { ...a, score, remarks, evaluated: true, stage: 'Graded' as const }
          : a
      )

      await updateDoc(doc(db, 'Applicant', applicantId), {
        assignmentTrack: updatedAssignmentTrack
      })

      setAssignment({ ...assignment, score, remarks, evaluated: true, stage: 'Graded' })
      toast({
        title: "Graded",
        description: "Assignment Graded successfully!",
        variant: "default",
      });
    }
    setIsEvaluationModalOpen(false)
  }

  if (!applicant || !assignment || !assignedAssignment) {
    return <div className="flex justify-center items-center h-screen">
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          </div>
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">Applicant and Assignment Details</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gray-100">
            <CardTitle className="text-xl">Applicant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            <p><strong>Name:</strong> {applicant.name}</p>
            <p><strong>Email:</strong> {applicant.email}</p>
            <p><strong>Group:</strong> {applicant.group.join(', ')}</p>
            <p><strong>Subjects Enrolled:</strong> {applicant.subjectEnrolled.join(', ')}</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="bg-gray-100">
            <CardTitle className="text-xl">Assignment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            <p><strong>Title:</strong> {assignedAssignment.title}</p>
            <p><strong>Subject:</strong> {assignedAssignment.subject}</p>
            <p><strong>Start Date:</strong> {dateFormat(assignedAssignment.startDate.seconds)}</p>
            <p><strong>End Date:</strong> {dateFormat(assignedAssignment.endDate.seconds)}</p>
            <p>
              <strong>Files:</strong>{' '}
              <FileViewerModal files={assignedAssignment.file} title="Assignment Files" submittedLink="" submittedNote=""/>
            </p>
            <p>
              <strong>Link:</strong>{' '}
              <a href={assignedAssignment.link} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  View Link
                </Button>
              </a>
            </p>
            <p><strong>Note:</strong> {assignedAssignment.note}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gray-100">
          <CardTitle className="text-xl">Applicants Assignment Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <Badge variant={assignment.stage === 'Graded' ? 'default' : 'secondary'}>
              {assignment.stage}
            </Badge>
            {!assignment.evaluated && assignment.submitted && (
              <Button onClick={() => setIsEvaluationModalOpen(true)}>
                Evaluate
              </Button>
            )}
          </div>
          <Separator />
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p><strong>Accepted:</strong> {assignment.accepted ? 'Yes' : 'No'}</p>
              <p><strong>Submitted:</strong> {assignment.submitted ? 'Yes' : 'No'}</p>
              {assignment.submitted && (
                <>
                  <p><strong>Submitted Date:</strong> {dateFormat(assignment.submittedDate.seconds)}</p>
                  <p>
                    <strong>Submitted Files:</strong>{' '}
                    <FileViewerModal 
                      files={assignment.submittedFiles} 
                      title="View Submitted Documents" 
                      submittedLink={assignment.submittedLink} 
                      submittedNote={assignment.submittedNote}
                    />
                  </p>
                </>
              )}
            </div>
            <div>
              <p><strong>Evaluated:</strong> {assignment.evaluated ? 'Yes' : 'No'}</p>
              {assignment.evaluated && (
                <>
                  <p><strong>Score:</strong> {assignment.score}</p>
                  <p><strong>Remarks:</strong> {assignment.remarks}</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <EvaluationModal 
        isOpen={isEvaluationModalOpen}
        onClose={() => setIsEvaluationModalOpen(false)}
        onSubmit={handleEvaluate}
      />
    </div>
  )
}

