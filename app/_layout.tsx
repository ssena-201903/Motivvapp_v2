import { Stack, useNavigation } from "expo-router";
import { useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase.config";
import React from "react";
import { TouchableOpacity } from "react-native";
import ArrowIcon from "@/components/icons/ArrowIcon";
import { LanguageProvider } from "./LanguageContext"; // 🌍 language provider

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
      <ArrowIcon size={16} color="#1E3A5F" variant="left"/>
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

export default function RootLayout() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Stack>
          {/* (tabs) */}
          <Stack.Screen 
            name="(tabs)"
            options={{ headerShown: false }}
          />
          {/* opening screen */}
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          {/* Auth group */}
          <Stack.Screen
            name="(auth)/login"
            options={{
              headerShown: false,
              presentation: "modal",
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="(auth)/register"
            options={{
              headerShown: false,
              presentation: "modal",
              gestureEnabled: false,
            }}
          />
          {/* onboarding */}
          <Stack.Screen
            name="(auth)/createHabitCard"
            options={{
              headerShown: false,
            }}
          />
          {/* main screens */}
          <Stack.Screen
            name="home"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="notifications"
            options={{
              headerShown: true,
              title: "Notifications",
              headerTintColor: "#1E3A5F",
              headerLeft: () => <CustomBackButton />,
            }}
          />
          <Stack.Screen
            name="profile"
            options={{
              headerShown: true,
              title: "Profile",
              headerTintColor: "#1E3A5F",
              headerLeft: () => <CustomBackButton />,
            }}
          />
          <Stack.Screen
            name="habits"
            options={{
              headerShown: true,
              title: "Habits",
              headerTintColor: "#1E3A5F",
              headerLeft: () => <CustomBackButton />,
            }}
          />
          <Stack.Screen
            name="goals"
            options={{
              headerShown: true,
              title: "Goals",
              headerTintColor: "#1E3A5F",
              headerLeft: () => <CustomBackButton />,
            }}
          />
          <Stack.Screen
            name="emailVerification"
            options={{
              headerShown: true,
              title: "Go Back To Login",
              headerTintColor: "#1E3A5F",
              headerLeft: () => <CustomBackButton />,
            }}
          />
          <Stack.Screen
            name="memories"
            options={{
              headerShown: true,
              title: "Memories",
              headerTintColor: "#1E3A5F",
              headerLeft: () => <CustomBackButton />,
            }}
          />
        </Stack>

        {/* <FlashMessage position="top" /> */}
        <FlashMessage
        position="top"
        floating={true} // Mesajın diğer bileşenlerin üstünde görünmesini sağlar
        style={{
          zIndex: 9999,
          elevation: 10, 
          borderRadius: 8,
          marginHorizontal: 20, 
        }}
      />
      </LanguageProvider>
    </AuthProvider>
  );
}

// Export AuthContext for use in other components
export const useAuth = () => React.useContext(AuthContext);
