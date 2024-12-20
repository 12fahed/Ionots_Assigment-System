"use client"

import * as React from "react"
import { UploadIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import FileUpload from "./FileUpload"
import { useAssignment } from "@/contexts/AssignmentContext"
import { useToast } from "@/hooks/use-toast";

export function SubmitAssignmentDialog({ onsubmit }) {

  const { toast } = useToast(); 
  const [isOpen, setIsOpen] = React.useState(false)
  const { assignmentData, setAssignmentData } = useAssignment()

  const handleFileUploaded = (url: string) => {
    setAssignmentData(prev => ({ ...prev, fileUrl: url }))
  }

  const handleSubmit = () => {

    if(assignmentData.fileUrl === "" || assignmentData.assignmentLink === ""){

      toast({
        title: `${assignmentData.fileUrl === "" ? "Upload File" : "Submit Hosted Link or Code"}`,
        description: "Assignment Cannot be Accepted",
        variant: "destructive",
      });

      return

    }

    // console.log("Assignment Data:", assignmentData)
    onsubmit(assignmentData)
    setIsOpen(false)
    setAssignmentData({
      fileUrl: '',
      assignmentLink: '',
      notes: '',
    });
  }

  React.useEffect(() => {
    console.log("Assignment Data in Dialog:", assignmentData)
  }, [assignmentData])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-700 border border-blue-500 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500">Submit Assignment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Submit assignment</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Upload Section */}
          <FileUpload onFileUploaded={handleFileUploaded} />
          <div className="text-sm text-muted-foreground">
            Maximum combined file size 50 MB • Only zip, pdf, doc, ppt, xls, png, jpg, mp3, mp4 allowed
          </div>

          {/* Assignment Link */}
          <div className="space-y-2">
            <Label htmlFor="url">Assignment link</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                placeholder="Paste URL"
                value={assignmentData.assignmentLink}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, assignmentLink: e.target.value }))}
              />
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="notes">Add notes</Label>
            <div className="relative">
              <Textarea
                id="notes"
                placeholder="Please find my assignment attached."
                value={assignmentData.notes}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, notes: e.target.value }))}
                className="min-h-[100px] resize-none"
                maxLength={2048}
              />
              <div className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                {assignmentData.notes.length}/2048
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}