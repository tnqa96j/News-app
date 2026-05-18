import type { ListData } from "@/types/api";
import type { INews } from "@/types/news";
export interface IUser {
  _id: string;
  email?: string;
  phone?: string;
  googleId?: string;
  name: string;
  pic: string;
  createdAt: string;
  updateAt: string;
}

export interface FavoritesListData extends ListData {
  favoriteList: Omit<
    INews,
    "externalId" | "author" | "url" | "createdAt" | "body"
  >[];
}

/* Subscription */
export interface SubscriptionItem {
  subscriptionId: string;
  sourceId: string;
  sourceName: string;
}

export interface SubscriptionListData extends ListData {
  subList: SubscriptionItem[];
}
