"use client"

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import Link from 'next/link'

interface Assignment {
  assignmentId: string
  accepted: boolean
  stage: 'Not Started' | 'In Progress' | 'Submitted' | 'Graded'
  submitted: boolean
  submittedFiles: string[]
  submittedLink: string
  submittedNote: string
  submittedDate: Date
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
  endDate: Date
  file: string[]
  link: string
  note: string
  startDate: Date
  subject: string
}

export function ApplicantTable() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [assignments, setAssignments] = useState<Record<string, AssignedAssignment>>({})

  useEffect(() => {
    const fetchData = async () => {
      // Fetch applicants
      const applicantCollection = collection(db, 'Applicant')
      const applicantSnapshot = await getDocs(applicantCollection)
      const applicantList = applicantSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        assignmentTrack: doc.data().assignmentTrack?.map((assignment: any) => ({
          ...assignment,
          submittedDate: assignment.submittedDate?.toDate()
        })) || []
      })) as Applicant[]

      // Fetch assignments
      const assignedCollection = collection(db, 'Assigned')
      const assignedSnapshot = await getDocs(assignedCollection)
      const assignedMap: Record<string, AssignedAssignment> = {}
      assignedSnapshot.docs.forEach(doc => {
        const data = doc.data()
        assignedMap[doc.id] = {
          ...data,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate()
        } as AssignedAssignment
      })

      setApplicants(applicantList)
      setAssignments(assignedMap)
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Subjects Enrolled</TableHead>
            <TableHead>Assignments</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applicants.map((applicant) => (
            <TableRow key={applicant.id}>
              <TableCell>{applicant.name}</TableCell>
              <TableCell>{applicant.email}</TableCell>
              <TableCell>{applicant.group.join(', ')}</TableCell>
              <TableCell>{applicant.subjectEnrolled.join(', ')}</TableCell>
              <TableCell>{applicant.assignmentTrack.length}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">View Details</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Assignment Details for {applicant.name}</DialogTitle>
                    </DialogHeader>
                    <AssignmentDetails applicant={applicant} assignments={assignments} />
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function AssignmentDetails({ applicant, assignments }: { applicant: Applicant, assignments: Record<string, AssignedAssignment> }) {
  if (!applicant || applicant.assignmentTrack.length === 0) {
    return <div>No assignment details available.</div>
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Assignment Name</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applicant.assignmentTrack.map((assignment) => (
            <TableRow key={assignment.assignmentId}>
              <TableCell>{assignments[assignment.assignmentId]?.title || 'Unknown'}</TableCell>
              <TableCell>{assignment.stage}</TableCell>
              <TableCell>{assignment.submitted ? 'Yes' : 'No'}</TableCell>
              <TableCell>{assignment.evaluated ? assignment.score : 'N/A'}</TableCell>
              <TableCell>
                <Link href={`/landing/applicant-detail/${applicant.id}/${assignment.assignmentId}`} target="_blank">
                  <Button variant="outline">View Details</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

