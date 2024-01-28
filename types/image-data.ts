export interface StockImageData {
  id: string;
  width: number;
  height: number;
  image_thumbnail: string;
  image_large: string;
  image_download: string;
  image_link: string;
  photographer: string;
  photographer_avatar?: string | undefined;
  photographer_link: string;
  source: string;
}
