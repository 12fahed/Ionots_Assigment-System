"use client"

import ApplicantAssignmentDetail from "@/components/InstructorEvaluationCard"

export default function ApplicantDetailPage({ params }: { params: { applicantId: string, assignmentId: string } }) {
  return <ApplicantAssignmentDetail applicantId={params.applicantId} assignmentId={params.assignmentId} />
}