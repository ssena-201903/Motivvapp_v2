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
import LottieView from "lottie-react-native";
// language context
import { useLanguage } from "../LanguageContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import InputPicker from "@/components/cards/InputPicker";

const { width, height } = Dimensions.get("window");

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [emailFocus, setEmailFocus] = useState<boolean>(false);
  const [passwordFocus, setPasswordFocus] = useState<boolean>(false);
  const router = useRouter();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // language context
  const { t, language, setLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  // handle change language
  const handleChangeLanguage = async (lang: string) => {
    setSelectedLanguage(lang);
    await setLanguage(lang); // update context
    await AsyncStorage.setItem("userLanguage", lang); //save to AsyncStorage
  };

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

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/home");
    } catch (error) {
      setError("could not login, invalid email or password");
    }
  };

  const handleForgotPassword = () => {
    router.push("/emailVerification");
  };

  const backgroundImage = require("@/assets/images/habitCardBg.png")

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <CustomText
              style={styles.title}
              type="bold"
              color="#1E3A5F"
              fontSize={24}
            >
              {t("login.title")}
            </CustomText>
            <CustomText style={styles.subtitle} type="medium" color="#1E3A5F">
              {t("login.subTitle")}
            </CustomText>
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.formContainer}>
            <View style={styles.formItem}>
              <InputField
                label={t("login.email")}
                placeholder={t("login.emailPlaceholder")}
                value={email}
                onChangeText={setEmail}
                secureTextEntry={false}
                errorMessage={error}
                inputStyle={{
                  borderColor: emailFocus ? "#1E3A5F" : "#E5EEFF",
                  width: "100%",
                }}
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
                errorMessage={error}
                inputStyle={{
                  borderColor: passwordFocus ? "#1E3A5F" : "#E5EEFF",
                  width: "100%",
                }}
                variant="password"
              />
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <CustomText type="regular" color="#666" fontSize={12}>
                {t("login.forgotPassword")}
              </CustomText>
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <CustomButton
                label={t("login.loginButtonText")}
                onPress={handleLogin}
                variant="fill"
                width="80%"
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

        {!isKeyboardVisible && Platform.OS !== "web" && (
          <View style={styles.dashboardContainer}>
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/brandName2.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <CustomText style={styles.logoText}>from Lotustech</CustomText>
            </View>
            {/* <View style={styles.logoSloganContainer}>
              <CustomText style={styles.logoSlogan}>
                fun way to motivation
              </CustomText>
            </View> */}
          </View>
        )}
        {Platform.OS === "web" && (
          <View style={styles.dashboardContainer}>
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/brandName2.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <CustomText style={styles.logoText}>from Lotustech</CustomText>
            </View>
          </View>
        )}
        <View style={styles.lamguageContainer}>
          <CustomText style={styles.selectLanguageText}>
            {t("login.selectLanguage")}
          </CustomText>
          <InputPicker
            selectedValue={selectedLanguage}
            onValueChange={handleChangeLanguage}
            items={[
              { label: "✅ English", value: "en" },
              { label: "✅ Türkçe", value: "tr" },
            ]}
          />
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
    justifyContent: Platform.OS === "web" ? "center" : "flex-end",
    alignItems: "center",
    // backgroundColor: "#FCFCFC",
    position: "relative",
  },
  dashboardContainer: {
    position: "absolute",
    alignItems: "flex-start",
    top: 10,
    left: Platform.OS === "web" ? 30 : "auto",
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
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
  logoSloganContainer: {
    marginTop: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    width: 200,
  },
  logoSlogan: {
    fontSize: Platform.OS === "web" ? 16 : width * 0.04,
    color: "#1E3A5F",
    // opacity: 0.8,
    fontWeight: "600",
  },
  container: {
    width: "100%",
    maxWidth: 480,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  headerContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: Platform.OS === "web" ? 32 : width * 0.08,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: Platform.OS === "web" ? 16 : width * 0.04,
    opacity: 0.8,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  formItem: {
    width: "100%",
    marginBottom: 20,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  registerLink: {
    marginTop: 20,
    alignItems: "center",
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  patternBackground: {
    alignItems: "center",
    flex: 1,
  },
  animation: {
    width: 50,
    height: 50,
    position: "absolute",
  },
  lamguageContainer: {
    position: "absolute",
    right: 30,
    top: 20,
    width: 130,
  },
  selectLanguageText: {
    fontSize: Platform.OS === "web" ? 14 : width * 0.035,
    color: "#1E3A5F",
    fontWeight: "600",
    marginBottom: 10,
  },
});
