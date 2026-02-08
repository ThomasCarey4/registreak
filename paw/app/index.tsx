import { useAuth } from "@/context/auth-context";
import { Redirect } from "expo-router";

export default function Index() {
  const { user } = useAuth();

  if (user?.is_staff) {
    return <Redirect href="/lectures" />;
  }

  return <Redirect href="/attend" />;
}
