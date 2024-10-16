import { Role } from "./Role";

export interface UserModel {
  _id: string;
  displayName: string
  email: string | null
  password: string | null
  birthDate: string | null
  otp: string | null
  bio: string | null
  avatarUrl: string
  status: string | null
  secretKey: string | null
  role: Role | null
}