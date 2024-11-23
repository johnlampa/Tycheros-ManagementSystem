import React, { useEffect } from "react";

type NotificationProps = {
  message: string;
  onClose: () => void;
  duration?: number; // duration in milliseconds
};

const Notification: React.FC<NotificationProps> = ({
  message,
  onClose,
  duration = 3000, // default duration of 3 seconds
}) => {
  useEffect(() => {
    // Set up a timer to auto-dismiss the notification after the specified duration
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    // Clean up the timer if the component is unmounted before the duration ends
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed top-4 right-4 bg-cream text-white px-4 py-2 rounded-lg shadow-lg z-50">
      <p className="text-sm text-primaryBrown">{message}</p>
    </div>
  );
};

export default Notification;
