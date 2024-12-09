"use client"
import React, { useState } from "react";
import { Container, Typography, Grid } from "@mui/material";
import FileUpload from "./components/FileUpload";
import MileageChart from "./components/MileageChart";
import Dashboard from "./components/Dashboard";
import NotificationSystem from "./components/NotificationSystem";
import useTruckData from "./hooks/useTruckData";

interface Vehicle {
  vehicleId: string;
  name: string;
  dailyMileage: number;
}

export interface Intervention {
  id: string;
  intervention_name: string;
  last_performed: string;
  next_due: number;
  mileage: number;
  vehicle_id: string;
  alert_sent: boolean;
  vehicle_name: string;
}

const App: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "error" | "warning" | "info",
  });

  const { alertTruck, loading, error } = useTruckData();

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

  return (
    <Container maxWidth="lg" sx={{ minHeight: "100vh", textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Vehicle Tracking and Maintenance System
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <FileUpload onDataUploaded={handleDataUploaded} />
        </Grid>
        <Grid item xs={12}>
          {loading ? (
            <Typography variant="h6">Loading data...</Typography>
          ) : error ? (
            <Typography variant="h6" color="error">
              {error}
            </Typography>
          ) : (
            <Dashboard data={alertTruck} />
          )}
        </Grid>
        {/* <Grid item xs={12}>
          <MileageChart
            data={
              vehicles && vehicles.length > 0
                ? vehicles.map((v) => ({
                    name: v.name,
                    dailyMileage: v.dailyMileage,
                  }))
                : []
            }
          />
        </Grid> */}
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
