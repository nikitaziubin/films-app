export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'LOGGED_IN' | 'ADMIN';
}

export interface Film {
[x: string]: any;
  id: number;
  name: string;
  quality: string;
  duration: string; // Java String, not number
  previewPhoto: string;
  ageLimit: string;
  dateOfPublish: string; // ISO Date string
  budget: number;
  language: string;
  description?: string; // Not in Java file, but usually needed. If missing in Java, backend won't send it.
  series?: Series;
  productionCompany?: ProductionCompany;
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
  films?: Film[];
}
export interface ProductionCompany {
  id: number;
  name: string;
  country: string;
  foundationDate: string;
  contactEmail: string
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
export interface Genre {
  id: number;
  genreName: string;
  description?: string | null;
  popularityScore?: number | null;
}

export interface Payment {
  id: number;
  amount: number;
  paymentMethod: string;
  transactionStatus: string;
  dateOfPublish: string;
  film?: Film;
  user?: User;
}

export interface UserProfile {
  id?: number;
  birthDate: string;
  gender: string;
  country: string;
  city: string;
  address: string;
  zipCode: string;
  region: string;
  user?: { id: number };
}
