import { User } from "../user/User";

export type PostModel = {
  _id: string;
  content: string | null;
  imageUrl: string | null;
  likes: number;
  comments: number;
  user: User;
}