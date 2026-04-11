// User types
export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Trip/Route types
export interface Route {
  _id: string;
  userId: string;
  origin: Location;
  destination: Location;
  createdAt: Date;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
