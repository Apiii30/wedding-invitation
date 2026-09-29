import type { Guest, NewGuest, Rsvp, RsvpInput, Wish } from "@/lib/types";

export interface Store {
  findGuestBySlug(slug: string): Promise<Guest | null>;
  getRsvpByGuestId(guestId: number): Promise<Rsvp | null>;
  /** Tamu terdaftar: satu RSVP per tamu, bisa diubah. */
  upsertGuestRsvp(guestId: number, input: RsvpInput): Promise<void>;
  /** Tamu umum: setiap kiriman menjadi baris baru. */
  insertPublicRsvp(input: RsvpInput): Promise<void>;
  listWishes(limit: number): Promise<Wish[]>;

  listGuests(): Promise<Guest[]>;
  createGuests(guests: NewGuest[]): Promise<number>;
  deleteGuest(id: number): Promise<void>;
  listRsvps(): Promise<Rsvp[]>;
  setRsvpVisibility(id: number, visible: boolean): Promise<void>;
  deleteRsvp(id: number): Promise<void>;
}
