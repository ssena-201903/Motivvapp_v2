import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ImageBackground,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import InputField from "@/components/cards/InputField";

import { useLanguage } from "@/app/LanguageContext";

export default function EmailVerification() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // language context
  const { t } = useLanguage();

  const handleEmailSubmit = async () => {
    try {
      const formattedEmail = email.trim();
      const auth = getAuth();

      if (!formattedEmail) {
        throw new Error("Please enter your email address.");
      }

      // Şifre sıfırlama e-postası gönder
      await sendPasswordResetEmail(auth, formattedEmail);

      setSuccess(
        "Password reset email sent! Please check your inbox (or spam folder)."
      );
      setError(""); // Hata mesajını temizle
      router.push("/(auth)/login");
    } catch (error: any) {
      setSuccess(""); // Başarı mesajını temizle
      setError(error.message || "Failed to send reset email.");
    }
  };

  const backgroundImage = require("@/assets/images/habitCardBg.png")

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{t("emailVerification.title")}</Text>
          <Text style={styles.subtitle}>
            {t("emailVerification.subTitle")}
          </Text>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
        {success && <Text style={styles.success}>{success}</Text>}

        <View style={styles.formContainer}>
          <InputField
            label={t("emailVerification.emailLabel")}
            placeholder={t("emailVerification.emailPlaceholder")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            variant="email"
          />
          <View style={styles.formButton}>
            <CustomButton
              label={t("emailVerification.submitButtonText")}
              onPress={handleEmailSubmit}
              variant="fill"
              width="60%"
              height={45}
            />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    display: "flex",
    // backgroundColor: "#F9F9F9",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  headerContainer: {
    marginTop: 100,
    marginBottom: 40,
    alignItems: "center",
    width: 370,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1E3A5F",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#1E3A5F",
    opacity: 0.8,
    textAlign: "center",
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    width: 370,
    marginBottom: 20,
  },
  formButton: {
    width: "100%",
    marginTop: 40,
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  success: {
    color: "green",
    marginBottom: 10,
    textAlign: "center",
  },
});
