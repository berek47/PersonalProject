import { User, CreateUserDTO, UpdateUserDTO, UserWithoutPassword } from '../entities/user.entity';

export interface IUserRepository {
  create(data: CreateUserDTO): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(page: number, limit: number): Promise<{ users: UserWithoutPassword[]; total: number }>;
  update(id: string, data: UpdateUserDTO): Promise<User>;
  delete(id: string): Promise<void>;
  updatePassword(id: string, hashedPassword: string): Promise<void>;
}
