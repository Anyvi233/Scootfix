import { UserRepository } from "@/repositories/user.repository";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

export class UserService {
  static async createUser(data: Prisma.UserCreateInput) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    
    return UserRepository.create(data);
  }

  static async getUserByEmail(email: string) {
    return UserRepository.findByEmail(email);
  }

  static async getUserById(id: string) {
    return UserRepository.findById(id);
  }

  static async updateUser(id: string, data: Prisma.UserUpdateInput) {
    return UserRepository.update(id, data);
  }
}
