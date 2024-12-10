import React, { useState } from "react";
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

interface Intervention {
  id: string;
  intervention_name: string;
  last_performed: string;
  next_due: number;
  mileage: number;
  vehicle_name: string; // Updated to match database column
  alert_sent: boolean;
}

interface DashboardProps {
  data: Intervention[];  // External data passed as a prop
  
}

const Dashboard = ({ data }: DashboardProps) => {
  const [interventions, setInterventions] = useState<Intervention[]>(data);
  const [filter, setFilter] = useState<string>(""); // Filter state for vehicle_name
  const [loading, setLoading] = useState<boolean>(false); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

  // Filter interventions directly by vehicle_name
  const filteredInterventions = interventions.filter((intervention) =>
    intervention.vehicle_name.toLowerCase().includes(filter.toLowerCase())
  );

  // Resolve an intervention
  const resolveIntervention = async (id: string) => {
    try {
      setLoading(true); // Start loading
      await axios.post(`/api/interventions/resolve/${id}`);
      // Remove resolved intervention from the state
      setInterventions((prev) => prev.filter((intervention) => intervention.id !== id));
    } catch (error) {
      setError("Error resolving intervention. Please try again."); // Set error message
      console.error("Error resolving intervention:", error);
    } finally {
      setLoading(false); // End loading
    }
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
              <CircularProgress /> // Show loading spinner while resolving
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
                        <TableCell>{intervention.vehicle_name}</TableCell>
                        <TableCell>{intervention.intervention_name}</TableCell>
                        <TableCell>{intervention.last_performed}</TableCell>
                        <TableCell>{intervention.next_due}</TableCell>
                        <TableCell>{intervention.mileage}</TableCell>
                        <TableCell>
                          {intervention.alert_sent ? "Yes" : "No"}
                        </TableCell>
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
