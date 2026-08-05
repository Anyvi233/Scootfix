import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with Scootfix EV WhatsApp Catalog...");

  // 1. Clean existing database records
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.productCompatibility.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.vehicleModel.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Users & Roles
  const adminPasswordHash = await bcrypt.hash("adminpassword", 10);
  const customerPasswordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: adminPasswordHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log("Admin created:", admin.email);

  const customer = await prisma.user.create({
    data: {
      name: "Anu V.",
      email: "test@example.com",
      password: customerPasswordHash,
      role: "CUSTOMER",
      emailVerified: new Date(),
    },
  });

  console.log("Users seeded successfully.");

  // 3. Seed Brands
  const atherBrand = await prisma.brand.create({
    data: { name: "Ather Genuine", slug: "ather-genuine", description: "Official spares from Ather Energy" },
  });

  const olaBrand = await prisma.brand.create({
    data: { name: "Ola Genuine", slug: "ola-genuine", description: "Official spares from Ola Electric" },
  });

  const tvsBrand = await prisma.brand.create({
    data: { name: "TVS Genuine", slug: "tvs-genuine", description: "Official spares from TVS Motor Company" },
  });

  const michelin = await prisma.brand.create({
    data: { name: "Michelin", slug: "michelin", description: "Premium aftermarket tires" },
  });

  const brembo = await prisma.brand.create({
    data: { name: "Brembo", slug: "brembo", description: "High-performance braking systems" },
  });

  const powercore = await prisma.brand.create({
    data: { name: "PowerCore", slug: "powercore", description: "High-performance battery solutions" },
  });

  const scootfixBrand = await prisma.brand.create({
    data: { name: "Scootfix Genuine", slug: "scootfix-genuine", description: "Official spare parts from Scootfix EV" },
  });

  console.log("Brands seeded.");

  // 4. Seed Categories (Matching WhatsApp Catalog exactly)
  const bearings = await prisma.category.create({
    data: { name: "Bearings", slug: "bearings", description: "EV wheel bearings, steering headset con-sets, and hub components" },
  });

  const drumBrakes = await prisma.category.create({
    data: { name: "Drum brakes", slug: "drum-brakes", description: "Drum brake shoes, drum plates, and hub components" },
  });

  const switches = await prisma.category.create({
    data: { name: "switches", slug: "switches", description: "Horn, speed toggle, and park switches" },
  });

  const keySets = await prisma.category.create({
    data: { name: "key sets", slug: "key-sets", description: "Ignition locks and replacement key sets" },
  });

  const diskBrakes = await prisma.category.create({
    data: { name: "Disk Brakes", slug: "disk-brakes", description: "Front and rear disc brake pads and brake components" },
  });

  const frontRims = await prisma.category.create({
    data: { name: "front Rims", slug: "front-rims", description: "Lightweight front alloy rims for disk or drum setups" },
  });

  const bulbs = await prisma.category.create({
    data: { name: "Bulbs", slug: "bulbs", description: "LED indicator signals and headlight bulbs" },
  });

  const chargers = await prisma.category.create({
    data: { name: "Lithium Iron Chargers", slug: "chargers", description: "Lithium battery chargers with auto-cutoff" },
  });

  console.log("Categories seeded.");

  // 5. Seed Vehicle Models
  const ather450x = await prisma.vehicleModel.create({
    data: {
      name: "450X",
      slug: "ather-450x",
      brandId: atherBrand.id,
      yearStart: 2020,
      yearEnd: 2025,
    },
  });

  const olaS1Pro = await prisma.vehicleModel.create({
    data: {
      name: "S1 Pro",
      slug: "ola-s1-pro",
      brandId: olaBrand.id,
      yearStart: 2021,
      yearEnd: 2025,
    },
  });

  const tvsiQube = await prisma.vehicleModel.create({
    data: {
      name: "iQube",
      slug: "tvs-iqube",
      brandId: tvsBrand.id,
      yearStart: 2022,
      yearEnd: 2025,
    },
  });

  console.log("Vehicle models seeded.");

  // 6. Seed Products
  const productsData = [
    // --- Bearings ---
    {
      name: "Bearing 6201",
      slug: "bearing-6201",
      sku: "BRG-6201",
      description: "High-quality deep groove ball bearing 6201. Offers smooth rotation and durability for EV wheel hubs.",
      price: 180,
      compareAtPrice: 250,
      stock: 45,
      categoryId: bearings.id,
      brandId: scootfixBrand.id,
      isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1618976563759-b6aaee63a2f8?auto=format&fit=crop&q=80&w=600",
      compat: [
        { modelId: ather450x.id, notes: "Fits front/rear wheel hubs" },
        { modelId: olaS1Pro.id, notes: "Fits front/rear wheel hubs" },
        { modelId: tvsiQube.id, notes: "Fits front/rear wheel hubs" }
      ]
    },
    {
      name: "Con-set common (high quality)",
      slug: "con-set-common",
      sku: "CON-SET-COMM",
      description: "High-quality steering cone set (con-set) common for multiple electric scooter models. Ensures precise steering handling and durability.",
      price: 750,
      compareAtPrice: 900,
      stock: 25,
      categoryId: bearings.id,
      brandId: scootfixBrand.id,
      isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600",
      compat: [
        { modelId: ather450x.id, notes: "Fits main steering stem" },
        { modelId: olaS1Pro.id, notes: "Fits main steering stem" },
        { modelId: tvsiQube.id, notes: "Fits main steering stem" }
      ]
    },
    {
      name: "Bearing 6205",
      slug: "bearing-6205",
      sku: "BRG-6205",
      description: "Premium deep groove ball bearing 6205 designed to handle high loads and speeds in EV hub motors and wheels.",
      price: 310,
      compareAtPrice: 350,
      stock: 35,
      categoryId: bearings.id,
      brandId: scootfixBrand.id,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1618976563759-b6aaee63a2f8?auto=format&fit=crop&q=80&w=600",
      compat: [
        { modelId: olaS1Pro.id, notes: "Fits wheel hub assemblies" },
        { modelId: tvsiQube.id, notes: "Fits wheel hub assemblies" }
      ]
    },
    
    // --- Drum Brakes ---
    {
      name: "Brake-shoe (130mm)",
      slug: "brake-shoe-130mm",
      sku: "BRK-SHOE-130",
      description: "Heavy-duty 130mm drum brake shoes offering excellent stopping power, quiet braking, and heat dissipation for EV scooters.",
      price: 380,
      stock: 60,
      categoryId: drumBrakes.id,
      brandId: scootfixBrand.id,
      isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=600",
      compat: [{ modelId: tvsiQube.id, notes: "Fits rear drum brake hub" }]
    },
    {
      name: "Brake-shoe (110mm)",
      slug: "brake-shoe-110mm",
      sku: "BRK-SHOE-110",
      description: "Premium 110mm drum brake shoes designed for quiet operation and reliable braking performance under all weather conditions.",
      price: 350,
      stock: 55,
      categoryId: drumBrakes.id,
      brandId: scootfixBrand.id,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=600",
      compat: [{ modelId: olaS1Pro.id, notes: "Fits rear drum brake assemblies" }]
    },
    {
      name: "Drum plate (110mm)",
      slug: "drum-plate-110mm",
      sku: "DRM-PLT-110",
      description: "High-strength 110mm drum brake plate assembly. Complete hub plate for rear or front drum brake setups.",
      price: 1349,
      stock: 12,
      categoryId: drumBrakes.id,
      brandId: scootfixBrand.id,
      isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=600",
      compat: [{ modelId: olaS1Pro.id, notes: "Complete brake hub replacement" }]
    },

    // --- Switches ---
    {
      name: "Horn switch",
      slug: "horn-switch",
      sku: "SW-HORN",
      description: "Heavy-duty replacement horn button switch for electric scooters. Weatherproof and easy to click.",
      price: 100,
      stock: 80,
      categoryId: switches.id,
      brandId: scootfixBrand.id,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1606770396060-7d1659f1e2ed?auto=format&fit=crop&q=80&w=600",
      compat: [
        { modelId: ather450x.id, notes: "Fits handle control assembly" },
        { modelId: olaS1Pro.id, notes: "Fits handle control assembly" },
        { modelId: tvsiQube.id, notes: "Fits handle control assembly" }
      ]
    },
    {
      name: "123 switch",
      slug: "123-switch",
      sku: "SW-123",
      description: "3-speed toggle switch (1-2-3) to change speed modes on EV scooters. Universal plug-and-play design.",
      price: 119,
      stock: 45,
      categoryId: switches.id,
      brandId: scootfixBrand.id,
      isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1606770396060-7d1659f1e2ed?auto=format&fit=crop&q=80&w=600",
      compat: [
        { modelId: olaS1Pro.id, notes: "Allows speed mode switching" },
        { modelId: tvsiQube.id, notes: "Allows speed mode switching" }
      ]
    },
    {
      name: "P switch",
      slug: "p-switch",
      sku: "SW-P",
      description: "Parking mode toggle switch (P) for electric scooters. Restores parking mode engagement functionality.",
      price: 100,
      stock: 70,
      categoryId: switches.id,
      brandId: scootfixBrand.id,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1606770396060-7d1659f1e2ed?auto=format&fit=crop&q=80&w=600",
      compat: [
        { modelId: ather450x.id, notes: "Parking gear switch" },
        { modelId: olaS1Pro.id, notes: "Parking gear switch" }
      ]
    },

    // --- Key Sets ---
    {
      name: "Key set 27mm",
      slug: "key-set-27mm",
      sku: "KEY-SET-27MM",
      description: "27mm universal ignition lock key set. Includes heavy-duty switch, steering lock, and two matching keys.",
      price: 849,
      stock: 30,
      categoryId: keySets.id,
      brandId: scootfixBrand.id,
      isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=600",
      compat: [
        { modelId: tvsiQube.id, notes: "Universal 27mm slot" }
      ]
    },
    {
      name: "Key set (mini vespa)",
      slug: "key-set-mini-vespa",
      sku: "KEY-SET-MINI-VESPA",
      description: "Premium replacement ignition key lock set designed specifically for Vespa-style mini electric scooters.",
      price: 1299,
      stock: 15,
      categoryId: keySets.id,
      brandId: scootfixBrand.id,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=600",
      compat: [
        { modelId: tvsiQube.id, notes: "Vespa style locks compatibility" }
      ]
    },
    {
      name: "Key set (Aura Flex)",
      slug: "key-set-aura-flex",
      sku: "KEY-SET-AURA-FLEX",
      description: "High-security ignition switch and steering lock key set for Aura Flex series scooters. Ultimate theft protection.",
      price: 1549,
      stock: 10,
      categoryId: keySets.id,
      brandId: scootfixBrand.id,
      isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=600",
      compat: [
        { modelId: olaS1Pro.id, notes: "Fits Aura Flex locking assembly" }
      ]
    },

    // --- Disk Brakes ---
    {
      name: "Ola back brake pad(rear)",
      slug: "ola-back-brake-pad-rear",
      sku: "BRK-PAD-OLA-REAR",
      description: "Genuine Ola rear disc brake pads. High heat tolerance and consistent braking feedback.",
      price: 380,
      compareAtPrice: 450,
      stock: 40,
      categoryId: diskBrakes.id,
      brandId: scootfixBrand.id,
      isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=600",
      compat: [{ modelId: olaS1Pro.id, notes: "Rear disc brake assembly" }]
    },
    {
      name: "Brake pad",
      slug: "brake-pad-generic",
      sku: "BRK-PAD-GENERIC",
      description: "Premium aftermarket disc brake pads. Offers solid braking bite and wear resistance for EV models.",
      price: 280,
      compareAtPrice: 350,
      stock: 90,
      categoryId: diskBrakes.id,
      brandId: scootfixBrand.id,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=600",
      compat: [
        { modelId: ather450x.id, notes: "Fits front/rear calipers" },
        { modelId: olaS1Pro.id, notes: "Fits front/rear calipers" },
        { modelId: tvsiQube.id, notes: "Fits front/rear calipers" }
      ]
    },
    {
      name: "Brake pad front (Ather)",
      slug: "brake-pad-front-ather",
      sku: "BRK-PAD-ATHER-FRONT",
      description: "Official Ather front disc brake pads. High performance ceramic compound for regenerative stop assistance.",
      price: 380,
      compareAtPrice: 450,
      stock: 35,
      categoryId: diskBrakes.id,
      brandId: scootfixBrand.id,
      isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=600",
      compat: [{ modelId: ather450x.id, notes: "Front disc brake calipers" }]
    },

    // --- front Rims ---
    {
      name: "Front rim disk 12inch",
      slug: "front-rim-disk-12inch",
      sku: "RIM-DISK-12INCH",
      description: "12-inch front alloy rim designed for disc brake setups. Stylish split-spoke design with high weight capacity.",
      price: 3499,
      stock: 8,
      categoryId: frontRims.id,
      brandId: scootfixBrand.id,
      isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1580274455050-711e54f76269?auto=format&fit=crop&q=80&w=600",
      compat: [
        { modelId: ather450x.id, notes: "Fits 12 inch disc axle" },
        { modelId: olaS1Pro.id, notes: "Fits 12 inch disc axle" }
      ]
    },
    {
      name: "Front rim drum 12inch",
      slug: "front-rim-drum-12inch",
      sku: "RIM-DRUM-12INCH",
      description: "12-inch front alloy rim for drum brake hub assemblies. High structural strength and corrosion-resistant coating.",
      price: 3499,
      stock: 6,
      categoryId: frontRims.id,
      brandId: scootfixBrand.id,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1580274455050-711e54f76269?auto=format&fit=crop&q=80&w=600",
      compat: [
        { modelId: tvsiQube.id, notes: "Fits 12 inch drum hub setups" }
      ]
    },
    {
      name: "Front rim disk 10inch",
      slug: "front-rim-disk-10inch",
      sku: "RIM-DISK-10INCH",
      description: "10-inch front alloy rim for disc brake scooters. Precision-engineered lightweight construction.",
      price: 3199,
      stock: 10,
      categoryId: frontRims.id,
      brandId: scootfixBrand.id,
      isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1580274455050-711e54f76269?auto=format&fit=crop&q=80&w=600",
      compat: [
        { modelId: ather450x.id, notes: "Fits 10 inch disc setups" }
      ]
    },

    // --- Bulbs ---
    {
      name: "Headlight bulb torch type",
      slug: "headlight-bulb-torch-type",
      sku: "BLB-HD-TORCH",
      description: "Super-bright torch-type LED headlight bulb. Projects a focused high-beam pattern with low power consumption.",
      price: 420,
      stock: 120,
      categoryId: bulbs.id,
      brandId: scootfixBrand.id,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600",
      compat: [
        { modelId: ather450x.id, notes: "Universal LED socket" },
        { modelId: olaS1Pro.id, notes: "Universal LED socket" },
        { modelId: tvsiQube.id, notes: "Universal LED socket" }
      ]
    },
    {
      name: "Headlight bulb 3side",
      slug: "headlight-bulb-3side",
      sku: "BLB-HD-3SIDE",
      description: "3-sided LED headlight bulb. Delivers 360-degree road illumination with clear cut-off line.",
      price: 360,
      stock: 100,
      categoryId: bulbs.id,
      brandId: scootfixBrand.id,
      isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600",
      compat: [
        { modelId: ather450x.id, notes: "3-side high beam visibility" },
        { modelId: tvsiQube.id, notes: "3-side high beam visibility" }
      ]
    },
    {
      name: "Indicator bulb LED",
      slug: "indicator-bulb-led",
      sku: "BLB-IND-LED",
      description: "Ultra-durable amber LED indicator signal bulb. Quick flashing response time and high visibility.",
      price: 180,
      stock: 200,
      categoryId: bulbs.id,
      brandId: scootfixBrand.id,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600",
      compat: [
        { modelId: ather450x.id, notes: "Fits indicator housings" },
        { modelId: olaS1Pro.id, notes: "Fits indicator housings" },
        { modelId: tvsiQube.id, notes: "Fits indicator housings" }
      ]
    },

    // --- Lithium Iron Chargers ---
    {
      name: "Charger 84v 10A(LI)",
      slug: "charger-84v-10a-li",
      sku: "CHG-84V-10A-LI",
      description: "Heavy-duty 84V 10A Lithium Ion charger. Features 3-pin connector and auto-cutoff logic. Includes 1-year warranty.",
      price: 5600,
      stock: 15,
      categoryId: chargers.id,
      brandId: scootfixBrand.id,
      isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=600",
      compat: [{ modelId: olaS1Pro.id, notes: "Fits 84V lithium battery systems" }]
    },
    {
      name: "Charger 84v 6A(LI)",
      slug: "charger-84v-6a-li",
      sku: "CHG-84V-6A-LI",
      description: "Medium-duty 84V 6A Lithium Ion battery charger. Supports safe charging cycles. Includes 1-year warranty.",
      price: 5200,
      stock: 20,
      categoryId: chargers.id,
      brandId: scootfixBrand.id,
      isFeatured: false,
      imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=600",
      compat: [{ modelId: olaS1Pro.id, notes: "Fits 84V lithium battery systems" }]
    },
    {
      name: "Charger 67v 10A(LI)",
      slug: "charger-67v-10a-li",
      sku: "CHG-67V-10A-LI",
      description: "High-quality 67V 10A Lithium Ion fast charger with 3-pin plug. Overvoltage protection. Includes 1-year warranty.",
      price: 5300,
      stock: 18,
      categoryId: chargers.id,
      brandId: scootfixBrand.id,
      isFeatured: true,
      imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=600",
      compat: [{ modelId: tvsiQube.id, notes: "Fits 67V lithium battery setups" }]
    }
  ];

  for (const p of productsData) {
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice || null,
        stock: p.stock,
        categoryId: p.categoryId,
        brandId: p.brandId,
        isFeatured: p.isFeatured,
        images: {
          create: [{ url: p.imageUrl, alt: p.name }]
        },
        compatibilities: {
          create: p.compat.map(c => ({
            vehicleModelId: c.modelId,
            notes: c.notes
          }))
        }
      }
    });
  }

  console.log("Products seeded successfully.");
  console.log("Seeding process completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
