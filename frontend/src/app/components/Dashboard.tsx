"use client";
import React, { useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";

interface Vehicle {
  vehicleId: string;
  name: string;
  dailyMileage: number;
  remainingKm: number;
  alertType: string;
}

const Dashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "error" | "warning" | "info",
  });

  // Fetch vehicles from backend
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/vehicles");
      setVehicles(response.data);
      setNotification({
        open: true,
        message: "Vehicles fetched successfully!",
        severity: "success",
      });
    } catch (error) {
      setNotification({
        open: true,
        message: "Failed to fetch vehicles. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Resolve alert for a vehicle
  const handleResolveAlert = async (vehicleId: string) => {
    try {
      await axios.post(`/api/vehicles/${vehicleId}/resolve`);
      setVehicles((prev) =>
        prev.map((v) =>
          v.vehicleId === vehicleId ? { ...v, alertType: "Resolved" } : v
        )
      );
      setNotification({
        open: true,
        message: "Alert resolved successfully!",
        severity: "success",
      });
    } catch {
      setNotification({
        open: true,
        message: "Failed to resolve alert. Please try again.",
        severity: "error",
      });
    }
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.name.toLowerCase().includes(filter.toLowerCase()) ||
      vehicle.alertType.toLowerCase().includes(filter.toLowerCase())
  );

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: "100vh", padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Vehicle Tracking Dashboard
      </Typography>
      <Button variant="contained" color="primary" onClick={fetchVehicles}>
        Fetch Vehicles
      </Button>
      <Grid container spacing={4} marginTop={2}>
        <Grid item xs={12}>
          <Paper className="p-4">
            <TextField
              label="Filter by vehicle name or alert type"
              variant="outlined"
              fullWidth
              margin="normal"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            {loading ? (
              <CircularProgress />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Vehicle Name</TableCell>
                      <TableCell>Daily Mileage</TableCell>
                      <TableCell>Remaining KM</TableCell>
                      <TableCell>Alert Type</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.vehicleId}>
                        <TableCell>{vehicle.name}</TableCell>
                        <TableCell>{vehicle.dailyMileage}</TableCell>
                        <TableCell>{vehicle.remainingKm}</TableCell>
                        <TableCell>{vehicle.alertType}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<CheckIcon />}
                            onClick={() => handleResolveAlert(vehicle.vehicleId)}
                          >
                            Resolve
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;
