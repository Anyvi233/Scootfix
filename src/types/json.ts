/**
 * @file src/types/json.ts
 * @description Strong TypeScript interfaces for Prisma Json fields.
 * Ensures data shape validity when reading from database JSON/JSONB columns.
 */

export interface AddressJson {
  name?: string;       // Used occasionally for fallback
  firstName?: string;
  lastName?: string;
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  zip?: string;        // Fallback for older formats
  phone?: string;
}

export interface ProductSpecificationJson {
  weight?: string;
  dimensions?: string;
  material?: string;
  warranty?: string;
  [key: string]: any; // Allow extensibility for dynamic specs
}
