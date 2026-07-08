import { Product, ProductImage, Category, Brand, Review, ProductCompatibility, VehicleModel } from "@prisma/client";

export type ProductWithRelations = Product & {
  images: ProductImage[];
  category: Category;
  brand: Brand;
  reviews?: Review[];
  compatibilities?: (ProductCompatibility & {
    vehicleModel: VehicleModel;
  })[];
  _count?: {
    reviews: number;
  };
  rating?: number; // Calculated average rating
};

export interface ProductFilters {
  categoryId?: string;
  categorySlug?: string;
  categories?: string[];
  brandId?: string;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isFeatured?: boolean;
  vehicleModelId?: string;
  vehicleBrands?: string[];
  year?: number;
  rating?: number;
  oem?: boolean;
  aftermarket?: boolean;
  inStock?: boolean;
  discount?: boolean;
}

export type ProductSortOption = "newest" | "price_asc" | "price_desc" | "rating_desc";
