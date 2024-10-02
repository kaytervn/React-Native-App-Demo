import { UserModel } from "../user/UserModel";

export type PostModel = {
  _id: string
  createdAt: string
  updatedAt: string
  content: string | null
  imageUrl: string | null
  user: UserModel
  totalReactions: number,
  totalComments: number

}