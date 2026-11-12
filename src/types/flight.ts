export interface FlightTimingRecord {
  id: string;
  date: string; // e.g. "01-NOV-26-SUN"
  flight: string; // e.g. "BG615/BG616"
  sta: string; // Scheduled Time of Arrival (HH:mm)
  std: string; // Scheduled Time of Departure (HH:mm)
  ata: string; // Actual Time of Arrival (HH:mm)
  atd: string; // Actual Time of Departure (HH:mm)
  coverageMan: string; // Coverage man's name
  coverageId?: string; // Coverage man's staff / badge ID
  createdAt: string;
  updatedAt: string;
}
