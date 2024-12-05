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
  data: Array<{ name: string; dailyMileage: number }>;
}

const MileageChart: React.FC<MileageChartProps> = ({ data }) => {
  return (
    <Paper className="p-4">
      <Typography variant="h6" gutterBottom>
        Daily Mileage Trends
      </Typography>
      {data.length === 0 ? (
        <Typography>No data available to display.</Typography>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
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
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="dailyMileage"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

export default MileageChart;
