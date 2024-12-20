import { ApplicantTable } from "@/components/InstructorEvaluationTable"

export default function ApplicantsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Applicants</h1>
      <ApplicantTable />
    </div>
  )
}

