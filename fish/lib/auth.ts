// Authentication utilities for JWT token management

export interface User {
  student_id: string;
  username: string;
  is_staff: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  student_id?: string;
  is_staff?: boolean;
}

const TOKEN_KEY = "lucky_cat_token";
const USER_KEY = "lucky_cat_user";

// Get the API URL from environment or default
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
}

// Token storage functions
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

// User storage functions
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeStoredUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getToken();
}

// Create authenticated fetch headers
export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// API functions
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/account/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  // Store token and user
  setToken(data.token);
  setStoredUser(data.user);

  return data;
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/account/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Registration failed");
  }

  // Store token (user info from token payload)
  setToken(data.token);

  // Parse the token to extract user info if not provided
  if (data.user) {
    setStoredUser(data.user);
  }

  return data;
}

export async function logout(): Promise<void> {
  const apiUrl = getApiUrl();
  const token = getToken();

  if (token) {
    try {
      await fetch(`${apiUrl}/account/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
    } catch {
      // Ignore server errors, still clear local storage
    }
  }

  // Clear local storage
  removeToken();
  removeStoredUser();
}

// Authenticated API request helper
export async function authFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const apiUrl = getApiUrl();
  const url = endpoint.startsWith("http") ? endpoint : `${apiUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  // If unauthorized, clear tokens
  if (response.status === 401) {
    removeToken();
    removeStoredUser();
  }

  return response;
}

