import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { Platform } from "react-native";

// ─── API base URL ─────────────────────────────────────
const API_BASE = __DEV__ ? "http://10.41.146.141:5000" : "https://your-production-api.com"; // TODO: set production URL

// ─── Types ────────────────────────────────────────────
type User = {
  student_id: string;
  username: string;
  is_staff: boolean;
};

type AuthState = {
  isLoading: boolean;
  isSignedIn: boolean;
  user: User | null;
  token: string | null;
};

type AuthAction =
  | { type: "RESTORE_TOKEN"; token: string | null; user: User | null }
  | { type: "SIGN_IN"; token: string; user: User }
  | { type: "SIGN_OUT" };

type AuthContextValue = AuthState & {
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, studentId: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// ─── Storage helpers (web-safe) ───────────────────────
async function setSecure(key: string, value: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getSecure(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteSecure(key: string) {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

// ─── Reducer ──────────────────────────────────────────
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "RESTORE_TOKEN":
      return {
        ...state,
        isLoading: false,
        isSignedIn: action.token != null,
        token: action.token,
        user: action.user,
      };
    case "SIGN_IN":
      return {
        ...state,
        isLoading: false,
        isSignedIn: true,
        token: action.token,
        user: action.user,
      };
    case "SIGN_OUT":
      return {
        ...state,
        isSignedIn: false,
        token: null,
        user: null,
      };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    isLoading: true,
    isSignedIn: false,
    user: null,
    token: null,
  });

  // Restore saved session on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await getSecure("auth_token");
        const userJson = await getSecure("auth_user");
        const user = userJson ? (JSON.parse(userJson) as User) : null;
        dispatch({ type: "RESTORE_TOKEN", token, user });
      } catch {
        dispatch({ type: "RESTORE_TOKEN", token: null, user: null });
      }
    })();
  }, []);

  const actions = useMemo(
    () => ({
      signIn: async (username: string, password: string) => {
        if (!username || !password) {
          throw new Error("Username and password are required");
        }

        const res = await fetch(`${API_BASE}/account/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Login failed");
        }

        const user: User = data.user;
        const token: string = data.token;

        await setSecure("auth_token", token);
        await setSecure("auth_user", JSON.stringify(user));

        dispatch({ type: "SIGN_IN", token, user });
      },

      signUp: async (username: string, studentId: string, password: string) => {
        if (!username || !studentId || !password) {
          throw new Error("All fields are required");
        }

        const res = await fetch(`${API_BASE}/account/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            password,
            student_id: studentId,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Registration failed");
        }

        const token: string = data.token;
        const user: User = {
          student_id: studentId,
          username,
          is_staff: false,
        };

        await setSecure("auth_token", token);
        await setSecure("auth_user", JSON.stringify(user));

        dispatch({ type: "SIGN_IN", token, user });
      },

      signOut: async () => {
        await deleteSecure("auth_token");
        await deleteSecure("auth_user");
        dispatch({ type: "SIGN_OUT" });
      },
    }),
    [],
  );

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
