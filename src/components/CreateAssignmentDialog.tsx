"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { collection, getDocs, getFirestore, Timestamp, addDoc, doc, getDoc, updateDoc, arrayUnion, arrayRemove} from "firebase/firestore"
import { db } from "@/config/firebase";// Adjust the Firebase import to your setup.
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import { Loader, PlusCircle } from "lucide-react";
import { getApplicantUIDByGroupName } from "@/lib/getApplicantUID"

export default function CreateAssignmentDialog() {

  const { toast } = useToast();
  const [title, setTitle] = useState("")
  const [note, setNote] = useState("")
  const [subject, setSubject] = useState("")
  const [group, setGroup] = useState("No")
  const [groupName, setGroupName] = useState("")
  const [assignedTo, setAssignedTo] = useState<string>("")
  const [students, setStudents] = useState<{ id: string; name: string }[]>([])
  const [applicants, setApplicants] = useState<string[]>([])
  const [link, setLink] = useState("")
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [isOpen, setIsOpen] = useState(false)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  const handleFileUploaded = (url: string) => {
    setUploadedFileUrl(url);
  };  

  // Fetch student data from Firebase
  useEffect(() => {
    const fetchStudents = async () => {
      const querySnapshot = await getDocs(collection(db, "Applicant"))
      const studentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }))
      setStudents(studentsData)
    }
    fetchStudents()
  }, [db])

  const handleSave = async () => {
    try {

      setLoading(true);

      const validationErrors = [
          { condition: title === "", message: "Please Enter a Title" },
          { condition: subject === "", message: "Please Select a Subject" },
          { condition: group === "Yes" && groupName === "", message: "Please Enter a Group Name" },
          { condition: group === "No" && assignedTo === "", message: "Please Select A Student" }
      ];
        
      for (const { condition, message } of validationErrors) {
          if (condition) {
              toast({
                  description: message,
                  variant: "destructive",
              });
              return;
          }
      }

      const assignmentData = {
        title,
        subject,
        group: group,
        groupName: group === "Yes" ? groupName : null,
        assignedTo: group === "No" ? applicants : [],
        link: link,
        startDate: Timestamp.fromDate(new Date()),
        endDate: Timestamp.fromDate(endDate || new Date()),
        file: [uploadedFileUrl],
        note: note,
      }
  
      const docRef = await addDoc(collection(db, "Assigned"), assignmentData)
      console.log("Document written with ID:", docRef.id)

      // Update the Applicant Doc
      const applicantAssignedDoc = {
        assignmentId: docRef.id,
        accepted: false,
        stage: 0,
        submitted: false,
        submittedFiles: [], 
        remarks: "",
        score: null,
        evaluated: null,
      }

      let applicantUID 
      if (group==="Yes"){
        applicantUID =  await getApplicantUIDByGroupName(groupName[0])
        applicantUID?.forEach( async (applicant) =>{
          const docRef = doc(db, "Applicant", applicant)
          await updateDoc(docRef, {assignmentTrack: arrayUnion(applicantAssignedDoc)})
        } )
      } else {
        const docRef = doc(db, "Applicant", applicants[0])
        await updateDoc(docRef, {assignmentTrack: arrayUnion(applicantAssignedDoc)})
      }
      
      toast({
        title: "Assignment Scheduled",
        description: "Assignment Scheduled has been successfull",
        className: "bg-[#3B82F6] text-white"
      });
      
      setIsOpen(false)
      setTitle("")
      setSubject("")
      setGroup("No")
      setGroupName("")
      setAssignedTo("")
      setLink("")
      setApplicants([])
      setEndDate(new Date())
      setNote("")

    } catch (error) {
      console.error("Error saving document: ", error)
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger Button */}
      <DialogTrigger asChild>
        <Button className="w-14 h-14 rounded-full m-5 flex items-center justify-center bg-[#e9f1ff] border-blue-500" variant="outline">
          <PlusCircle className="w-6 h-6 text-blue-500" />
        </Button>
      </DialogTrigger>
  
      {/* Dialog Content */}
      <DialogContent
        className="mx-auto w-full max-w-4xl rounded-md border bg-white p-6 shadow-lg"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Create New Assignment
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Fill out the details for the new assignment and save.
          </DialogDescription>
        </DialogHeader>
  
        {/* Form Layout */}
        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Title */}
          <div className="flex items-center gap-4">
            <Label htmlFor="title" className="w-1/3 text-sm font-medium">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 rounded-md border p-2 text-sm"
            />
          </div>
  
            {/* Subject */}
            <div className="flex items-center gap-4">
            <Label htmlFor="subject" className="w-1/3 text-sm font-medium">
                Subject
            </Label>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full text-left">
                    {subject || "Select Subject"}
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSubject("Data Science And Analytics")}>
                    Data Science And Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSubject("Cybersecurity")}>
                    Cybersecurity
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSubject("Artificial Intelligence")}>
                    Artificial Intelligence
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </div>

  
          {/* Group */}
          <div className="flex items-center gap-4">
            <Label htmlFor="group" className="w-1/3 text-sm font-medium">
              Group
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                  {group || "Select"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setGroup("Yes")}>Yes</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroup("No")}>No</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
  
          {/* Group Name (Conditional) */}
          {group === "Yes" && (
            <div className="flex items-center gap-4">
              <Label htmlFor="groupName" className="w-1/3 text-sm font-medium">
                Group Name
              </Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="flex-1 rounded-md border p-2 text-sm"
              />
            </div>
          )}
  
          {/* Assigned To (Conditional) */}
          {group === "No" && (
            <div className="flex items-center gap-4">
              <Label htmlFor="assignedTo" className="w-1/3 text-sm font-medium">
                Assigned To
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full">
                    {assignedTo || "Select Students"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {students.map((student) => (
                    <DropdownMenuItem
                      key={student.id}
                      onClick={() => {
                        setAssignedTo(student.name)
                        setApplicants((prev) => [...prev, student.id])
                      }}
                    >
                      {student.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
  
          {/* Link */}
          <div className="flex items-center gap-4">
            <Label htmlFor="title" className="w-1/3 text-sm font-medium">
              Example Link
            </Label>
            <Input
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="flex-1 rounded-md border p-2 text-sm"
            />
          </div>
  
          {/* End Date */}
          <div className="flex items-center gap-4">
            <Label className="w-1/3 text-sm font-medium">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {endDate ? endDate.toLocaleDateString() : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  className="rounded-md border shadow bg-[#ffffff]"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex flex-row gap-4">
            <FileUpload onFileUploaded={handleFileUploaded} />
            {/* Note */}
            <div className="flex flex-col w-full">
                <Label htmlFor="note" className="text-sm font-medium mb-2">
                    Enter Instructions
                </Label>
                <Textarea
                    placeholder=""
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full rounded-md border p-2 text-sm"
                />
            </div>
        </div>
  
        {/* Footer */}
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={uploadedFileUrl.length===0}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
          {loading ? (
            <Loader className="animate-spin w-5 h-5 text-white" />
              ) : (
                "Save Assignment"
          )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
