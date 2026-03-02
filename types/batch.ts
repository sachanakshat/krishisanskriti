export interface Batch {
  _id?: string;
  weekStart: string; // "YYYY-MM-DD" — always a Monday
  title: string;
  maxSeats: number; // default 32
  notes?: string;
  createdAt?: string;
}

export interface BatchWithCount extends Batch {
  _id: string;
  registrationCount: number;
  seatsLeft: number;
}
