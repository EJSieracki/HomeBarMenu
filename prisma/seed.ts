import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const classicCocktails = [
  { name: "Negroni", glassType: "ROCKS" as const, garnish: "Orange peel", description: "Equal parts gin, sweet vermouth, and Campari." },
  { name: "Old Fashioned", glassType: "ROCKS" as const, garnish: "Orange peel + cherry", description: "Whiskey, sugar, Angostura bitters, and a twist." },
  { name: "Martini", glassType: "MARTINI" as const, garnish: "Olive or lemon twist", description: "Gin (or vodka) and dry vermouth, stirred or shaken." },
  { name: "Daiquiri", glassType: "COUPE" as const, garnish: "Lime wheel", description: "Rum, fresh lime juice, and simple syrup." },
  { name: "Margarita", glassType: "ROCKS" as const, garnish: "Salt rim + lime wheel", description: "Tequila, triple sec, and fresh lime juice." },
  { name: "Whiskey Sour", glassType: "ROCKS" as const, garnish: "Cherry + orange slice", description: "Whiskey, lemon juice, simple syrup, and optional egg white." },
  { name: "Mojito", glassType: "HIGHBALL" as const, garnish: "Mint sprig + lime wheel", description: "Rum, fresh lime, sugar, mint, and soda water." },
  { name: "Moscow Mule", glassType: "MUG" as const, garnish: "Lime wedge + mint", description: "Vodka, ginger beer, and fresh lime juice." },
  { name: "Cosmopolitan", glassType: "MARTINI" as const, garnish: "Lemon twist", description: "Vodka, triple sec, cranberry juice, and fresh lime." },
  { name: "Manhattan", glassType: "COUPE" as const, garnish: "Cherry", description: "Rye whiskey, sweet vermouth, and Angostura bitters." },
  { name: "Aperol Spritz", glassType: "WINE" as const, garnish: "Orange slice", description: "Aperol, Prosecco, and a splash of soda water." },
  { name: "Paloma", glassType: "HIGHBALL" as const, garnish: "Salt rim + grapefruit slice", description: "Tequila, grapefruit juice, lime, and soda." },
  { name: "Mint Julep", glassType: "MUG" as const, garnish: "Mint bouquet", description: "Bourbon, fresh mint, sugar, and crushed ice." },
  { name: "French 75", glassType: "FLUTE" as const, garnish: "Lemon twist", description: "Gin, lemon juice, sugar, and Champagne." },
  { name: "Sidecar", glassType: "COUPE" as const, garnish: "Sugar rim + lemon twist", description: "Cognac, triple sec, and fresh lemon juice." },
  { name: "Dark & Stormy", glassType: "HIGHBALL" as const, garnish: "Lime wedge", description: "Dark rum and ginger beer over ice." },
  { name: "Espresso Martini", glassType: "MARTINI" as const, garnish: "3 coffee beans", description: "Vodka, coffee liqueur, and fresh espresso." },
  { name: "Tom Collins", glassType: "COLLINS" as const, garnish: "Lemon wheel + cherry", description: "Gin, lemon juice, simple syrup, and soda water." },
  { name: "Amaretto Sour", glassType: "ROCKS" as const, garnish: "Cherry + orange slice", description: "Amaretto, lemon juice, and a touch of egg white." },
  { name: "Tequila Sunrise", glassType: "HIGHBALL" as const, garnish: "Orange slice + cherry", description: "Tequila, orange juice, and grenadine." },
  { name: "Bloody Mary", glassType: "HIGHBALL" as const, garnish: "Celery + lemon wedge", description: "Vodka, tomato juice, lemon, Worcestershire, and hot sauce." },
  { name: "Penicillin", glassType: "ROCKS" as const, garnish: "Candied ginger", description: "Blended Scotch, lemon juice, honey-ginger syrup, and Islay float." },
  { name: "Last Word", glassType: "COUPE" as const, garnish: "Maraschino cherry", description: "Equal parts gin, green Chartreuse, maraschino, and fresh lime." },
  { name: "Paper Plane", glassType: "COUPE" as const, description: "Equal parts bourbon, Aperol, Amaro Nonino, and lemon juice." },
  { name: "Gimlet", glassType: "COUPE" as const, garnish: "Lime wheel", description: "Gin and fresh lime juice, sweetened." },
];

