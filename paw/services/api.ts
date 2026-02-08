import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure this based on your environment
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.41.146.141:5000";

class APIService {
  private token: string | null = null;

  async setToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem("authToken", token);
  }

  async getToken(): Promise<string | null> {
    if (this.token) return this.token;
    this.token = await AsyncStorage.getItem("authToken");
    return this.token;
  }

  async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem("authToken");
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API Error: ${response.status}`);
    }

    return data;
  }

  // Auth endpoints
  async register(username: string, password: string, studentId: string, isStaff: boolean = false) {
    return this.request<{ message: string; token: string }>("/account/register", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
        student_id: studentId,
        is_staff: isStaff,
      }),
    });
  }

  async login(username: string, password: string) {
    const response = await this.request<{ token: string; message: string; user: any }>("/account/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (response.token) {
      await this.setToken(response.token);
    }
    return response;
  }

  async logout() {
    try {
      // Call server logout first while we still have the token
      await this.request("/account/logout", { method: "POST" });
    } catch {
      // Ignore errors - we're logging out anyway
    } finally {
      await this.clearToken();
    }
  }

  // User endpoints
  async getUserDetails(studentId: string) {
    return this.request(`/user/${studentId}`);
  }

  async getUserStreak(studentId: string) {
    return this.request(`/user/${studentId}/streak`);
  }

  // Attendance endpoints
  async getVerificationCode() {
    return this.request("/code", { method: "GET" });
  }

  async verifyAttendance(code: string) {
    return this.request("/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }
}

export const apiService = new APIService();
