import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button, Typography, Paper } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";

interface FileUploadProps {
  onDataUploaded: (data: Vehicle[]) => void;
}

interface Vehicle {
  vehicleId: string;
  name: string;
  dailyMileage: number;
  remainingKm: number;
  alertType: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataUploaded }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append("file", file);

      axios
        .post("/api/file-upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          if (response.data && response.data.vehicles) {
            onDataUploaded(response.data.vehicles);
          }
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
        });
    },
    [onDataUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
  });

  return (
    <Paper
      {...getRootProps()}
      className="p-6 text-center cursor-pointer hover:bg-slate-400 transition-colors"
      style={{
        padding: "16px", // Minimal padding for better compactness
        textAlign: "center",
        cursor: "pointer",
        border: "1px solid #ddd", // Normal solid border
        borderRadius: "8px", // Adds a slight rounded corner
        transition: "background-color 0.3s",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow for better visual appeal
      }}
    >
      <input {...getInputProps()} />
      <CloudUploadIcon
        style={{
          fontSize: "40px",
          marginBottom: "10px",
          color: "#2196f3",
        }}
      />
      <Typography
        variant="h6"
        gutterBottom
        style={{
          marginBottom: "10px",
          fontSize: "18px",
        }}
      >
        {isDragActive
          ? "Drop the file here"
          : "Drag and drop an Excel file here, or click to select"}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        style={{
          backgroundColor: "#1976d2",
          textTransform: "none",
        }}
      >
        Select File
      </Button>
    </Paper>
  );
};

export default FileUpload;
