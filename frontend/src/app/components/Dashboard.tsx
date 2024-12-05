import React, { useEffect, useState } from "react";
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

// Define the types for the vehicles and props.
interface Vehicle {
  vehicleId: string;
  name: string;
  dailyMileage: number;
  remainingKm: number;
  alertType: string;
}

interface DashboardProps {
  data: Vehicle[]; // Accept an array of vehicles as a prop.
  onResolveAlert: (vehicleId: string) => void; // Accept a function to handle alert resolution.
}

const Dashboard: React.FC<DashboardProps> = ({ data, onResolveAlert }) => {
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter vehicles based on user input
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
        <CircularProgress />
      ) : (
        <>
          {error && (
            <Typography color="error" variant="body2" gutterBottom>
              {error}
            </Typography>
          )}
          <TextField
            label="Filter by vehicle name or alert type"
            variant="outlined"
            fullWidth
            margin="normal"
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
        </>
      )}
    </Paper>
  );
};

export default Dashboard;
