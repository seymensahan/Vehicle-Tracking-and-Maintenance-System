"use client";

import React, { useState, useEffect } from "react";
import { Container, Typography, Grid } from "@mui/material";
import axios from "axios";
import FileUpload from "./components/FileUpload"; // File upload UI
import MileageChart from "./components/MileageChart"; // Visualize mileage data
import Dashboard from "./components/Dashboard"; // Display uploaded data
import NotificationSystem from "./components/NotificationSystem"; // Display alerts

interface Vehicle {
  vehicleId: string;
  name: string;
  dailyMileage: number;
}

interface Intervention {
  id: string;
  intervention_name: string;
  last_performed: string;
  next_due: number;
  mileage: number;
  vehicle_id: string;
  alert_sent: boolean;
  vehicle_name: string; // vehicle_name is now required
}

const App: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]); // Vehicle data
  const [interventions, setInterventions] = useState<Intervention[]>([]); // Maintenance interventions
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "error" | "warning" | "info",
  });

  // Fetch vehicle data
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/interventions/vehicles");
      setVehicles(response.data);
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

  // Fetch intervention data and map vehicle_name
  const fetchInterventions = async () => {
    try {
      const response = await axios.get("/api/interventions/alerts");
      const interventionsWithVehicleName = response.data.map((intervention: Intervention) => {
        const vehicle = vehicles.find((v) => v.vehicleId === intervention.vehicle_id);
        return {
          ...intervention,
          vehicle_name: vehicle ? vehicle.name : "Unknown Vehicle", // Map vehicle_name
        };
      });
      setInterventions(interventionsWithVehicleName);
      console.log("Alerts fetched:", interventionsWithVehicleName);
    } catch (error) {
      console.error("Error fetching interventions:", error);
      setNotification({
        open: true,
        message: "Failed to fetch interventions. Please try again.",
        severity: "error",
      });
    }
  };

  // Handle data upload
  const handleDataUploaded = (data: Vehicle[]) => {
    setVehicles(data);
    setNotification({
      open: true,
      message: "Data uploaded successfully!",
      severity: "success",
    });
  };

  // Close notifications
  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // Fetch data on mount and set interval
  useEffect(() => {
    fetchVehicles(); // Load vehicles first

    // Only fetch interventions after vehicles are fetched
    if (vehicles.length > 0) {
      fetchInterventions();
    }

    const interval = setInterval(() => {
      fetchVehicles();
      if (vehicles.length > 0) {
        fetchInterventions();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [vehicles]); // Ensure vehicles are updated before mapping vehicle_name

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
            <Dashboard data={interventions && interventions.length > 0 ? interventions : []} />
          )}
        </Grid>
        <Grid item xs={12}>
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
