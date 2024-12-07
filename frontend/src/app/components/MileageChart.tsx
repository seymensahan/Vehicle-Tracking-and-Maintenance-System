//z
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Paper, Typography } from "@mui/material";

interface MileageChartProps {
  data: Array<{ name: string; dailyMileage: number }>; // Expect array of objects with vehicle name and daily mileage.
}

const MileageChart: React.FC<MileageChartProps> = ({ data }) => {
  return (
    <Paper className="p-4">
      <Typography variant="h6" gutterBottom>
        Daily Mileage Trends
      </Typography>
      {data.length === 0 ? (
        <Typography>No data available to display.</Typography> // Handle empty data gracefully.
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" /> {/* Add grid lines. */}
            <XAxis
              dataKey="name" // Use 'name' as the X-axis key.
              label={{
                value: "Vehicle Names",
                position: "insideBottom",
                offset: -5,
              }}
            />
            <YAxis
              label={{
                value: "Daily Mileage (km)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip /> {/* Tooltip on hover. */}
            <Legend /> {/* Display legend for clarity. */}
            <Line
              type="monotone" // Line curve type.
              dataKey="dailyMileage" // Data key for the line.
              stroke="#8884d8" // Line color.
              activeDot={{ r: 8 }} // Dot size on hover.
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

export default MileageChart;