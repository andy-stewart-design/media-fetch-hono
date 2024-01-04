interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string | null;
    landscape: string | null;
    tiny: string;
  };
  liked: boolean;
  alt: string | null;
}

export interface PexelsAPIResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page: string | null;
  prev_page: string | null;
}

interface PixabayImage {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  previewWidth: number;
  previewHeight: number;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;
  fullHDURL: string;
  imageURL: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}

export interface PixabayAPIResponse {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
}

interface UnsplashUser {
  id: string;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  instagram_username: string | null;
  twitter_username: string | null;
  portfolio_url: string | null;
  profile_image: {
    small: string;
    medium: string;
    large: string;
  };
  links: {
    self: string;
    html: string;
    photos: string;
    likes: string;
  };
}

interface UnsplashImage {
  id: string;
  created_at: string;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  likes: number;
  liked_by_user: boolean;
  description: string | null;
  user: UnsplashUser;
  current_user_collections: unknown[];
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  links: {
    self: string;
    html: string;
    download: string;
  };
}

export interface UnsplashAPIResponse {
  total: number;
  total_pages: number;
  results: UnsplashImage[];
}
