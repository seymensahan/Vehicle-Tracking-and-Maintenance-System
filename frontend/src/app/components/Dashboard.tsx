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
} from "@mui/material";
import axios from "axios";

interface Alert {
  alertId: string;
  vehicleName: string;
  maintenanceType: string;
  remainingKm: number;
}

interface DashboardProps {
  data: Alert[]; // External data passed as a prop
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [alerts, setAlerts] = useState<Alert[]>(data); // Initialize alerts with the passed data prop
  const [filter, setFilter] = useState<string>("");

  // Filter alerts based on vehicle name or maintenance type
  const filteredAlerts = alerts.filter(
    (alert) =>
      (alert.vehicleName && alert.vehicleName.toLowerCase().includes(filter.toLowerCase())) ||
      (alert.maintenanceType && alert.maintenanceType.toLowerCase().includes(filter.toLowerCase()))
  );

  const resolveAlert = async (id: string) => {
    try {
      await axios.post(`/api/interventions/resolve/${id}`);
      setAlerts((prev) => prev.filter((alert) => alert.alertId !== id));
    } catch (error) {
      console.error("Error resolving alert:", error);
    }
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
                    <TableCell>Maintenance Type</TableCell>
                    <TableCell>Remaining KM</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.alertId}>
                      <TableCell>{alert.vehicleName}</TableCell>
                      <TableCell>{alert.maintenanceType}</TableCell>
                      <TableCell>{alert.remainingKm}</TableCell>
                      <TableCell>
                        <Button onClick={() => resolveAlert(alert.alertId)}>Resolve</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
