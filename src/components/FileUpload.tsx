import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import { FileIcon, defaultStyles, FileIconProps } from "react-file-icon";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


interface FileUploadProps {
  onFileUploaded: (url: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size exceeds the limit of 10MB.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const base64 = await toBase64(file);

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file: base64 }),
      });

      const data = await response.json();
      if (response.ok) {
        onFileUploaded(data.url);
        setUploaded(true);
        toast({
          title: "Success",
          description: "File Uploaded Successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Upload failed",
          variant: "destructive",
        });
        
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false); 
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDragOver = (event:any) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const getFileExtension = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "default";
    return extension;
  };

  const getFileIconProps = (fileName: string): Partial<FileIconProps> => {
    const extension = getFileExtension(fileName);
    return defaultStyles[extension as keyof typeof defaultStyles] || {
      color: "#808080",
      fontSize: "48px",
      backgroundColor: "#f0f0f0",
    };
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <div
        className={`w-[350px] p-6 border-2 border-dotted border-gray-400 rounded-lg flex flex-col items-center justify-center cursor-pointer ${
          uploaded ? "bg-green-100" : ""
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {!file ? (
          <>
            <span className="text-center text-gray-500 mb-2">Drag & Drop a File</span>
            <span className="text-center text-gray-500">or</span>
            <Input
              className="w-[225px] p-2 mt-2 border border-gray-300 rounded-lg"
              type="file"
              onChange={handleFileChange}
              aria-label="Choose a file to upload"
            />
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="icon-wrapper w-[40px] h-[40px] flex items-center justify-center bg-gray-100 rounded-full">
              <FileIcon extension={getFileExtension(file.name)} {...getFileIconProps(file.name)} />
            </div>
            <span className="text-sm font-medium text-gray-700">{file.name}</span>
          </div>
        )}
      </div>

      {!uploaded && (
        <Button
        onClick={handleUpload}
        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
        disabled={!file}
      >
        {loading ? (
          <Loader className="animate-spin w-5 h-5 text-white" />
        ) : (
          "Upload File"
        )}
      </Button>
      )}
      
    </div>
  );

};

export default FileUpload;
