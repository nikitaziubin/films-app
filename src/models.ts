export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'LOGGED_IN' | 'ADMIN';
}

export interface Film {
  id: number;
  name: string;
  quality: string;
  duration: string; // Java String, not number
  previewPhoto: string;
  ageLimit: string;
  dateOfPublish: string; // ISO Date string
  budget: string;
  language: string;
  description?: string; // Not in Java file, but usually needed. If missing in Java, backend won't send it.
  series?: Series; // If null, it's a standalone film
  filmsRatings?: Rating[];
  filmsComments?: Comment[];
  trailers?: Trailer[];
}

export interface Series {
  id: number;
  name: string;
  ageLimit: string;
  dateOfPublish: string;
  countryOfProduction: string;
  productionCompanyName: string;
  status: string;
  numberOfEpisodes: number;
  films?: Film[]; // The episodes
}

export interface Trailer {
  id: number;
  trailerUrl: string;
  ageLimit: string;
  duration: string;
  title: string;
  film?: Film; // Helper for frontend mapping if needed
}

export interface Rating {
  id: number;
  dateOfPublish: string;
  rating: number;
  film?: Film; // Derived from relationship
  user?: User;
}

export interface Comment {
  id: number;
  textOfComment: string; // Matches Java
  dateOfPublish: string;
  spoiler: boolean;
  language: string;
  film?: Film;
  user?: User;
}

// Authentication Responses
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
