import { Stack, useNavigation } from "expo-router";
import { useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase.config";
import React from "react";
import { TouchableOpacity } from "react-native";
import ArrowIcon from "@/components/icons/ArrowIcon";
import { LanguageProvider, useLanguage } from "./LanguageContext";
import FlashMessage from "react-native-flash-message";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

const CustomBackButton = () => {
  const Navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => Navigation.goBack()} style={{ marginLeft: 10, marginRight: 10 }}>
      <ArrowIcon size={16} color="#1E3A5F" variant="left" />
    </TouchableOpacity>
  );
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => React.useContext(AuthContext);

// RootLayout’u ayrı bir iç bileşenle saralım
function LayoutContent() {
  const { t } = useLanguage(); // useLanguage burada çağrılıyor

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="(auth)/login" options={{ headerShown: false, presentation: "modal", gestureEnabled: false }} />
      <Stack.Screen name="(auth)/register" options={{ headerShown: false, presentation: "modal", gestureEnabled: false }} />
      <Stack.Screen name="(auth)/createHabitCard" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen
        name="notifications"
        options={{
          headerShown: true,
          title: t("pageTitle.notifications"),
          headerTintColor: "#1E3A5F",
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: true,
          title: t("pageTitle.profile"),
          headerTintColor: "#1E3A5F",
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <Stack.Screen
        name="habits"
        options={{
          headerShown: true,
          title: t("pageTitle.habits"),
          headerTintColor: "#1E3A5F",
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <Stack.Screen
        name="goals"
        options={{
          headerShown: true,
          title: t("pageTitle.goals"),
          headerTintColor: "#1E3A5F",
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <Stack.Screen
        name="emailVerification"
        options={{
          headerShown: true,
          title: t("pageTitle.goBackToLogin"),
          headerTintColor: "#1E3A5F",
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <Stack.Screen
        name="memories"
        options={{
          headerShown: true,
          title: t("pageTitle.memories"),
          headerTintColor: "#1E3A5F",
          headerLeft: () => <CustomBackButton />,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const { user } = useAuth(); // AuthProvider içindeyiz, bu çalışıyor

  return (
    <AuthProvider>
      <LanguageProvider user={user}>
        <LayoutContent /> {/* useLanguage burada çağrılacak */}
        <FlashMessage
          position="top"
          floating={true}
          style={{ zIndex: 9999, elevation: 10, borderRadius: 8, marginHorizontal: 20 }}
        />
      </LanguageProvider>
    </AuthProvider>
  );
}