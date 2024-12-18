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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { collection, getDocs, getFirestore, Timestamp, addDoc} from "firebase/firestore"
import { db } from "@/config/firebase";// Adjust the Firebase import to your setup.
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";

export default function CreateAssignmentDialog() {

  const { toast } = useToast();
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [group, setGroup] = useState("No")
  const [groupName, setGroupName] = useState("")
  const [assignedTo, setAssignedTo] = useState<string>("")
  const [students, setStudents] = useState<{ id: string; name: string }[]>([])
  const [applicants, setApplicants] = useState<string[]>([])
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [isOpen, setIsOpen] = useState(false)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  
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
      const assignmentData = {
        title,
        subject,
        group: group,
        groupName: group === "Yes" ? groupName : null,
        assignedTo: group === "No" ? applicants : [],
        startDate: Timestamp.fromDate(startDate || new Date()),
        endDate: Timestamp.fromDate(endDate || new Date()),
        file: [uploadedFileUrl]
      }
  
      const docRef = await addDoc(collection(db, "Assigned"), assignmentData)
      console.log("Document written with ID:", docRef.id)

      toast({
        title: "Assignment Scheduled",
        description: "Assignment Scheduled has been successfull",
        className: "bg-[#3B82F6] text-white"
      });
      
      // Close dialog and reset form variables
      setIsOpen(false) // Close the dialog
      setTitle("")
      setSubject("")
      setGroup("No")
      setGroupName("")
      setAssignedTo("")
      setApplicants([])
      setStartDate(new Date())
      setEndDate(new Date())

    } catch (error) {
      console.error("Error saving document: ", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger Button */}
      <DialogTrigger asChild>
        <Button className="w-[20%] m-5" variant="outline">Create New Assignment</Button>
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
  
          {/* Start Date */}
          <div className="flex items-center gap-4">
            <Label className="w-1/3 text-sm font-medium">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {startDate ? startDate.toLocaleDateString() : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  className="rounded-md border shadow bg-[#ffffff]"
                />
              </PopoverContent>
            </Popover>
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

        <FileUpload onFileUploaded={handleFileUploaded} />
  
        {/* Footer */}
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSave}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
