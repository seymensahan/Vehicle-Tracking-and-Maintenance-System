//z
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import axios from "axios";

// Define the types for vehicles and props for better type checking.
interface Vehicle {
  vehicleId: string; // Unique identifier for each vehicle.
  name: string; // Name of the vehicle.
  dailyMileage: number; // Daily mileage covered by the vehicle.
  remainingKm: number; // Remaining kilometers before maintenance is due.
  alertType: string; // Type of maintenance alert.
}

interface DashboardProps {
  data: Vehicle[]; // Array of vehicles passed as a prop.
  onResolveAlert: (vehicleId: string) => void; // Callback to resolve alerts.
}

const Dashboard: React.FC<DashboardProps> = ({ data, onResolveAlert }) => {
  const [filter, setFilter] = useState<string>(""); // Holds the user's filter input.
  const [loading, setLoading] = useState<boolean>(false); // Tracks if data is loading.
  const [error, setError] = useState<string | null>(null); // Tracks errors, if any.

  // Filter vehicles based on user input (matches name or alert type).
  const filteredVehicles = data.filter(
    (vehicle) =>
      vehicle.name?.toLowerCase().includes(filter.toLowerCase()) ||
      vehicle.alertType?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Paper className="p-4">
      <Typography variant="h5" gutterBottom>
        Vehicle Alerts Dashboard
      </Typography>
      {loading ? (
        <CircularProgress /> // Show loading spinner when data is being fetched.
      ) : (
        <>
          {error && (
            <Typography color="error" variant="body2" gutterBottom>
              {error} {/* Show error message if an error occurs. */}
            </Typography>
          )}
          <TextField
            label="Filter by vehicle name or alert type" // Input to filter vehicles.
            variant="outlined"
            fullWidth
            margin="normal"
            value={filter}
            onChange={(e) => setFilter(e.target.value)} // Update the filter state.
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {/* Table headers */}
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
                        onClick={() => onResolveAlert(vehicle.vehicleId)} // Call resolve function on click.
                      >
                        Resolve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Paper>
  );
};

export default Dashboard;
