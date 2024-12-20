"use client"

import { useEffect, useState } from 'react'
import { doc, getDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dateFormat } from '@/constants/dateFormat'
import FileViewerModal from '@/components/FileViewerModal'
import { Button } from '@/components/ui/button'

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

  useEffect(() => {
    const fetchData = async () => {
      // Fetch applicant data
      const applicantDoc = await getDoc(doc(db, 'Applicant', applicantId))
      if (applicantDoc.exists()) {
        const applicantData = applicantDoc.data() as Applicant
        setApplicant(applicantData)
        const foundAssignment = applicantData.assignmentTrack.find(a => a.assignmentId === assignmentId)
        if (foundAssignment) {
          setAssignment({
            ...foundAssignment,
            // submittedDate: foundAssignment.submittedDate instanceof Date ? foundAssignment.submittedDate : new Date(foundAssignment.submittedDate)
          })
        }
      }

      // Fetch assigned assignment data
      const assignedDoc = await getDoc(doc(db, 'Assigned', assignmentId))
      if (assignedDoc.exists()) {
        const assignedData = assignedDoc.data() as AssignedAssignment
        setAssignedAssignment({
          ...assignedData,
          // startDate: assignedData.startDate instanceof Date ? assignedData.startDate : new Date(assignedData.startDate),
          // endDate: assignedData.endDate instanceof Date ? assignedData.endDate : new Date(assignedData.endDate)
        })
      }
    }

    fetchData()
  }, [applicantId, assignmentId])

  if (!applicant || !assignment || !assignedAssignment) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Applicant and Assignment Details</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Applicant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Name:</strong> {applicant.name}</p>
          <p><strong>Email:</strong> {applicant.email}</p>
          <p><strong>Group:</strong> {applicant.group.join(', ')}</p>
          <p><strong>Subjects Enrolled:</strong> {applicant.subjectEnrolled.join(', ')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Title:</strong> {assignedAssignment.title}</p>
          <p><strong>Subject:</strong> {assignedAssignment.subject}</p>
          <p><strong>Start Date:</strong> {dateFormat(assignedAssignment.startDate.seconds)}</p>
          <p><strong>End Date:</strong> {dateFormat(assignedAssignment.endDate.seconds)}</p>
          <p><strong>Files:</strong>
            <FileViewerModal files={assignedAssignment.file} title="Assignment Files" submittedLink="" submittedNote=""/>
          </p>
          <p><strong>Link:</strong>
            <a href={assignedAssignment.link} target="_blank">
              <Button className="bg-blue-500 text-white hover:bg-blue-700 border border-blue-500 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Link
              </Button>
            </a>
          </p>
          <p><strong>Note:</strong> {assignedAssignment.note}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applicants Assignment Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Stage:</strong> {assignment.stage}</p>
          <p><strong>Accepted:</strong> {assignment.accepted ? 'Yes' : 'No'}</p>
          <p><strong>Submitted:</strong> {assignment.submitted ? 'Yes' : 'No'}</p>
          {assignment.submitted && (
            <>
              <p><strong>Submitted Date:</strong> {dateFormat(assignment.submittedDate.seconds)}</p>
              <p><strong>Submitted Files:</strong>
                <FileViewerModal files={assignment.submittedFiles} title="View Submitted Documents" submittedLink={assignment.submittedLink} submittedNote={assignment.submittedNote}/>
              </p>
            </>
          )}
          <p><strong>Evaluated:</strong> {assignment.evaluated ? 'Yes' : 'No'}</p>
          {assignment.evaluated && (
            <>
              <p><strong>Score:</strong> {assignment.score}</p>
              <p><strong>Remarks:</strong> {assignment.remarks}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

