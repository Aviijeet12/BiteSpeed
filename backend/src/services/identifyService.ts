import { Op } from "sequelize";
import Contact from "../models/Contact";

// ── Response shape expected by the frontend ─────────────────────────────────
interface IdentifyResponse {
  contact: {
    primaryContatctId: number;   // intentional typo – matches the Bitespeed spec
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}

// ── Main service ────────────────────────────────────────────────────────────
export async function identify(
  email: string | null,
  phoneNumber: string | null
): Promise<IdentifyResponse> {

  // 1. Find every existing contact that shares the given email OR phone.
  const whereConditions: any[] = [];
  if (email) whereConditions.push({ email });
  if (phoneNumber) whereConditions.push({ phoneNumber });

  let matchedContacts = await Contact.findAll({
    where: { [Op.or]: whereConditions },
    order: [["createdAt", "ASC"]],
  });

  // ── No match → create a new primary contact ──────────────────────────────
  if (matchedContacts.length === 0) {
    const newContact = await Contact.create({
      email,
      phoneNumber,
      linkPrecedence: "primary",
      linkedId: null,
    });

    return formatResponse(newContact.id);
  }

  // 2. Collect all primary IDs (resolve through linkedId).
  const primaryIds = new Set<number>();
  for (const c of matchedContacts) {
    primaryIds.add(c.linkPrecedence === "primary" ? c.id : c.linkedId!);
  }

  // 3. If multiple primaries are involved, merge: the oldest stays primary,
  //    the others become secondary.
  const primaryContacts = await Contact.findAll({
    where: { id: Array.from(primaryIds) },
    order: [["createdAt", "ASC"]],
  });

  const truePrimary = primaryContacts[0];
  const demotedPrimaries = primaryContacts.slice(1);

  for (const dp of demotedPrimaries) {
    await dp.update({
      linkPrecedence: "secondary",
      linkedId: truePrimary.id,
    });

    // Re-point any secondaries that pointed at the old primary
    await Contact.update(
      { linkedId: truePrimary.id },
      { where: { linkedId: dp.id } }
    );
  }

  // 4. Check if we need to create a new secondary (new information).
  const allLinked = await Contact.findAll({
    where: {
      [Op.or]: [{ id: truePrimary.id }, { linkedId: truePrimary.id }],
    },
  });

  const existingEmails = new Set(allLinked.map((c) => c.email).filter(Boolean));
  const existingPhones = new Set(allLinked.map((c) => c.phoneNumber).filter(Boolean));

  const isNewEmail = email && !existingEmails.has(email);
  const isNewPhone = phoneNumber && !existingPhones.has(phoneNumber);

  if (isNewEmail || isNewPhone) {
    await Contact.create({
      email,
      phoneNumber,
      linkPrecedence: "secondary",
      linkedId: truePrimary.id,
    });
  }

  return formatResponse(truePrimary.id);
}

// ── Build the canonical response for a given primary contact ────────────────
async function formatResponse(primaryId: number): Promise<IdentifyResponse> {
  const allContacts = await Contact.findAll({
    where: {
      [Op.or]: [{ id: primaryId }, { linkedId: primaryId }],
    },
    order: [["createdAt", "ASC"]],
  });

  const emails: string[] = [];
  const phoneNumbers: string[] = [];
  const secondaryContactIds: number[] = [];
  const seenEmails = new Set<string>();
  const seenPhones = new Set<string>();

  for (const c of allContacts) {
    if (c.email && !seenEmails.has(c.email)) {
      seenEmails.add(c.email);
      emails.push(c.email);
    }
    if (c.phoneNumber && !seenPhones.has(c.phoneNumber)) {
      seenPhones.add(c.phoneNumber);
      phoneNumbers.push(c.phoneNumber);
    }
    if (c.linkPrecedence === "secondary") {
      secondaryContactIds.push(c.id);
    }
  }

  return {
    contact: {
      primaryContatctId: primaryId,
      emails,
      phoneNumbers,
      secondaryContactIds,
    },
  };
}
