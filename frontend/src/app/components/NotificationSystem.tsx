//z
import React from "react";
import { Snackbar, Alert } from "@mui/material";

interface NotificationSystemProps {
  open: boolean; // Whether the notification is visible.
  message: string; // The notification message.
  severity: "success" | "error" | "warning" | "info"; // Severity type of the notification.
  onClose: () => void; // Callback to close the notification.
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  open,
  message,
  severity,
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000} // Automatically close after 6 seconds.
      onClose={onClose} // Close the notification when triggered.
      anchorOrigin={{ vertical: "top", horizontal: "center" }} // Position on the screen.
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {message} {/* Display the message. */}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSystem;
