export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
  image?: string | null;
}

export interface JWTPayload {
  id: string;
  role: string;
  email?: string;
  name?: string;
}
