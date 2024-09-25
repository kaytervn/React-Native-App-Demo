import { Role } from "./Role";

export interface User {
  _id: string;
  displayName: string;
  email: string;
  password: string;
  birthDate: string;
  otp: string;
  bio: string;
  avatarUrl: string;
  status: string;
  secretKey: string;
  role: Role;
}