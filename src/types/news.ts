import type { ListData, GetPaginationParams } from "@/types/api";

export interface INews {
  _id: string;
  externalId: string;
  source: {
    id: string | null;
    name: string;
  };
  title: string;
  author: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
  createdAt: string;
  body: string;
  category: string;
}

export interface NewsListData extends ListData {
  stories: INews[];
  topStories: INews[];
}

export interface GetNewsParams extends GetPaginationParams {
  category?: string;
  q?: string;
  sourceId?: string;
  publishedAfter?: string;
  publishedBefore?: string;
}


