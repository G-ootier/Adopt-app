export type UserRole = 'adopter' | 'shelter';
export type Species = 'cat' | 'dog';
export type PetGender = 'male' | 'female';
export type PetSize = 'small' | 'medium' | 'large';
export type PetStatus = 'available' | 'adopted' | 'reserved';
export type SwipeDirection = 'left' | 'right';

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Shelter {
  id: string;
  shelter_name: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string;
  website: string | null;
  social_links: { facebook?: string; instagram?: string; twitter?: string } | null;
  is_verified: boolean;
}

export interface Pet {
  id: string;
  shelter_id: string;
  name: string;
  species: Species;
  breed: string | null;
  age_months: number;
  gender: PetGender;
  size: PetSize | null;
  description: string | null;
  photos: string[];
  status: PetStatus;
  created_at: string;
  updated_at: string;
  shelter_name?: string;
  shelter_address?: string;
  shelter_latitude?: number;
  shelter_longitude?: number;
  shelter_is_verified?: boolean;
  shelter_phone?: string | null;
  shelter_email?: string;
  shelter_website?: string | null;
  distance_km?: number;
}

export interface Swipe {
  id: string;
  adopter_id: string;
  pet_id: string;
  direction: SwipeDirection;
  created_at: string;
}

export interface AdopterFilters {
  adopter_id: string;
  species: Species | null;
  sizes: PetSize[] | null;
  age_min: number | null;
  age_max: number | null;
  breeds: string[] | null;
  latitude: number;
  longitude: number;
  radius_km: number;
}
