"use client";

import React, { useState, useEffect } from "react";
import { Container, Typography, Grid } from "@mui/material";
import axios from "axios";
import FileUpload from "./components/FileUpload"; // File upload UI
import MileageChart from "./components/MileageChart"; // Visualize mileage data
import Dashboard from "./components/Dashboard"; // Display uploaded data
import NotificationSystem from "./components/NotificationSystem"; // Display alerts

// Vehicle data interface
interface Vehicle {
  vehicleId: string;
  name: string;
  dailyMileage: number;
  remainingKm: number;
  alertType: string;
}

// Maintenance alert interface
interface Alert {
  alertId: string;
  vehicleName: string;
  maintenanceType: string;
  remainingKm: number;
}

const App: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]); // Vehicle data
  const [alerts, setAlerts] = useState<Alert[]>([]); // Maintenance alerts
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "error" | "warning" | "info",
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/interventions/vehicles");
      // Ensure the response data is an array
      setVehicles(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setNotification({
        open: true,
        message: "Failed to fetch vehicle data. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get("/api/interventions");
      // Ensure the response data is an array
      setAlerts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setNotification({
        open: true,
        message: "Failed to fetch alerts. Please try again.",
        severity: "error",
      });
    }
  };

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

  useEffect(() => {
    fetchVehicles();
    fetchAlerts();

    const interval = setInterval(() => {
      fetchVehicles();
      fetchAlerts();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
          ) : (
            <Dashboard data={alerts && alerts.length > 0 ? alerts : []} />
          )}
        </Grid>
        <Grid item xs={12}>
          {loading ? (
            <Typography variant="h6">Loading data...</Typography>
          ) : (
            <MileageChart
              data={
                vehicles && vehicles.length > 0
                  ? vehicles.map((v) => ({
                      name: v.name,
                      dailyMileage: v.dailyMileage,
                    }))
                  : [] // Safeguard empty array if no vehicles are present
              }
            />
          )}
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
