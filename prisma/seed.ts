import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  { name: "Cow", description: "3 year old", price: 80000, location: "Kilifi", category: "Livestock", imageUrl: "/images/products/cow.jpg" },
  { name: "Chicken", description: "6 months old", price: 500, location: "Kakamega", category: "Livestock", imageUrl: "/images/products/chicken.jpg" },
  { name: "tractor", description: "Ford Tractor", price: 2600000, location: "Kitale", category: "Equipment", imageUrl: "/images/products/tractor.jpg" },
  { name: "Eggs", description: "A crate of eggs", price: 450, location: "Eldoret", category: "Produce", imageUrl: "/images/products/eggs.jpg" },
  { name: "Milk", description: "fresh milk", price: 150, location: "Eldoret", category: "Produce", imageUrl: "/images/products/milk.jpg" },
  { name: "Fertilizer", description: "DAP Fertilizer", price: 3000, location: "Eldoret", category: "Fertilizer", imageUrl: "/images/products/fertilizer.jpg" },
  { name: "Maize Seed", description: "A packet of maize seed", price: 1500, location: "Eldoret", category: "Seeds", imageUrl: "/images/products/maize-seed.jpg" },
  { name: "Pesticide", description: "Best pest killer", price: 150, location: "Eldoret", category: "Pesticide", imageUrl: "/images/products/pesticide.jpg" },
];

const vets = [
  {
    name: "Dr. John Smith",
    specialization: "Beef Cattle, Dairy Cattle, Poultry",
    location: "Nairobi",
    bio: "License VET12345 - john.smith@example.com - +1234567890",
    imageUrl: "/images/vets/john-smith.jpg",
  },
  {
    name: "Dr. Emily Johnson",
    specialization: "Beef Cattle, Dairy Cattle, Poultry",
    location: "Kiambu",
    bio: "License VET54321 - emily.johnson@example.com - +1987654321",
    imageUrl: "/images/vets/emily-johnson.jpg",
  },
  {
    name: "Dr. Sarah Lee",
    specialization: "Poultry, Dairy Cattle",
    location: "Nakuru",
    bio: "License VET67890 - sarah.lee@example.com - +1122334455",
    imageUrl: "/images/vets/sarah-lee.jpg",
  },
  {
    name: "Dr. Michael Brown",
    specialization: "Beef Cattle, Sheep",
    location: "Eldoret",
    bio: "License VET11223 - michael.brown@example.com - +3344556677",
    imageUrl: "/images/vets/michael-brown.jpg",
  },
  {
    name: "Dr. Maria Garcia",
    specialization: "Exotic Animals, Beef Cattle, Dairy Cattle",
    location: "Mombasa",
    bio: "License VET99807 - maria.garcia@example.com - +5566778899",
    imageUrl: "/images/vets/maria-garcia.jpg",
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  const demo = await prisma.user.upsert({
    where: { email: "demo@farmfolio.app" },
    update: {},
    create: {
      email: "demo@farmfolio.app",
      name: "Demo Farmer",
      passwordHash,
      role: "FARMER",
    },
  });

  await prisma.booking.deleteMany();
  await prisma.product.deleteMany();
  await prisma.veterinarian.deleteMany();

  for (const p of products) {
    await prisma.product.create({ data: { ...p, sellerId: demo.id } });
  }
  for (const v of vets) {
    await prisma.veterinarian.create({ data: v });
  }

  console.log(
    `Seeded ${products.length} products, ${vets.length} vets, demo user demo@farmfolio.app / password123`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
