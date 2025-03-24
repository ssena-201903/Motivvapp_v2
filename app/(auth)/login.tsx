import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
  Image,
  ImageBackground,
  Keyboard,
} from "react-native";
import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase.config";
import { useRouter } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { CustomText } from "@/CustomText";
import InputField from "@/components/cards/InputField";
import { useLanguage } from "../LanguageContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

export default function Login() {
  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Hooks
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  // Handle keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setIsKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setIsKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Handle change language
  const handleChangeLanguage = async (lang: string) => {
    setSelectedLanguage(lang);
    await setLanguage(lang);
    await AsyncStorage.setItem("userLanguage", lang);

    // Haptic feedback for language change
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t("alerts.alertFillTheFields"));
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.replace("/home");
    } catch (error) {
      setError(t("login.invalidCredentials"));
      setLoading(false);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const handleForgotPassword = () => {
    router.push("/emailVerification");
  };

  const backgroundImage = require("@/assets/images/habitCardBg.png");

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Logo */}
        <View style={styles.brandContainer}>
          <Image
            source={require("@/assets/images/brandName2.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          {/* <CustomText style={styles.logoText}>from Lotustech</CustomText> */}
        </View>

        {/* Language Selector */}
        <View style={styles.languageContainer}>
          <View style={styles.languageToggle}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                selectedLanguage === "en" && styles.activeLanguage,
              ]}
              onPress={() => handleChangeLanguage("en")}
            >
              <CustomText
                fontSize={14}
                type="semibold"
                color="#1E3A5F"
                style={[selectedLanguage === "en" && styles.activeLanguageText]}
              >
                EN
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                selectedLanguage === "tr" && styles.activeLanguage,
              ]}
              onPress={() => handleChangeLanguage("tr")}
            >
              <CustomText
                fontSize={14}
                type="semibold"
                color="#1E3A5F"
                style={[selectedLanguage === "tr" && styles.activeLanguageText]}
              >
                TR
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.container}>
          <View style={styles.formCard}>
            <View style={styles.headerContainer}>
              <CustomText style={styles.title} type="bold">
                {t("login.title")}
              </CustomText>
              <CustomText style={styles.subtitle} type="medium">
                {t("login.subTitle")}
              </CustomText>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.formContainer}>
              <View style={styles.formItem}>
                <InputField
                  label={t("login.email")}
                  placeholder={t("login.emailPlaceholder")}
                  value={email}
                  onChangeText={setEmail}
                  secureTextEntry={false}
                  keyboardType="email-address"
                  variant="email"
                />
              </View>

              <View style={styles.formItem}>
                <InputField
                  label={t("login.password")}
                  placeholder={t("login.passwordPlaceholder")}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                  isPasswordField={true}
                  variant="password"
                />
              </View>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
              >
                <CustomText type="regular" color="#1E3A5F" fontSize={12}>
                  {t("login.forgotPassword")}
                </CustomText>
              </TouchableOpacity>

              <View style={styles.buttonContainer}>
                <CustomButton
                  label={t("login.loginButtonText")}
                  onPress={handleLogin}
                  variant="fill"
                  width="100%"
                  height={50}
                />
                <TouchableOpacity
                  style={styles.registerLink}
                  onPress={() => router.push("/register")}
                >
                  <CustomText type="regular" color="#1E3A5F" fontSize={14}>
                    {t("login.dontHaveAccount")}{" "}
                    <CustomText type="bold" color="#1E3A5F" fontSize={14}>
                      {t("login.registerLinkText")}
                    </CustomText>
                  </CustomText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === "web" ? 0 : 40,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  brandContainer: {
    position: "absolute",
    top: 30,
    left: 30,
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 60,
  },
  logoText: {
    fontSize: 12,
    color: "#1E3A5F",
    opacity: 0.8,
    fontWeight: "400",
    marginTop: -15,
  },
  languageContainer: {
    position: "absolute",
    top: 30,
    right: 30,
    zIndex: 10,
  },
  languageToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    overflow: "hidden",
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeLanguage: {
    backgroundColor: "#1E3A5F",
  },
  activeLanguageText: {
    color: "#FFFFFF",
  },
  container: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    justifyContent: "center",
  },
  formCard: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  headerContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: Platform.OS === "web" ? 28 : width * 0.07,
    marginBottom: 10,
    textAlign: "center",
    color: "#1E3A5F",
  },
  subtitle: {
    fontSize: Platform.OS === "web" ? 14 : width * 0.035,
    color: "#1E3A5F",
    opacity: 0.8,
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    width: "100%",
  },
  error: {
    color: "red",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  formItem: {
    width: "100%",
    marginBottom: 10,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 40,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    // marginTop: 5,
  },
  registerLink: {
    marginTop: 20,
    alignItems: "center",
  },
});
