import { useState, useEffect } from 'react';

export const useNotifications = (isOpen: boolean) => {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showReminderNotification, setShowReminderNotification] = useState(false);

  // Check if user has seen welcome popup this session
  const hasSeenWelcome = sessionStorage.getItem('resonant-directive-welcome-shown');
  const lastReminderTime = localStorage.getItem('resonant-directive-last-reminder');

  // Manage welcome popup display
  useEffect(() => {
    // Show welcome popup only if not seen this session
    if (!hasSeenWelcome && isOpen) {
      setTimeout(() => {
        setShowWelcomePopup(true);
      }, 1000);
    }
  }, [hasSeenWelcome, isOpen]);

  // Set up reminder notification system
  useEffect(() => {
    const currentTime = Date.now();
    const lastReminder = lastReminderTime ? parseInt(lastReminderTime) : 0;
    const timeSinceLastReminder = currentTime - lastReminder;
    
    // Show reminder if it's been more than 30 minutes since last reminder
    // and user has already seen the welcome popup
    if (hasSeenWelcome && timeSinceLastReminder > 30 * 60 * 1000 && !isOpen) {
      const reminderTimer = setTimeout(() => {
        setShowReminderNotification(true);
        localStorage.setItem('resonant-directive-last-reminder', currentTime.toString());
        
        // Auto-hide reminder after 10 seconds
        setTimeout(() => {
          setShowReminderNotification(false);
        }, 10000);
      }, 5 * 60 * 1000); // Show reminder after 5 minutes of activity
      
      return () => clearTimeout(reminderTimer);
    }
  }, [hasSeenWelcome, lastReminderTime, isOpen]);

  const handleWelcomeClose = () => {
    setShowWelcomePopup(false);
    sessionStorage.setItem('resonant-directive-welcome-shown', 'true');
  };

  const handleReminderClose = () => {
    setShowReminderNotification(false);
  };

  return {
    showWelcomePopup,
    showReminderNotification,
    handleWelcomeClose,
    handleReminderClose
  };
};