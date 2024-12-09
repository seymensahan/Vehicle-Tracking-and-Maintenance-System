import { useState, useEffect } from "react";
import axios from "axios";
import { Intervention } from "../App";

const useTruckData = () => {
  const [alertTruck, setAlertTruck] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterventions = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/interventions/alerts");
      const interventionsWithVehicleName = response.data.map((intervention: Intervention) => ({
        ...intervention,
      }));
      setAlertTruck(interventionsWithVehicleName);
    } catch (err) {
      setError("Failed to fetch interventions. Please try again.");
      console.error("Error fetching interventions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, []);

  return { alertTruck, loading, error };
};

export default useTruckData;
