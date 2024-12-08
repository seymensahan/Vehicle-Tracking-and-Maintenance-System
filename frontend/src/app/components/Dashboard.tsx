"use client";
import React, { useState, useEffect } from "react";
import {
  Container,
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
  CircularProgress,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

interface Vehicle {
  vehicleId: string;
  name: string;
  dailyMileage: number;
  remainingKm: number;
  alertType: string;
}

interface DashboardProps {
  data: Vehicle[]; // External data passed as a prop
  onResolveAlert: (vehicleId: string) => void; // Callback to resolve an alert
}

const Dashboard: React.FC<DashboardProps> = ({ data, onResolveAlert }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(data);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "error" | "warning" | "info",
  });

  useEffect(() => {
    // Update vehicles state whenever `data` prop changes
    setVehicles(data);
  }, [data]);

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.name.toLowerCase().includes(filter.toLowerCase()) ||
      vehicle.alertType.toLowerCase().includes(filter.toLowerCase())
  );

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: "100vh", paddingY: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper className="p-4">
            <TextField
              label="Filter by vehicle name or alert type"
              variant="outlined"
              fullWidth
              margin="dense" // Use 'dense' to minimize spacing
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            
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
                            onClick={() => onResolveAlert(vehicle.vehicleId)}
                          >
                            Resolve
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            
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