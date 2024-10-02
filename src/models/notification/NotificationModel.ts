import { UserModel } from "../user/UserModel";

export type NotificationModel = {
  _id: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  status: boolean;
  user : UserModel
}