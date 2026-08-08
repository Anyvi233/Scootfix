export const APP_NAME = "ScootFix";
export const APP_DESCRIPTION = "Premium EV Spare Parts E-commerce Platform";

export const COMPANY_DETAILS = {
  legalName: "ScootFix Technologies Pvt Ltd",
  brandName: "ScootFix Spares",
  address: "123 Tech Park, HSR Layout, Bengaluru, Karnataka - 560102",
  email: "support@scootfix.in",
  phone: "+91 98765 43210",
};

export const ITEMS_PER_PAGE = 12;
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB

export const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export const RETURN_STATUSES = [
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
] as const;

export const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top Rated", value: "rating_desc" },
];

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
];

export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { label: "Products", href: "/admin/products", icon: "box" },
  { label: "Orders", href: "/admin/orders", icon: "shopping-bag" },
  { label: "Customers", href: "/admin/customers", icon: "users" },
  { label: "Returns", href: "/admin/returns", icon: "corner-down-left" },
];
