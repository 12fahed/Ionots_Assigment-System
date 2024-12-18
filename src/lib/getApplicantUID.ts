import { db } from '@/config/firebase';
import { collection, getDocs, DocumentData } from 'firebase/firestore';

interface Applicant {
  group: string[];
  [key: string]: any;
}

export const getApplicantUIDByGroupName = async (groupName:any): Promise<string[]> => {
  try {
    const applicantsRef = collection(db, "Applicant");
    const snapshot = await getDocs(applicantsRef);
    
    const matchedUids: string[] = [];

    snapshot.forEach((doc) => {
      const data: Applicant = doc.data() as Applicant;

      if (Array.isArray(data.group) && data.group.includes(groupName)) {
        matchedUids.push(doc.id);
      }
    });

    return matchedUids;
  } catch (error) {
    console.error("Error fetching applicants:", error);
    throw new Error("Error fetching applicants");
  }
};