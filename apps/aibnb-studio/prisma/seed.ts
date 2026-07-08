import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@aibnb.studio" },
    update: {},
    create: {
      authId: "demo-local-user",
      email: "demo@aibnb.studio",
      fullName: "Anfitrión Demo",
    },
  });

  const property = await prisma.property.upsert({
    where: { id: "demo-property-1" },
    update: {},
    create: {
      id: "demo-property-1",
      name: "Loft Cornavin",
      type: "APARTMENT",
      address: "Rue du Léman 12",
      city: "Ginebra",
      country: "Suiza",
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      nightlyPrice: 145,
      currency: "CHF",
      description:
        "Loft luminoso a 5 minutos a pie de la estación de Cornavin, ideal para viajeros de negocios y familias.",
    },
  });

  await prisma.membership.upsert({
    where: { userId_propertyId: { userId: user.id, propertyId: property.id } },
    update: {},
    create: { userId: user.id, propertyId: property.id, role: "OWNER" },
  });

  console.log("Seed completado:", { user: user.email, property: property.name });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
