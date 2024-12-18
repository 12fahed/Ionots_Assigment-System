"use client";

import React, { useState } from "react";
import FileUpload from "@/components/FileUpload";

const Home: React.FC = () => {
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");

  const handleFileUploaded = (url: string) => {
    setUploadedFileUrl(url);
  };

  return (
    <div>
      <h1>Upload Files to Cloudinary</h1>
      <FileUpload onFileUploaded={handleFileUploaded} />
      {uploadedFileUrl && (
        <div>
          <h2>Uploaded File:</h2>
          <a href={uploadedFileUrl} target="_blank" rel="noopener noreferrer">
            {uploadedFileUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default Home;
