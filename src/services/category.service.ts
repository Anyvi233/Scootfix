import { CategoryRepository } from "@/repositories/category.repository";

export class CategoryService {
  static async getAllCategories() {
    return CategoryRepository.findAllTopLevel();
  }

  static async getCategoryBySlug(slug: string) {
    return CategoryRepository.findBySlug(slug);
  }
}
