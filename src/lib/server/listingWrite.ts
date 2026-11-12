/**
 * PG Hunter — create a listing for an owner.
 *
 * One code path, two callers:
 *   POST /api/owner/listings   the owner creates their own page
 *   POST /api/admin/listings   the team creates it on the owner's behalf
 *
 * Keeping the write in one place matters because both flows must produce
 * identical rows: the owner has to be able to manage a team-created page from
 * their own dashboard later, so there is no "admin listing" schema — only
 * `admin_managed`, which records who set it up.
 */

import { nowIso } from './auth';
import { mediaUrl } from './media';
import { fetchListing, listingDto, type ListingDto } from './listings';
import type { ParsedListingPayload, ParsedRoom } from './listingInput';

export interface InsertListingOptions {
  /** The account the listing belongs to (its page, its enquiries, its payouts). */
  ownerId: string;
  /** Who actually performed the write — the owner, or an admin on their behalf. */
  actorId: string;
  listing: ParsedListingPayload;
  /** True when the team set this page up for the owner. */
  adminManaged: boolean;
}

/**
 * Rows per multi-row INSERT. Each room binds 6 values and D1 allows at most 100
 * bound parameters per statement, so 16 rows (96 placeholders) is the largest
 * safe chunk.
 */
const ROOM_INSERT_ROWS = 16;

/**
 * Write a listing's rooms in as few statements as possible.
 *
 * Owners enter PGs of 150–250 beds, so a one-statement-per-room loop means
 * hundreds of D1 round trips inside a single Worker request. Batching keeps a
 * 200-room save to ~13 queries instead of 200.
 */
export const insertListingRooms = async (
  db: D1Database,
  listingId: string,
  rooms: ParsedRoom[]
): Promise<void> => {
  for (let i = 0; i < rooms.length; i += ROOM_INSERT_ROWS) {
    const chunk = rooms.slice(i, i + ROOM_INSERT_ROWS);
    const values = chunk.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
    const binds = chunk.flatMap((room) => [
      listingId,
      room.roomType,
      room.occupancy,
      room.rent,
      room.deposit,
      room.available,
    ]);
    await db
      .prepare(
        `INSERT INTO listing_rooms (listing_id, room_type, occupancy, rent, deposit, available) VALUES ${values}`
      )
      .bind(...binds)
      .run();
  }
};

/**
 * Insert a listing + its rooms, and claim any photos uploaded beforehand.
 *
 * New pages always start as a private draft: nothing an admin or owner writes
 * goes public until the listing passes review, so a half-filled page can never
 * be discovered by a student.
 */
export const insertListing = async (
  db: D1Database,
  options: InsertListingOptions
): Promise<ListingDto | null> => {
  const { ownerId, actorId, listing, adminManaged } = options;
  const id = crypto.randomUUID();
  const now = nowIso();

  await db
    .prepare(
      `INSERT INTO owner_listings
        (id, owner_id, name, property_type, gender, address, locality, city, latitude, longitude,
         description, rules, curfew, food, amenity_slugs, status, verification_status,
         contact_direct, contact_phone, created_by, admin_managed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      ownerId,
      listing.name,
      listing.propertyType,
      listing.gender,
      listing.address,
      listing.locality,
      listing.city,
      listing.latitude,
      listing.longitude,
      listing.description,
      JSON.stringify(listing.rules),
      listing.curfew,
      JSON.stringify(listing.food),
      JSON.stringify(listing.amenitySlugs),
      'draft',
      'unverified',
      listing.contactDirect ? 1 : 0,
      // The column is NOT NULL DEFAULT '': "no number on this listing" is an
      // empty string (the enquiry code then falls back to the owner's phone),
      // never NULL — binding NULL fails the insert outright.
      listing.contactPhone ?? '',
      actorId,
      adminManaged ? 1 : 0,
      now,
      now
    )
    .run();

  await insertListingRooms(db, id, listing.rooms);

  // Photos uploaded before the page existed: only the uploader's own
  // unattached photos can be claimed, so one actor can never pull another
  // account's files onto a listing.
  for (let i = 0; i < listing.pendingMediaIds.length; i++) {
    await db
      .prepare(
        `UPDATE media
         SET listing_id = ?, sort_order = ?
         WHERE id = ? AND uploaded_by = ? AND listing_id IS NULL AND type = 'photo'`
      )
      .bind(id, i, listing.pendingMediaIds[i], actorId)
      .run();
  }

  const full = await fetchListing(db, id);
  if (!full) return null;
  return listingDto(full.row, full.rooms, full.media, mediaUrl);
};
