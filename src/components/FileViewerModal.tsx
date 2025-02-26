"use client"

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DownloadIcon, XIcon } from 'lucide-react';
import { FileIcon, defaultStyles } from 'react-file-icon';
import { Separator } from "@/components/ui/separator"

interface FileViewerModalProps {
  files: string[];
  title: string,
  submittedLink: string,
  submittedNote: string,
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({ files, title, submittedLink, submittedNote}) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const getFileExtension = (url: string) => {
    const filename = url.split('/').pop() || '';
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
  };

  const isViewable = (extension: string) => {
    const viewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif'];
    return viewableExtensions.includes(extension);
  };

  const getIconStyle = (extension: string) => {
    return defaultStyles[extension as keyof typeof defaultStyles] || defaultStyles.txt;
  };

  const renderFileContent = (file: string) => {
    const extension = getFileExtension(file);
    if (extension === 'pdf') {
      return (
        <iframe
          src={`${file}#toolbar=0`}
          className="w-full h-[calc(100vh-200px)]"
          title="PDF Viewer"
        />
      );
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return (
        <img
          src={file}
          alt="File preview"
          className="max-w-full max-h-[calc(100vh-200px)] object-contain"
        />
      );
    }
    return null;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {title==="View Submitted Documents" ? (
          <Button className='bg-green-400 text-white hover:bg-green-500 border border-green-500 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-500'>View Submitted Assignment</Button>
        ): (
          <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-700 border border-blue-500 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:text-white">View Files</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((file, index) => {
              const extension = getFileExtension(file);
              return (
                <div key={index} className="border p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8">
                      <FileIcon extension={extension} {...getIconStyle(extension)} />
                    </div>
                    <span className="font-medium">.{extension}</span>
                  </div>
                  {isViewable(extension) ? (
                    <Button onClick={() => setSelectedFile(file)} variant="outline">
                      View
                    </Button>
                  ) : (
                    <Button onClick={() => window.open(file, '_blank')} variant="outline">
                      <DownloadIcon className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          {/* {title==="View Submitted Documents" && submittedLink!=="" && (
            <div>
              <Separator className="my-2"/>
              <div className='text-base font-semibold flex items-center'>
                Submitted Link
                <a href={submittedLink} target="_blank">
                  <Button className="bg-blue-500 text-white hover:bg-blue-700 border border-blue-500 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-5">Link
                  </Button>
                </a>
              </div>
            </div>

          )}
          {title==="View Submitted Documents" && submittedNote!=="" && (
            <div>
              <Separator className="my-2"/>
              <div className='text-base font-semibold text-blue-400'>
                Submitted Note: {submittedNote}
              </div>
            </div>
          )} */}
          {title === "View Submitted Documents" && submittedLink !== "" && (
            <div className="my-2">
              <Separator className="my-2" />
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Submitted Link</span>
                <a href={submittedLink} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-blue-500 text-white hover:bg-blue-700 border border-blue-500 rounded-lg px-6 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    View Link
                  </Button>
                </a>
              </div>
            </div>
          )}

          {title === "View Submitted Documents" && submittedNote !== "" && (
            <div className="">
              <Separator className="my-2" />
              <div className="text-base font-semibold text-blue-400 mt-2">
                Submitted Note: {submittedNote}
              </div>
            </div>
          )}
      </DialogContent>

      {selectedFile && (
        <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>File Preview</span>
              </DialogTitle>
            </DialogHeader>
            <div className="flex-grow overflow-auto">
              {renderFileContent(selectedFile)}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default FileViewerModal;

