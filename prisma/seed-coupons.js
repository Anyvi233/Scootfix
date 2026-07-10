const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedCoupons() {
  const coupons = [
    {
      code: "EVSTART10",
      description: "10% off for new EV riders",
      discountType: "PERCENT",
      discountValue: 10,
      minOrderAmount: 0,
      maxUses: 1000,
      isActive: true,
    },
    {
      code: "SCOOT15",
      description: "15% off sitewide discount",
      discountType: "PERCENT",
      discountValue: 15,
      minOrderAmount: 500,
      maxUses: 500,
      isActive: true,
    },
    {
      code: "FREESHIP",
      description: "Free shipping on any order",
      discountType: "FREESHIP",
      discountValue: 0,
      minOrderAmount: 0,
      maxUses: null,
      isActive: true,
    },
    {
      code: "FLAT200",
      description: "₹200 flat off on orders above ₹2000",
      discountType: "FLAT",
      discountValue: 200,
      minOrderAmount: 2000,
      maxUses: 200,
      isActive: true,
    },
    {
      code: "BIGBUY20",
      description: "20% off on orders above ₹5000",
      discountType: "PERCENT",
      discountValue: 20,
      minOrderAmount: 5000,
      maxUses: 100,
      isActive: true,
    },
  ];

  for (const coupon of coupons) {
    const existing = await prisma.coupon.findUnique({ where: { code: coupon.code } });
    if (existing) {
      console.log(`Coupon ${coupon.code} already exists, skipping.`);
    } else {
      await prisma.coupon.create({ data: coupon });
      console.log(`Created coupon: ${coupon.code}`);
    }
  }

  console.log("Done seeding coupons!");
}

seedCoupons()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
