export interface DaySchedule {
  // Which day this is for.
  dayOfTheWeek: string; // TODO: type = DayOfTheWeek
  // Usually just 1 time slot.
  timeSlots?: TimeSlot[];
}

export interface TimeSlot {
  // Time-segment of the day.
  timeOfTheDay: string; // TODO: type = TimeOfTheDay
  // When exactly
  plannedStartTime?: string;
  // How long
  plannedDurationInMinutes?: number; // Activities only.
}
