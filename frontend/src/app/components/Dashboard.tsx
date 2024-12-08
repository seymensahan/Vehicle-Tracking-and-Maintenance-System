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
  CircularProgress,
  Typography,
} from "@mui/material";
import axios from "axios";

interface Vehicle {
  vehicleId: string;
  name: string;
}

interface Intervention {
  id: string;
  intervention_name: string;
  last_performed: string;
  next_due: string;
  mileage: number;
  vehicle_id: string;
  alert_sent: boolean;
}

interface DashboardProps {
  data: Intervention[]; // External data passed as a prop
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [interventions, setInterventions] = useState<Intervention[]>(data);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

  // Fetch vehicles to map vehicle_id to vehicleName
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true); // Start loading
        const response = await axios.get("/api/interventions/vehicles");
        setVehicles(response.data);
      } catch (error) {
        setError("Error fetching vehicles"); // Set error message if request fails
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchVehicles();
  }, []);

  // Filter interventions based on filter input
  const filteredInterventions = interventions.filter((intervention) =>
    vehicles
      .find((vehicle) => vehicle.vehicleId === intervention.vehicle_id)
      ?.name.toLowerCase()
      .includes(filter.toLowerCase())
  );

  // Resolve an intervention
  const resolveIntervention = async (id: string) => {
    try {
      await axios.post(`/api/interventions/resolve/${id}`);
      setInterventions((prev) => prev.filter((intervention) => intervention.id !== id));
    } catch (error) {
      console.error("Error resolving intervention:", error);
    }
  };

  // Map vehicle_id to vehicleName
  const getVehicleName = (vehicleId: string) => {
    return vehicles.find((vehicle) => vehicle.vehicleId === vehicleId)?.name || "Unknown Vehicle";
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: "100vh", paddingY: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ padding: 4 }}>
            <TextField
              label="Filter by vehicle name"
              variant="outlined"
              fullWidth
              margin="dense"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            {loading ? (
              <CircularProgress /> // Show loading spinner while fetching
            ) : error ? (
              <Typography color="error">{error}</Typography> // Display error message
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Vehicle Name</TableCell>
                      <TableCell>Intervention Name</TableCell>
                      <TableCell>Last Performed</TableCell>
                      <TableCell>Next Due</TableCell>
                      <TableCell>Mileage</TableCell>
                      <TableCell>Alert Sent</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInterventions.map((intervention) => (
                      <TableRow key={intervention.id}>
                        <TableCell>{getVehicleName(intervention.vehicle_id)}</TableCell>
                        <TableCell>{intervention.intervention_name}</TableCell>
                        <TableCell>{intervention.last_performed}</TableCell>
                        <TableCell>{intervention.next_due}</TableCell>
                        <TableCell>{intervention.mileage}</TableCell>
                        <TableCell>{intervention.alert_sent ? "Yes" : "No"}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => resolveIntervention(intervention.id)}
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
    </Container>
  );
};

export default Dashboard;
