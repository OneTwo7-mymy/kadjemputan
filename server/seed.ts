import { storage } from "./storage";

export async function seedDatabase() {
  const existingGuests = await storage.getGuests();
  if (existingGuests.length > 0) {
    return;
  }

  const mockGuests = [
    { name: "Ahmad Albab", phoneNumber: "012-3456789", attendance: "attending", totalPax: 2, wishes: "Selamat Pengantin Baru! Eh silap, selamat akikah!" },
    { name: "Siti Nurhaliza", phoneNumber: "013-4567890", attendance: "attending", totalPax: 4, wishes: "Semoga membesar dengan sihat." },
    { name: "Upin & Ipin", phoneNumber: "014-5678901", attendance: "attending", totalPax: 2, wishes: "Betul betul betul!" },
    { name: "Mat Kilau", phoneNumber: "019-8765432", attendance: "maybe", totalPax: 1, wishes: "Pahlawan datang bertandang." },
    { name: "Pak Pandir", phoneNumber: "011-12341234", attendance: "attending", totalPax: 1, wishes: "Makan makan!" },
    { name: "Makcik Kiah", phoneNumber: "017-3334444", attendance: "attending", totalPax: 5, wishes: "Ada rendang tak?" },
    { name: "Hantu Kak Limah", phoneNumber: "018-9998888", attendance: "not_attending", totalPax: 0, wishes: "Maaf tak dapat datang." },
    { name: "BoBoiBoy", phoneNumber: "010-5556666", attendance: "attending", totalPax: 3, wishes: "Terbaik!" },
    { name: "Puteri Gunung Ledang", phoneNumber: "012-1112222", attendance: "attending", totalPax: 1, wishes: "Hantaran 7 dulang nyamuk." },
    { name: "Hang Tuah", phoneNumber: "013-7778888", attendance: "attending", totalPax: 1, wishes: "Takkan Melayu Hilang Di Dunia." }
  ] as const;

  console.log("Seeding database with mock guests...");
  for (const guest of mockGuests) {
    await storage.createGuest(guest);
  }
  console.log("Database seeded!");
}
