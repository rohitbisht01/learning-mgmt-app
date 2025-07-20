"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import RenderEmptyState, {
  RenderErrorState,
  RenderUploadedState,
  RenderUploadingState,
} from "./render-state";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface UploaderState {
  id: string | null;
  file: File | null;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectUrl?: string;
  fileType: "image" | "video";
}

interface iAppProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function Uploader({ value, onChange }: iAppProps) {
  const [filesState, setFilesState] = useState<UploaderState>({
    error: false,
    file: null,
    id: null,
    uploading: false,
    progress: 0,
    isDeleting: false,
    fileType: "image",
    key: value,
  });

  const uploadFile = async (file: File) => {
    setFilesState((prev) => ({ ...prev, uploading: true, progress: 0 }));

    try {
      // get presigned url
      const presignedResponse = await fetch("/api/s3/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          isImage: true,
        }),
      });

      if (!presignedResponse.ok) {
        toast.error("Failed to get presigned URL");
        setFilesState((prev) => ({
          ...prev,
          error: true,
          uploading: false,
          progress: 0,
        }));
        return;
      }

      const { presignedUrl, key } = await presignedResponse.json();
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentageCompleted = (event.loaded / event.total) * 100;
            setFilesState((prev) => ({
              ...prev,
              progress: Math.round(percentageCompleted),
            }));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 204) {
            setFilesState((prev) => ({
              ...prev,
              progress: 100,
              uploading: false,
              key: key,
            }));

            onChange?.(key);

            toast.success("File uploaded successfully");
            resolve();
          } else {
            reject(new Error("Upload failed"));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Upload failed"));
        };

        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch {
      toast.error("Somthing went wrong");
      setFilesState((prev) => ({
        ...prev,
        error: true,
        progress: 0,
        uploading: false,
      }));
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        if (filesState.objectUrl && !filesState.objectUrl.startsWith("http")) {
          URL.revokeObjectURL(filesState.objectUrl);
        }

        setFilesState({
          file: file,
          uploading: false,
          id: uuidv4(),
          error: false,
          progress: 0,
          objectUrl: URL.createObjectURL(file),
          isDeleting: false,
          fileType: "image",
        });
        uploadFile(file);
      }
    },
    [filesState.objectUrl]
  );

  async function handleRemoveFile() {
    if (filesState.isDeleting || !filesState.objectUrl) return;

    try {
      setFilesState((prev) => ({
        ...prev,
        isDeleting: true,
      }));

      const response = await fetch("/api/s3/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: filesState.key }),
      });
      if (!response.ok) {
        toast.error("Failed to remove file from storage");
        setFilesState((prev) => ({
          ...prev,
          isDeleting: true,
          error: true,
        }));
        return;
      }

      if (filesState.objectUrl && !filesState.objectUrl.startsWith("http")) {
        URL.revokeObjectURL(filesState.objectUrl);
      }

      onChange?.("");

      setFilesState(() => ({
        file: null,
        uploading: false,
        error: false,
        fileType: "image",
        id: null,
        isDeleting: false,
        progress: 0,
      }));
      toast.success("File successfully deleted");
    } catch {
      toast.error("Error removing file, Please try again");
      setFilesState((prev) => ({
        ...prev,
        error: true,
        isDeleting: false,
      }));
    }
  }

  const rejectedFiles = (fileRejection: FileRejection[]) => {
    if (fileRejection.length) {
      const tooManyFiles = fileRejection.find(
        (rejection) => rejection.errors[0].code === "too-many-files"
      );

      const fileSizeTooBig = fileRejection.find(
        (rejection) => rejection.errors[0].code === "file-too-large"
      );

      if (fileSizeTooBig) {
        toast.error("File size exceeds max size, max is 5MB");
      }
      if (tooManyFiles) {
        toast.error("Too many files selected, max is 1");
      }
    }
  };

  function renderContent() {
    if (filesState.uploading) {
      return (
        <RenderUploadingState
          progress={filesState.progress}
          file={filesState.file as File}
        />
      );
    }

    if (filesState.error) {
      return <RenderErrorState />;
    }

    if (filesState.objectUrl) {
      return (
        <RenderUploadedState
          previewUrl={filesState.objectUrl}
          handleRemoveFile={handleRemoveFile}
          isDeleting={filesState.isDeleting}
        />
      );
    }

    return <RenderEmptyState isDragActive={isDragActive} />;
  }

  useEffect(() => {
    return () => {
      if (filesState.objectUrl && !filesState.objectUrl.startsWith("http")) {
        URL.revokeObjectURL(filesState.objectUrl);
      }
    };
  }, [filesState.objectUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 5 * 1024 * 1024,
    onDropRejected: rejectedFiles,
    disabled: !!filesState.objectUrl || filesState.uploading,
  });

  return (
    <Card
      className={cn(
        "relative border-2 border-dashed p-4 transition-colors duration-200 ease-in-out w-full h-64",
        isDragActive
          ? "border-primary bg-primary/10 border-solid"
          : "boder-border hover:border-primary"
      )}
      {...getRootProps()}
    >
      <CardContent className="flex items-center justify-center h-full">
        <input {...getInputProps()} />
        {renderContent()}
      </CardContent>
    </Card>
  );
}
