import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useAuth } from "./_layout";
// language context
import { LanguageProvider, useLanguage } from "./LanguageContext";

export default function Index() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        router.replace("/home");
      } else {
        router.replace("/(auth)/login");
      }
    }, 3000);

    return () => clearTimeout(timer); // Timer'ı temizle
  }, [user, router]);

  return (
    <LanguageProvider>
      <View style={styles.container}>
        {/* PNG Dosyasını Buraya Ekledik */}
        <View style={styles.topSection}>
          <Image
            source={require("@/assets/images/brandName2.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.patternBackground}>
          <LottieView
            source={require("@/assets/animations/clock_animate.json")}
            autoPlay
            loop
            style={styles.animation}
          />
        </View>
      </View>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#white",
    alignItems: "center",
  },
  topSection: {
    padding: 20,
    alignItems: "center",
    marginTop: 120,
  },
  logo: {
    width: 300, // PNG'nin genişliği
    height: 100, // PNG'nin yüksekliği
  },
  patternBackground: {
    alignItems: "center",
    flex: 1,
  },
  animation: {
    width: 300,
    height: 300,
    position: "absolute",
  },
});
