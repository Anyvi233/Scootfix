import { PrismaClient } from "@prisma/client";
import { OrderService } from "../src/services/order.service";

const prisma = new PrismaClient();

async function runSimulation() {
  console.log("🚀 Starting E2E Simulation...");
  let user;
  let product;
  let category;
  let brand;
  let coupon;
  
  try {
    // 1. Setup Test Data
    console.log("🛠️ Setting up test data...");
    const existingUser = await prisma.user.findUnique({ where: { email: "e2e_customer@example.com" } });
    if (existingUser) {
      await prisma.couponUsage.deleteMany({ where: { userId: existingUser.id } });
      await prisma.user.delete({ where: { id: existingUser.id } });
    }
    await prisma.product.deleteMany({ where: { slug: "e2e-test-product" } });
    await prisma.coupon.deleteMany({ where: { code: "E2E50" } });

    user = await prisma.user.create({
      data: { name: "E2E Customer", email: "e2e_customer@example.com", role: "CUSTOMER" }
    });

    category = await prisma.category.findFirst() || await prisma.category.create({ data: { name: "Test Cat", slug: "test-cat" } });
    brand = await prisma.brand.findFirst() || await prisma.brand.create({ data: { name: "Test Brand", slug: "test-brand" } });

    product = await prisma.product.create({
      data: {
        name: "E2E Test Controller",
        slug: "e2e-test-product",
        description: "Test description",
        price: 1000,
        sku: "E2E-CTRL-01",
        stock: 10,
        categoryId: category.id,
        brandId: brand.id
      }
    });

    coupon = await prisma.coupon.create({
      data: {
        code: "E2E50",
        discountType: "PERCENT",
        discountValue: 50,
        minOrderAmount: 500,
        isActive: true,
        maxUses: 1
      }
    });

    const validAddress = {
      name: "E2E Customer", phone: "9876543210", email: "e2e_customer@example.com",
      street: "123 Main St", city: "Bengaluru", state: "Karnataka", zipCode: "560102"
    };

    const invalidAddress = { ...validAddress, zipCode: "123", street: "x" };

    // 2. Test Address Integrity
    console.log("🧪 Testing Address Integrity...");
    try {
      await OrderService.createOrder(user.id, invalidAddress, null, "cod", "COD", "Notes");
      throw new Error("❌ Should have failed invalid address");
    } catch (e: any) {
      if (e.message.includes("Invalid ZIP")) console.log("✅ Caught invalid ZIP code");
      else throw e;
    }

    // 3. Test Cart / Reseller Limits
    console.log("🧪 Testing Reseller Limits...");
    await prisma.cartItem.create({
      data: { userId: user.id, productId: product.id, quantity: 6 }
    });
    
    try {
      await OrderService.createOrder(user.id, validAddress, null, "cod", "COD", "Notes");
      throw new Error("❌ Should have blocked reseller quantity");
    } catch (e: any) {
      if (e.message.includes("Quantity limit exceeded")) console.log("✅ Caught reseller limit (Qty > 5)");
      else throw e;
    }

    // Adjust cart to valid amount
    await prisma.cartItem.updateMany({
      where: { userId: user.id },
      data: { quantity: 1 }
    });

    // 4. Test Out of Stock
    console.log("🧪 Testing Out of Stock...");
    await prisma.product.update({ where: { id: product.id }, data: { stock: 0 } });
    try {
      await OrderService.createOrder(user.id, validAddress, null, "cod", "COD", "Notes");
      throw new Error("❌ Should have blocked out of stock");
    } catch (e: any) {
      if (e.message.includes("Insufficient stock")) console.log("✅ Caught Out of Stock");
      else throw e;
    }
    
    // Restore stock
    await prisma.product.update({ where: { id: product.id }, data: { stock: 10 } });

    // 5. Place Successful COD Order with Coupon
    console.log("🧪 Testing Successful Order & Coupon Usage...");
    const order1 = await OrderService.createOrder(user.id, validAddress, null, "cod", "COD", "Notes", "E2E50", "standard");
    console.log(`✅ Order ${order1.orderNumber} placed successfully!`);
    
    // Check coupon constraint
    try {
      await prisma.cartItem.create({ data: { userId: user.id, productId: product.id, quantity: 1 } });
      await OrderService.createOrder(user.id, validAddress, null, "cod", "COD", "Notes", "E2E50", "standard");
      throw new Error("❌ Should have blocked reused coupon");
    } catch (e: any) {
      if (e.message.includes("already been used") || e.message.includes("maximum usage limit")) console.log("✅ Caught Coupon Abuse");
      else throw e;
    }

    // 6. Test Active COD Limit
    console.log("🧪 Testing Active COD Limit...");
    // Put something in cart again
    const cartItem2 = await prisma.cartItem.findFirst({ where: { userId: user.id } });
    if (!cartItem2) await prisma.cartItem.create({ data: { userId: user.id, productId: product.id, quantity: 1 } });
    
    const order2 = await OrderService.createOrder(user.id, validAddress, null, "cod", "COD", "Notes", undefined, "standard");
    console.log(`✅ Order ${order2.orderNumber} placed successfully (Active COD: 2)`);

    await prisma.cartItem.create({ data: { userId: user.id, productId: product.id, quantity: 1 } });
    try {
      await OrderService.createOrder(user.id, validAddress, null, "cod", "COD", "Notes", undefined, "standard");
      throw new Error("❌ Should have blocked 3rd active COD order");
    } catch (e: any) {
      if (e.message.includes("maximum limit of active Cash on Delivery")) console.log("✅ Caught Active COD Limit");
      else throw e;
    }

    // 7. Test Admin Cancellation & Refund (Stock Restore)
    console.log("🧪 Testing Admin Cancellation & Stock Restore...");
    const stockBeforeCancel = (await prisma.product.findUnique({ where: { id: product.id } }))?.stock || 0;
    
    await OrderService.cancelOrder(user.id, order1.id);
    const order1Status = await prisma.order.findUnique({ where: { id: order1.id } });
    if (order1Status?.status === "CANCELLED") console.log("✅ Order cancelled successfully");
    
    const stockAfterCancel = (await prisma.product.findUnique({ where: { id: product.id } }))?.stock || 0;
    if (stockAfterCancel > stockBeforeCancel) console.log("✅ Stock restored successfully after cancellation");

    console.log("🎉 All E2E Tests Passed!");

  } catch (error) {
    console.error("💥 E2E Test Failed:", error);
  } finally {
    // Cleanup
    if (user) {
      await prisma.couponUsage.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    if (product) await prisma.product.delete({ where: { id: product.id } });
    if (coupon) await prisma.coupon.delete({ where: { id: coupon.id } });
    await prisma.$disconnect();
  }
}

runSimulation();
