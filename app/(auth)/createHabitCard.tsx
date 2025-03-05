import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
  Platform,
  Pressable,
} from "react-native";
import CustomButton from "@/components/CustomButton";
import AddWaterHabitModal from "@/components/modals/AddWaterHabitModal";
import AddOtherHabitModal from "@/components/modals/AddOtherHabitModal";
import { CustomText } from "@/CustomText";
import { auth, db } from "@/firebase.config";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { router } from "expo-router";
import PlusIcon from "@/components/icons/PlusIcon";
import CheckIcon from "@/components/icons/CheckIcon";

import { useLanguage } from "@/app/LanguageContext";

const { width } = Dimensions.get("window");

export default function CreateHabitCard() {
  const [isWaterModalOpen, setIsWaterModalOpen] = useState<boolean>(false);
  const [isOtherModalOpen, setIsOtherModalOpen] = useState<boolean>(false);
  const [variant, setVariant] = useState<string>("");
  const [existingHabits, setExistingHabits] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace("/login"); // Eğer kullanıcı oturum açmamışsa, login sayfasına yönlendir
      }
    });
  
    return () => unsubscribe();
  }, []);

  // language context
  const { t, language, setLanguage } = useLanguage();

  const [userName, setUserName] = useState<string>("");
  const handleWaterHabitModalPress = () => {
    console.log("Habit Modal Pressed");
    setIsWaterModalOpen(true);
  };

  const handleBookModalPress = () => {
    setVariant("Book");
    setIsOtherModalOpen(true);
  };

  const handleSportModalPress = () => {
    setVariant("Sport");
    setIsOtherModalOpen(true);
  };

  const handleVocabularyModalPress = () => {
    setVariant("Vocabulary");
    setIsOtherModalOpen(true);
  };

  const handleCustomModalPress = () => {
    setVariant("Custom");
    setIsOtherModalOpen(true);
  };

  const getUserInfos = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.log("user did not login");
        return;
      }

      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.formattedName);
        return userData.name;
      } else {
        console.log("User document does not exist");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchExistingHabits = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const habitsRef = collection(db, "users", userId, "habits");
      const querySnapshot = await getDocs(habitsRef);

      const HabitVariants = querySnapshot.docs.map((doc) => doc.data().variant);
      setExistingHabits(HabitVariants);
    } catch (error) {}
  };

  useEffect(() => {
    getUserInfos();
    fetchExistingHabits();

    const interval = setInterval(fetchExistingHabits, 1000);
    return () => clearInterval(interval);
  }, []);

  const isHabitExits = (habitType: string) => {
    return existingHabits.includes(habitType);
  };

  const backgroundImage = require("@/assets/images/habitCardBg.png");

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.top}>
            <View style={styles.welcomeContainer}>
              <CustomText style={styles.welcomeText} type="medium">
                {t("welcomePage.title")}
              </CustomText>
              <CustomText style={styles.userName}>{userName}</CustomText>
            </View>
            <CustomText style={styles.title} type="bold">
              {t("welcomePage.subTitle")}
            </CustomText>
            <CustomText style={styles.subtitle}>
              {t("welcomePage.subTitleDescription")}
            </CustomText>

            <View style={styles.habits}>
              <Pressable
                style={styles.habitRow}
                disabled={isHabitExits("Water")}
                onPress={handleWaterHabitModalPress}
              >
                <TouchableOpacity
                  style={
                    isHabitExits("Water")
                      ? styles.isExistButton
                      : styles.plusButton
                  }
                  onPress={handleWaterHabitModalPress}
                  disabled={isHabitExits("Water")}
                >
                  {isHabitExits("Water") ? (
                    <CheckIcon size={22} color="#1E3A5F" />
                  ) : (
                    <PlusIcon size={16} color="#fff" />
                  )}
                </TouchableOpacity>
                <CustomText style={styles.habitText}>
                  {t("welcomePage.waterText")}
                </CustomText>
              </Pressable>

              <Pressable
                style={styles.habitRow}
                disabled={isHabitExits("Book")}
                onPress={handleBookModalPress}
              >
                <TouchableOpacity
                  style={
                    isHabitExits("Book")
                      ? styles.isExistButton
                      : styles.plusButton
                  }
                  onPress={handleBookModalPress}
                  disabled={isHabitExits("Book")}
                >
                  {isHabitExits("Book") ? (
                    <CheckIcon size={22} color="#1E3A5F" />
                  ) : (
                    <PlusIcon size={16} color="#fff" />
                  )}
                </TouchableOpacity>
                <CustomText style={styles.habitText}>
                  {t("welcomePage.bookText")}
                </CustomText>
              </Pressable>

              <Pressable
                style={styles.habitRow}
                disabled={isHabitExits("Sport")}
                onPress={handleSportModalPress}
              >
                <TouchableOpacity
                  style={
                    isHabitExits("Sport")
                      ? styles.isExistButton
                      : styles.plusButton
                  }
                  onPress={handleSportModalPress}
                  disabled={isHabitExits("Sport")}
                >
                  {isHabitExits("Sport") ? (
                    <CheckIcon size={22} color="#1E3A5F" />
                  ) : (
                    <PlusIcon size={16} color="#fff" />
                  )}
                </TouchableOpacity>
                <CustomText style={styles.habitText}>
                  {t("welcomePage.sportText")}
                </CustomText>
              </Pressable>

              <Pressable
                style={styles.habitRow}
                disabled={isHabitExits("Vocabulary")}
                onPress={handleVocabularyModalPress}
              >
                <TouchableOpacity
                  style={
                    isHabitExits("Vocabulary")
                      ? styles.isExistButton
                      : styles.plusButton
                  }
                  onPress={handleVocabularyModalPress}
                  disabled={isHabitExits("Vocabulary")}
                >
                  {isHabitExits("Vocabulary") ? (
                    <CheckIcon size={22} color="#1E3A5F" />
                  ) : (
                    <PlusIcon size={16} color="#fff" />
                  )}
                </TouchableOpacity>
                <CustomText style={styles.habitText}>
                  {t("welcomePage.vocabularyText")}
                </CustomText>
              </Pressable>

              <Pressable style={styles.habitRow} onPress={handleCustomModalPress}>
                <TouchableOpacity
                  style={
                    isHabitExits("Custom")
                      ? styles.isExistButton
                      : styles.plusButton
                  }
                  onPress={handleCustomModalPress}
                >
                  {isHabitExits("Custom") ? (
                    <CheckIcon size={22} color="#1E3A5F" />
                  ) : (
                    <PlusIcon size={16} color="#fff" />
                  )}
                </TouchableOpacity>
                <CustomText style={styles.habitText}>
                  {t("welcomePage.customText")}
                </CustomText>
              </Pressable>
            </View>
          </View>
          <CustomText style={styles.noteText}>
            {t("welcomePage.description")}
          </CustomText>
          <View style={styles.buttonContainer}>
            <CustomButton
              label={t("welcomePage.laterButtonText")}
              onPress={() => {
                router.push("/home");
              }}
              variant="cancel"
              width="50%"
              height={50}
            />
            <CustomButton
              label={t("welcomePage.continueButtonText")}
              onPress={() => {
                router.push("/home");
              }}
              variant="fill"
              width="50%"
              height={50}
              marginLeft={10}
            />
          </View>
        </View>

        {isWaterModalOpen && (
          <AddWaterHabitModal
            visible={isWaterModalOpen}
            onClose={() => {
              setIsWaterModalOpen(false);
            }}
          />
        )}
        {isOtherModalOpen && (
          <AddOtherHabitModal
            visible={isOtherModalOpen}
            onClose={() => {
              setIsOtherModalOpen(false);
            }}
            variant={variant}
          />
        )}
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
    justifyContent: Platform.OS === "web" ? "center" : "space-between",
    alignItems: "center",
    position: "relative",
  },
  container: {
    width: "100%",
    height: "100%",
    maxWidth: 480,
    paddingHorizontal: 30,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "space-between",
  },
  top: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 40,
  },
  title: {
    fontSize: Platform.OS === "web" ? 32 : width * 0.08,
    fontWeight: "bold",
    color: "#1E3A5F",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    marginBottom: 30,
    fontSize: Platform.OS === "web" ? 16 : width * 0.04,
    color: "#1E3A5F",
    opacity: 0.8,
    textAlign: "center",
  },
  habits: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    // width: "100%",
    marginBottom: 20,
  },
  plusButton: {
    width: 40,
    height: 40,
    backgroundColor: "#1E3A5F",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  isExistButton: {
    width: 40,
    height: 40,
    backgroundColor: "#FFA38F",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  habitText: {
    fontSize: Platform.OS === "web" ? 18 : width * 0.04,
    fontWeight: "medium",
    color: "#1E3A5F",
  },
  noteText: {
    marginBottom: 30,
    fontSize: 14,
    color: "#1E3A5F",
    width: "60%",
    opacity: 0.6,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
  },
  welcomeContainer: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    color: "#1E3A5F",
    marginRight: 20,
    fontSize: 20,
    fontWeight: 500,
    // marginBottom: 10,
    textAlign: "center",
  },
  userName: {
    color: "#1E3A5F",
    opacity: 0.7,
    fontSize: 16,
    fontWeight: "semibold",
    textAlign: "center",
  },
});
