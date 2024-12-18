"use client";

import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { collection, getDocs, Timestamp, doc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, FileText, LinkIcon, Users, Bookmark, Clock, Paperclip, MessageSquare, User } from 'lucide-react'
import { format } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import CreateAssignmentDialog from "./CreateAssignmentDialog";

interface AssignedData {
  id: string;
  title: string;
  subject: string;
  group: "Yes" | "No";
  groupName?: string;
  assignedTo: string[];
  link: string;
  startDate: Timestamp;
  endDate: Timestamp;
  file: string[];
  note: string;
}

export default function InstructorTable() {
  const [assignedData, setAssignedData] = useState<AssignedData[]>([]);
  const [applicantNames, setApplicantNames] = useState<{ [key: string]: string }>({});
  const [selectedDetails, setSelectedDetails] = useState<AssignedData | null>(null);

  const fetchApplicant = async (arrayOfUID: string[]): Promise<{ [key: string]: string }> => {
    try {
      const namePromises = arrayOfUID.map(async (docId: string) => {
        const docRef = doc(db, "Applicant", docId);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          return { id: docId, name: docSnapshot.data().name || "Unknown" };
        } else {
          return { id: docId, name: "Unknown" };
        }
      });

      const namesArray = await Promise.all(namePromises);
      return namesArray.reduce((acc, { id, name }) => {
        acc[id] = name;
        return acc;
      }, {} as { [key: string]: string });
    } catch (error) {
      console.error("Error fetching applicants:", error);
      return {};
    }
  };

  useEffect(() => {
    const fetchAssignedData = async () => {
      const querySnapshot = await getDocs(collection(db, "Assigned"));
      const data = querySnapshot.docs.map((doc) => {
        const docData = doc.data();

        const assigned: AssignedData = {
          id: doc.id,
          title: docData.title || "",
          subject: docData.subject || "",
          group: docData.group || "No",
          groupName: docData.groupName || "",
          assignedTo: docData.assignedTo || [],
          link: docData.link || "",
          startDate: docData.startDate || Timestamp.fromDate(new Date()),
          endDate: docData.endDate || Timestamp.fromDate(new Date()),
          file: docData.file || [],
          note: docData.note || "",
        };

        return assigned;
      });

      setAssignedData(data);

      const allUIDs = Array.from(
        new Set(data.flatMap((assigned) => assigned.assignedTo))
      );
      const fetchedNames = await fetchApplicant(allUIDs);
      setApplicantNames(fetchedNames);
    };

    fetchAssignedData();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen">
        <Card className="w-[90%]">
        <CardHeader>
        <CardTitle className="flex justify-between w-full items-center">
            <span className="text-3xl">Assigned Tasks</span>
            <div className="flex justify-end items-center">
                <span className="text-sm">Create New Assignment</span>
                <CreateAssignmentDialog />
            </div>
        </CardTitle>

        </CardHeader>
        <CardContent>
            <ScrollArea className="h-[600px]">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {assignedData.map((assigned) => (
                    <TableRow key={assigned.id}>
                    <TableCell className="font-medium">{assigned.title}</TableCell>
                    <TableCell>{assigned.subject}</TableCell>
                    <TableCell>
                        {assigned.assignedTo.length > 0 ? (
                        <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>{assigned.assignedTo.map((uid) => applicantNames[uid] || "Loading...").join(", ")}</span>
                        </div>
                        ) : (
                        <Badge variant="secondary">Group {assigned.groupName || "No Group"}</Badge>
                        )}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{format(assigned.endDate.toDate(), 'MMM dd, yyyy')}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <Dialog>
                        <DialogTrigger asChild>
                            <Button
                            onClick={() => setSelectedDetails(assigned)}
                            variant="outline"
                            size="sm"
                            >
                            Details
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">{selectedDetails?.title}
                            <span className="text-sm text-gray-500 ml-2">({selectedDetails?.subject})</span>
                            </DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh]">
                            <div className="grid gap-6 py-4">
                            {selectedDetails?.group === "No" ? (
                                <div className="space-y-2">
                                <h4 className="font-semibold flex items-center text-sm">
                                    <Users className="w-4 h-4 mr-2" />
                                    Assigned To
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedDetails?.assignedTo.map((uid) => (
                                    <div key={uid} className="bg-blue-100 text-blue-800 rounded-lg py-1 px-3 mr-2 inline-block">
                                        {applicantNames[uid]}
                                    </div>
                                    ))}
                                </div>
                                </div>
                            ): (
                                <div className="space-y-2">
                                <h4 className="font-semibold flex items-center text-sm">
                                <Users className="w-4 h-4 mr-2" />
                                Group
                                </h4>
                                <div className="bg-blue-100 text-blue-800 rounded-lg py-1 px-3 mr-2 inline-block">
                                <p>{selectedDetails?.groupName || "No Group"}</p>
                                </div>
                            </div>
                            )}
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h4 className="font-semibold flex items-center text-sm">
                                    <LinkIcon className="w-4 h-4 mr-2" />Refernce Link
                                </h4>
                                <a href={selectedDetails?.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                                    <LinkIcon className="w-4 h-4 mr-2" />Open Link
                                </a>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold flex items-center text-sm">
                                <Paperclip className="w-4 h-4 mr-2" />
                                Files
                                </h4>
                                {selectedDetails && selectedDetails.file.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedDetails?.file.map((fileUrl, index) => (
                                    <a
                                        key={index}
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline flex items-center bg-gray-100 p-2 rounded"
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        File {index + 1}
                                    </a>
                                    ))}
                                </div>
                                ) : (
                                <p>No files available</p>
                                )}
                            </div>
                            </div>
                            
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                <h4 className="font-semibold flex items-center text-sm">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Start Date
                                </h4>
                                <p> {selectedDetails ? format(selectedDetails.startDate.toDate(), 'MMMM dd, yyyy') : 'No start date'}</p>
                                </div>
                                <div className="space-y-2">
                                <h4 className="font-semibold flex items-center text-sm">
                                    <Clock className="w-4 h-4 mr-2" />
                                    End Date
                                </h4>
                                <p>{ selectedDetails ? format(selectedDetails.endDate.toDate(), 'MMMM dd, yyyy') : 'No End Date'}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <h4 className="font-semibold flex items-center text-sm">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Note
                                </h4>
                                <p className="text-sm text-gray-600">{selectedDetails?.note || "None"}</p>
                            </div>
                            </div>
                        </ScrollArea>
                        <DialogFooter>
                            <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Close
                            </Button>
                            </DialogClose>
                        </DialogFooter>
                        </DialogContent>
                        </Dialog>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </ScrollArea>
        </CardContent>
        </Card>
    </div>
  )
}
