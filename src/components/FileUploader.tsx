
import React, { useState, useRef } from 'react';
import { AlertCircle, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export type FileWithPreview = {
  file: File;
  id: string;
};

type FileUploaderProps = {
  maxFiles?: number;
  acceptedFileTypes?: string[];
  maxFileSizeMB?: number;
  onFilesChange: (files: FileWithPreview[]) => void;
  files: FileWithPreview[];
};

const FileUploader: React.FC<FileUploaderProps> = ({
  maxFiles = 10,
  acceptedFileTypes = ['.pdf', '.docx', '.pptx'],
  maxFileSizeMB = 10,
  onFilesChange,
  files,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processFiles = (fileList: FileList) => {
    // Create array from FileList
    const newFilesArray = Array.from(fileList);
    
    // Check if adding these files would exceed the limit
    if (files.length + newFilesArray.length > maxFiles) {
      toast.error(`You can only upload a maximum of ${maxFiles} files.`);
      return;
    }

    // Filter files for allowed types and size
    const validFiles = newFilesArray.filter(file => {
      // Check file type
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      const isTypeValid = acceptedFileTypes.includes(fileExtension);
      
      if (!isTypeValid) {
        toast.error(`File type ${fileExtension} is not supported.`);
        return false;
      }
      
      // Check file size
      const isSizeValid = file.size <= maxFileSizeBytes;
      if (!isSizeValid) {
        toast.error(`File ${file.name} exceeds the maximum size limit of ${maxFileSizeMB}MB.`);
        return false;
      }
      
      return true;
    });

    // Convert to FileWithPreview objects and add them
    const newFiles = validFiles.map(file => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

    // Update state with new files added to existing files
    onFilesChange([...files, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset the input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (id: string) => {
    onFilesChange(files.filter(file => file.id !== id));
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="space-y-4">
      {/* Upload dropzone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? 'drag-active' : 'border-gray-300 hover:border-primary'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileInputChange}
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-1">
            <p className="text-lg font-medium">
              Drag and drop your files here
            </p>
            <p className="text-sm text-gray-500">
              or
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={openFileDialog}
              disabled={files.length >= maxFiles}
            >
              Browse files
            </Button>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Supported formats: PDF, DOCX, PPTX</p>
            <p>Maximum file size: {maxFileSizeMB}MB</p>
            <p>
              {files.length} of {maxFiles} files selected
            </p>
          </div>
        </div>
      </div>
      
      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Selected Files</div>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="file-item">
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" title={file.file.name}>
                      {file.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-gray-900"
                  onClick={() => handleRemoveFile(file.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Warning if no files selected */}
      {files.length === 0 && (
        <div className="flex items-center gap-2 text-amber-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Please select at least one file to translate</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
