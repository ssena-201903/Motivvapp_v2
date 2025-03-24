import React, { useEffect, useState } from "react";
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
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase.config";
import CustomButton from "@/components/CustomButton";
import { CustomText } from "@/CustomText";
import InputField from "@/components/cards/InputField";
import { useLanguage } from "../LanguageContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from 'expo-haptics';
import { showMessage } from "react-native-flash-message";

const { width, height } = Dimensions.get("window");

export default function Register() {
  // States
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [progressValue] = useState(new Animated.Value(0.33));
  
  // Hooks
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  // Validations
  const [nameValid, setNameValid] = useState(false);
  const [nicknameValid, setNicknameValid] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);

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

  // Handle language change
  const handleChangeLanguage = async (lang: string) => {
    setSelectedLanguage(lang);
    await setLanguage(lang);
    await AsyncStorage.setItem("userLanguage", lang);
    
    // Haptic feedback for language change
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Validate inputs
  const validateName = (value: string) => {
    const isValid = value.length >= 2;
    setNameValid(isValid);
    return isValid;
  };

  const validateNickname = (value: string) => {
    const isValid = value.length >= 2;
    setNicknameValid(isValid);
    return isValid;
  };

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);
    setEmailValid(isValid);
    return isValid;
  };

  const validatePassword = (value: string) => {
    const isValid = value.length >= 6;
    setPasswordValid(isValid);
    return isValid;
  };

  const validateConfirmPassword = (value: string) => {
    const isValid = value === password;
    setConfirmPasswordValid(isValid);
    return isValid;
  };

  // Animation for step transitions
  const animateTransition = (nextStep: number) => {
    setIsAnimating(true);
    
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(progressValue, {
        toValue: nextStep * 0.33,
        duration: 300,
        useNativeDriver: false
      })
    ]).start(() => {
      setCurrentStep(nextStep);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start(() => {
        setIsAnimating(false);
      });
    });
    
    // Haptic feedback for step transition
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Handle next step
  const handleNext = () => {
    if (currentStep === 1) {
      if (!name || !nickname) {
        setError(t("alerts.alertFillTheFields"));
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        return;
      }
      if (!nameValid || !nicknameValid) {
        setError(t("register.invalidFields"));
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        return;
      }
    } else if (currentStep === 2) {
      if (!email) {
        setError(t("register.fillAllFields"));
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        return;
      }
      if (!emailValid) {
        setError(t("alerts.alertInvalidEmail"));
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        return;
      }
    }
    
    setError("");
    if (currentStep < 3 && !isAnimating) {
      const nextStep = currentStep + 1;
      animateTransition(nextStep);
    }
  };

  // Handle back step
  const handleBack = () => {
    setError("");
    if (currentStep > 1 && !isAnimating) {
      const prevStep = currentStep - 1;
      animateTransition(prevStep);
    }
  };

  // Format name with capitalization
  const capitalizeName = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Register user
  const handleRegister = async () => {
    if (!password || !confirmPassword) {
      setError(t("register.fillAllFields"));
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }
    
    if (!passwordValid) {
      setError(t("register.alertPasswordLength"));
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }
    
    if (password !== confirmPassword) {
      setError(t("alerts.alertPasswordsDoNotMatch"));
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    const formattedName = capitalizeName(name);
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        formattedName,
        email,
        nickname,
        lastSignedIn: new Date().toISOString().split("T")[0],
        language: selectedLanguage || "en",
      });

      const collections = ["goals", "habits", "memories", "todos", "friends"];
      for (const collection of collections) {
        await setDoc(doc(userRef, collection, "placeholder"), {});
      }

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      router.replace("/createHabitCard");
    } catch (error: any) {
      setError(t("register.registrationFailed") + ": " + error.message);
      showMessage({ message: error.message, type: "danger" });
      setLoading(false);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const backgroundImage = require("@/assets/images/habitCardBg.png");

  // Progress indicator
  const renderProgressIndicator = () => {
    return (
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar, 
            { width: progressValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              }) 
            }
          ]} 
        />
        <View style={styles.progressSteps}>
          <View style={[styles.stepCircle, currentStep >= 1 && styles.activeStepCircle]}>
            <Text style={[styles.stepText, currentStep >= 1 && styles.activeStepText]}>1</Text>
          </View>
          <View style={[styles.stepCircle, currentStep >= 2 && styles.activeStepCircle]}>
            <Text style={[styles.stepText, currentStep >= 2 && styles.activeStepText]}>2</Text>
          </View>
          <View style={[styles.stepCircle, currentStep >= 3 && styles.activeStepCircle]}>
            <Text style={[styles.stepText, currentStep >= 3 && styles.activeStepText]}>3</Text>
          </View>
        </View>
      </View>
    );
  };

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
                selectedLanguage === "en" && styles.activeLanguage
              ]}
              onPress={() => handleChangeLanguage("en")}
            >
              <Text style={[
                styles.languageText,
                selectedLanguage === "en" && styles.activeLanguageText
              ]}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.languageButton, 
                selectedLanguage === "tr" && styles.activeLanguage
              ]}
              onPress={() => handleChangeLanguage("tr")}
            >
              <Text style={[
                styles.languageText,
                selectedLanguage === "tr" && styles.activeLanguageText
              ]}>TR</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.container}>
          <View style={styles.formCard}>
            <View style={styles.headerContainer}>
              <CustomText
                style={styles.title}
                type="bold"
              >
                {t("register.title")}
              </CustomText>
              {renderProgressIndicator()}
            </View>

            {error ? (
              <Animated.View 
                style={[styles.errorContainer, { opacity: fadeAnim }]}
              >
                <Text style={styles.error}>{error}</Text>
              </Animated.View>
            ) : null}

            <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
              {currentStep === 1 && (
                <>
                  <View style={styles.formItem}>
                    <InputField
                      label={t("register.name")}
                      placeholder={t("register.namePlaceholder")}
                      value={name}
                      onChangeText={(text) => {
                        setName(text);
                        validateName(text);
                      }}
                      variant="name"
                    />
                  </View>
                  <View style={styles.formItem}>
                    <InputField
                      label={t("register.nickname")}
                      placeholder={t("register.nicknamePlaceholder")}
                      value={nickname}
                      onChangeText={(text) => {
                        setNickname(text);
                        validateNickname(text);
                      }}
                      variant="nickname"
                    />
                  </View>
                </>
              )}

              {currentStep === 2 && (
                <View style={styles.formItem}>
                  <InputField
                    label={t("register.email")}
                    placeholder={t("register.emailPlaceholder")}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      validateEmail(text);
                    }}
                    keyboardType="email-address"
                    variant="email"
                  />
                </View>
              )}

              {currentStep === 3 && (
                <>
                  <View style={styles.formItem}>
                    <InputField
                      label={t("register.password")}
                      placeholder={t("register.passwordPlaceholder")}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        validatePassword(text);
                        if (confirmPassword) {
                          validateConfirmPassword(confirmPassword);
                        }
                      }}
                      secureTextEntry={true}
                      isPasswordField={true}
                      variant="password"
                    />
                  </View>
                  <View style={styles.formItem}>
                    <InputField
                      label={t("register.confirmPassword")}
                      placeholder={t("register.confirmPasswordPlaceholder")}
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        validateConfirmPassword(text);
                      }}
                      secureTextEntry={true}
                      isPasswordField={true}
                      variant="password"
                    />
                  </View>
                </>
              )}
            </Animated.View>

            <View style={styles.buttonContainer}>
              <View style={styles.buttonRow}>
                {currentStep === 1 ? (
                  <CustomButton
                    label={t("register.backToLoginButtonText")}
                    onPress={() => router.push("/login")}
                    variant="cancel"
                    width="48%"
                    height={50}
                  />
                ) : (
                  <CustomButton
                    label={t("register.backButtonText")}
                    onPress={handleBack}
                    variant="cancel"
                    width="48%"
                    height={50}
                  />
                )}
                
                {currentStep < 3 ? (
                  <CustomButton
                    label={t("register.nextButtonText")}
                    onPress={handleNext}
                    variant="fill"
                    width="48%"
                    height={50}
                  />
                ) : (
                  <CustomButton
                    label={
                      loading
                        ? t("register.isCreatingAccount")
                        : t("register.registerButtonText")
                    }
                    onPress={handleRegister}
                    variant="fill"
                    width="48%"
                    height={50}
                  />
                )}
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
  languageText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E3A5F",
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
    marginBottom: 15,
    textAlign: "center",
    color: "#1E3A5F",
  },
  progressContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "#E8EFF5",
    borderRadius: 3,
    marginTop: 10,
    marginBottom: 5,
    position: "relative",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#FF6B6B",
    borderRadius: 3,
    position: "absolute",
    left: 0,
    top: 0,
  },
  progressSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    width: "100%",
    top: -6,
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 2,
    borderColor: "#E8EFF5",
    alignItems: "center",
    justifyContent: "center",
  },
  activeStepCircle: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  stepText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#DBDADA",
  },
  activeStepText: {
    color: "#FFFFFF",
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
    marginBottom: 20,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});