const globalIngredients = [
  // Spirits
  { name: "London Dry Gin", category: "SPIRIT" as const },
  { name: "Vodka", category: "SPIRIT" as const },
  { name: "White Rum", category: "SPIRIT" as const },
  { name: "Dark Rum", category: "SPIRIT" as const },
  { name: "Bourbon", category: "SPIRIT" as const },
  { name: "Rye Whiskey", category: "SPIRIT" as const },
  { name: "Blended Scotch", category: "SPIRIT" as const },
  { name: "Tequila Blanco", category: "SPIRIT" as const },
  { name: "Tequila Reposado", category: "SPIRIT" as const },
  { name: "Cognac", category: "SPIRIT" as const },
  { name: "Mezcal", category: "SPIRIT" as const },
  // Liqueurs
  { name: "Campari", category: "SPIRIT" as const },
  { name: "Sweet Vermouth", category: "SPIRIT" as const },
  { name: "Dry Vermouth", category: "SPIRIT" as const },
  { name: "Triple Sec", category: "SPIRIT" as const },
  { name: "Aperol", category: "SPIRIT" as const },
  { name: "Amaretto", category: "SPIRIT" as const },
  { name: "Coffee Liqueur", category: "SPIRIT" as const },
  { name: "Green Chartreuse", category: "SPIRIT" as const },
  { name: "Maraschino Liqueur", category: "SPIRIT" as const },
  // Mixers
  { name: "Fresh Lime Juice", category: "JUICE" as const },
  { name: "Fresh Lemon Juice", category: "JUICE" as const },
  { name: "Orange Juice", category: "JUICE" as const },
  { name: "Grapefruit Juice", category: "JUICE" as const },
  { name: "Cranberry Juice", category: "JUICE" as const },
  { name: "Tomato Juice", category: "JUICE" as const },
  { name: "Pineapple Juice", category: "JUICE" as const },
  { name: "Simple Syrup", category: "SYRUP" as const },
  { name: "Honey Syrup", category: "SYRUP" as const },
  { name: "Ginger Syrup", category: "SYRUP" as const },
  { name: "Grenadine", category: "SYRUP" as const },
  { name: "Soda Water", category: "MIXER" as const },
  { name: "Ginger Beer", category: "MIXER" as const },
  { name: "Prosecco", category: "MIXER" as const },
  { name: "Champagne", category: "MIXER" as const },
  { name: "Tonic Water", category: "MIXER" as const },
  { name: "Coconut Cream", category: "MIXER" as const },
  // Bitters
  { name: "Angostura Bitters", category: "BITTER" as const },
  { name: "Orange Bitters", category: "BITTER" as const },
  { name: "Peychaud's Bitters", category: "BITTER" as const },
  // Garnish
  { name: "Fresh Mint", category: "GARNISH" as const },
  { name: "Lime Wedge", category: "GARNISH" as const },
  { name: "Lemon Twist", category: "GARNISH" as const },
  { name: "Orange Peel", category: "GARNISH" as const },
  { name: "Maraschino Cherry", category: "GARNISH" as const },
  { name: "Olive", category: "GARNISH" as const },
];

async function main() {
  console.log("Seeding classic cocktails…");
  for (const c of classicCocktails) {
    await prisma.classicCocktail.upsert({
      where: { name: c.name },
      update: c,
      create: c,
    });
  }
  console.log(`  Seeded ${classicCocktails.length} classics`);

  console.log("Seeding global ingredients…");
  for (const ing of globalIngredients) {
    const existing = await prisma.ingredient.findFirst({
      where: { name: ing.name, isGlobal: true },
    });
    if (!existing) {
      await prisma.ingredient.create({ data: { ...ing, isGlobal: true } });
    }
  }
  console.log(`  Seeded ${globalIngredients.length} global ingredients`);

  // Admin user (dev only)
  const adminEmail = "admin@homebarmenu.dev";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hashed = await bcrypt.hash("Admin1234!", 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin",
        password: hashed,
        role: "ADMIN",
      },
    });
    console.log("  Created dev admin user: admin@homebarmenu.dev / Admin1234!");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
