export const calculateBusinessDays = (startDate: Date, endDate: Date): number => {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
};

export const isReservationAllowed = (selectedDate: Date): { allowed: boolean; message?: string } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const businessDaysUntil = calculateBusinessDays(today, selectedDate);
  
  if (businessDaysUntil < 5) {
    return {
      allowed: false,
      message: "Pour garantir la qualité de nos ateliers, les réservations doivent être faites au moins 5 jours à l'avance."
    };
  }
  
  return { allowed: true };
};