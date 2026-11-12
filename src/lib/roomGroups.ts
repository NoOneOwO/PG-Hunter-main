/**
 * PG Hunter — roll physical room rows up into the options a student compares.
 *
 * A building with 45 identical single rooms is stored as 45 `listing_rooms`
 * rows: availability is a per-room fact, which is what the owner edits and what
 * the copy button produces. Nobody wants to read 45 rows on a public page, so
 * listing pages show one line per *option* ("Double sharing, ₹11,000, 34 free")
 * and this module owns that grouping so the public page and the owner's
 * availability editor cannot disagree about what a group is.
 *
 * Deliberately pure: no database, no Cloudflare runtime, so it is testable under
 * plain Node.
 */

export interface RoomGroupInput {
  roomType: string;
  occupancy: string;
  rent: number;
  deposit: number;
  available: boolean;
}

export interface RoomGroup {
  /** Stable identity of the option: type + rent + deposit. */
  key: string;
  roomType: string;
  /** Human label, e.g. "Double sharing". */
  label: string;
  rent: number;
  deposit: number;
  /** How many rooms of this option exist. */
  total: number;
  /** How many of them are free right now. */
  available: number;
}

/**
 * Two rooms are the same option when they share type, rent and deposit.
 * Occupancy is presentation ("Double sharing" vs "Twin") and must NOT split a
 * group, or one option would appear twice with a confusing half-count.
 */
export const roomGroupKey = (room: Pick<RoomGroupInput, 'roomType' | 'rent' | 'deposit'>): string =>
  `${room.roomType}|${room.rent}|${room.deposit}`;

export const groupRooms = (rooms: RoomGroupInput[]): RoomGroup[] => {
  const groups = new Map<string, RoomGroup>();

  for (const room of rooms) {
    const key = roomGroupKey(room);
    const existing = groups.get(key);
    if (existing) {
      existing.total += 1;
      if (room.available) existing.available += 1;
      continue;
    }
    groups.set(key, {
      key,
      roomType: room.roomType,
      label: (room.occupancy || room.roomType).trim() || room.roomType,
      rent: room.rent,
      deposit: room.deposit,
      total: 1,
      available: room.available ? 1 : 0,
    });
  }

  // Cheapest option first: it is what the "starting from" price leads with.
  return [...groups.values()].sort((a, b) => a.rent - b.rent || a.label.localeCompare(b.label));
};

/** Rooms free right now, across every option. */
export const availableRoomCount = (rooms: RoomGroupInput[]): number =>
  rooms.reduce((sum, room) => sum + (room.available ? 1 : 0), 0);
