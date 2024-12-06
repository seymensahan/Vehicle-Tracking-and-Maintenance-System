//z

import * as XLSX from 'xlsx';
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button, Typography, Paper } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";

interface FileUploadProps {
  onDataUploaded: (data: Vehicle[]) => void; // Callback for the parent to receive uploaded data
}

interface Vehicle {
  vehicleId: string; // Unique identifier for the vehicle
  name: string; // Vehicle name
  dailyMileage: number; // Daily distance driven
  remainingKm: number; // Remaining distance before maintenance
  alertType: string; // Maintenance alert type
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataUploaded }) => {
  // Handles the file drop
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]; // Select the first file

      if (!file) {
        console.error("No file selected");
        return;
      }

      const formData = new FormData();
      formData.append("file", file); // Append the file to the form data

      try {
        // Send the file to the backend
        const response = await axios.post("/api/file-upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Extract the processed data from the backend response
        const { vehicles } = response.data;
        onDataUploaded(vehicles); // Pass the data to the parent component
      } catch (err: any) {
        console.error("Error uploading file:", err.response?.data || err.message);
      }
    },
    [onDataUploaded]
  );

  // Dropzone configuration for drag-and-drop or file selection
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.ms-excel": [".xls"], // Accept Excel files
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
  });

  return (
    <Paper {...getRootProps()} className="p-6 text-center cursor-pointer">
      <input {...getInputProps()} />
      <CloudUploadIcon style={{ fontSize: "40px", color: "#2196f3" }} />
      <Typography variant="h6">
        {isDragActive ? "Drop the file here" : "Drag and drop an Excel file here, or click to select"}
      </Typography>
      <Button variant="contained" color="primary">Select File</Button>
    </Paper>
  );
};

export default FileUpload;
