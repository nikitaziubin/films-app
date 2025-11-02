export interface Film {
  id: number;
  name: string;
  quality?: string;
  duration?: number; // minutes
  previewPhoto?: string;
  age?: string;
  dateOfPublish?: string; // ISO
  language?: string;
  budget?: number;
  description?: string;
  is_for_series: boolean;
}

export interface Series {
  id: number;
  name: string;
  date_of_publish: Date;
  country_of_production: string;
  production_company: string;
  status: string;
  number_of_episodes: number;
  filmIds: number[];
}

export interface Trailer {
  id: number;
  filmId: number;
  title: string;
  url: string;
  duration?: number; // minutes
  age?: string;
}

export interface Rating {
  id: number;
  filmId: number;
  user: string;
  date?: string;
  rating: number; // 1..5
  reviewTitle?: string;
}

export interface Comment {
  id: number;
  filmId: number;
  user: string;
  date?: string;
  text: string;
  spoiler?: boolean;
  language?: string;
}
