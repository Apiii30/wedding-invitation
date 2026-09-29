export type Attendance = "hadir" | "tidak_hadir";

export const ATTENDANCE_LABEL: Record<Attendance, string> = {
  hadir: "Hadir",
  tidak_hadir: "Tidak Hadir",
};

export type Guest = {
  id: number;
  slug: string;
  name: string;
  category: string | null;
  maxPax: number;
  phone: string | null;
  createdAt: string;
};

export type Rsvp = {
  id: number;
  guestId: number | null;
  name: string;
  attendance: Attendance;
  pax: number;
  message: string | null;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Ucapan yang tampil publik di undangan. */
export type Wish = Pick<Rsvp, "id" | "name" | "attendance" | "message" | "createdAt">;

export type RsvpInput = {
  name: string;
  attendance: Attendance;
  pax: number;
  message: string | null;
};

export type NewGuest = {
  name: string;
  category: string | null;
  maxPax: number;
  phone: string | null;
};
