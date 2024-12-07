"use client";
import React, { useState, useEffect } from "react";
import { Container, Typography, Grid } from "@mui/material";
import FileUpload from "./components/FileUpload"; // File upload UI
import MileageChart from "./components/MileageChart"; // Visualize mileage data
import Dashboard from "./components/Dashboard"; // Display uploaded data
import NotificationSystem from "./components/NotificationSystem"; // Display alerts

interface Vehicle {
  vehicleId: string;
  name: string;
  dailyMileage: number;
  remainingKm: number;
  alertType: string;
}

const App: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]); // Store vehicle data
  const [loading, setLoading] = useState<boolean>(false); // Track loading state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "error" | "warning" | "info",
  });

  // Callback to handle uploaded data
  const handleDataUploaded = (data: Vehicle[]) => {
    if (data) {
      setVehicles(data);
      setNotification({
        open: true,
        message: "Data uploaded successfully!",
        severity: "success",
      });
    }
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    // Simulate data fetch and loading state (You can replace this with actual data fetching logic)
    setLoading(true);

    // Example data fetch
    const fetchData = async () => {
      try {
        const response = await fetch('/api/interventions'); // Proxied to http://localhost:5000/api/interventions/vehicles
        if (!response.ok) {
          throw new Error("Failed to fetch vehicles");
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    };
    
    

    fetchData();
  }, []); // Run this effect only once on component mount

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
            <Dashboard data={vehicles} onResolveAlert={() => {}} />
          )}
        </Grid>
        <Grid item xs={12}>
          {loading ? (
            <Typography variant="h6">Loading data...</Typography>
          ) : (
            <MileageChart
              data={vehicles.map((v) => ({
                name: v.name,
                dailyMileage: v.dailyMileage,
              }))}
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
