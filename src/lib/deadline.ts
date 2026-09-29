import { wedding } from "@/data/wedding";

export const isRsvpClosed = () => Date.now() > new Date(wedding.rsvpDeadline).getTime();
