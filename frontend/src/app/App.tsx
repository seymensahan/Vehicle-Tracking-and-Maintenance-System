"use client";

import React, { useState } from "react";
import { Container, Typography, Grid } from "@mui/material";
import FileUpload from "./components/FileUpload";
import MileageChart from "./components/MileageChart";
import Dashboard from "./components/Dashboard";
import NotificationSystem from "./components/NotificationSystem";

interface Vehicle {
  vehicleId: string;
  name: string;
  dailyMileage: number;
  remainingKm: number;
  alertType: string;
}

const App: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "error" | "warning" | "info",
  });

  const handleDataUploaded = (data: Vehicle[]) => {
    setVehicles(data);
    setNotification({
      open: true,
      message: "Data uploaded successfully!",
      severity: "success",
    });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleResolveAlert = (vehicleId: string) => {
    console.log(`Alert resolved for vehicle: ${vehicleId}`);
  };

  return (
    <Container
      maxWidth="lg"
      className="py-8"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h4" gutterBottom textAlign="center">
        Vehicle Tracking and Maintenance System
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <FileUpload onDataUploaded={handleDataUploaded} />
        </Grid>
        <Grid item xs={12}>
          <Dashboard data={vehicles} onResolveAlert={handleResolveAlert} />
        </Grid>
        <Grid item xs={12}>
          <MileageChart
            data={vehicles.map((v) => ({
              name: v.name,
              dailyMileage: v.dailyMileage,
            }))}
          />
        </Grid>
      </Grid>
      <NotificationSystem
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Container>
  );
};

export default App;
