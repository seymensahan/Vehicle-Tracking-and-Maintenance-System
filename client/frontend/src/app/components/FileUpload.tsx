import * as XLSX from 'xlsx';
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
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) {
        console.error("No file selected");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post("/api/file-upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const { vehicles } = response.data;
        onDataUploaded(vehicles);
      } catch (err: any) {
        console.error("Error uploading file:", err.response?.data || err.message);
      }
    },
    [onDataUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.ms-excel": [".xls"],
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
