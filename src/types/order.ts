import { Order, OrderItem, Product, ProductImage } from "@prisma/client";

export type OrderItemWithProduct = OrderItem & {
  product?: Product & {
    images: ProductImage[];
  };
};

export type OrderWithRelations = Order & {
  items: OrderItemWithProduct[];
};

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
}

export interface OrderSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}
