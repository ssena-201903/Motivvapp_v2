import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  Pressable,
  Platform,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import LeafIcon from "@/components/icons/LeafIcon";
import TreeIcon from "@/components/icons/TreeIcon";
import GlassIcon from "@/components/icons/GlassIcon";
import CardFeedback from "@/components/cards/CardFeedback";
import { CustomText } from "@/CustomText";
import BottleIcon from "@/components/icons/BottleIcon";
import CupIcon from "@/components/icons/CupIcon";
import MugIcon from "@/components/icons/MugIcon";

import { useLanguage } from "@/app/LanguageContext";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase.config";
import PlusIcon from "../icons/PlusIcon";
import BoxIcon from "../icons/BoxIcon";

const { width } = Dimensions.get("window");

const cupSizes = [
  {
    size: 200,
    component: (
      <GlassIcon
        width={width > 760 ? 25 : 25}
        height={width > 760 ? 25 : 25}
        variant="empty"
      />
    ),
    name: "Glass",
  },
  {
    size: 250,
    component: (
      <CupIcon
        width={width > 760 ? 25 : 25} // Boyut küçültüldü
        height={width > 760 ? 30 : 25}
        variant="empty"
      />
    ),
    name: "Cup",
  },
  {
    size: 300,
    component: (
      <MugIcon
        width={width > 760 ? 20 : 25} // Boyut küçültüldü
        height={width > 760 ? 20 : 25}
        variant="empty"
      />
    ),
    name: "Mug",
  },
  {
    size: 500,
    component: (
      <BottleIcon
        width={width > 760 ? 40 : 45} // Boyut küçültüldü
        height={width > 760 ? 40 : 45}
        variant="empty"
        litres={500}
        position="vertical"
      />
    ),
    name: "Small Bottle",
  },
  {
    size: 1000,
    component: (
      <BottleIcon
        width={width > 760 ? 40 : 45}
        height={width > 760 ? 40 : 45}
        variant="empty"
        litres={1000}
        position="vertical"
      />
    ),
    name: "Large Bottle",
  },
  {
    size: 1500,
    component: (
      <BottleIcon
        width={width > 760 ? 50 : 55}
        height={width > 760 ? 50 : 55}
        variant="empty"
        litres={1500}
        position="vertical"
      />
    ),
    name: "Extra Large Bottle",
  },
];

type Props = {
  userId: string;
};

export default function CardWaterHabit({ userId }: Props) {
  const [filledGlass, setFilledGlass] = useState<number>(0);
  const [totalWater, setTotalWater] = useState<number>(0);
  const [cupSize, setCupSize] = useState<number>(0);
  const [lastChangeAt, setLastChangeAt] = useState<string>("");
  const [cupType, setCupType] = useState<string>("");
  const [isWaterDone, setIsWaterDone] = useState<boolean>(false);
  const [waterStreak, setWaterStreak] = useState<number>(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState<boolean>(false);

  // language context
  const { t, language, setLanguage } = useLanguage();

  // Fetch water habit data
  const fetchWaterHabitData = async () => {
    const habitsRef = collection(db, "users", userId, "habits");
    const q = query(habitsRef, where("variant", "==", "Water"));

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const waterHabitDoc = querySnapshot.docs[0];
      const habitDoc = waterHabitDoc.data();

      setFilledGlass(habitDoc.filledCup || 0);
      setTotalWater(habitDoc.cupsNeeded);
      setCupSize(habitDoc.cupSize);
      setCupType(habitDoc.cupType);
      setIsWaterDone(habitDoc.isDone);
      setWaterStreak(habitDoc.streakDays);
      setLastChangeAt(habitDoc.lastChangeAt);
    }
  };

  useEffect(() => {
    fetchWaterHabitData();
  }, [userId]);

  // Load water sound
  const loadWaterSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/sounds/water-pouring-quickly-into-glass-103861.mp3")
    );
    setSound(sound);
  };

  const playSound = async () => {
    if (sound) {
      await sound.replayAsync();
    }
  };

  useEffect(() => {
    loadWaterSound();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // get cup names
  const getCupName = () => {
    switch (cupType) {
      case "Cup":
        return t("waterCupName.typeCup");
      case "Mug":
        return t("waterCupName.typeMug");
      case "Glass":
        return t("waterCupName.typeGlass");
      case "Small Bottle":
        return t("waterCupName.typeSmallBottle");
      case "Large Bottle":
        return t("waterCupName.typeLargeBottle");
      case "Extra Large Bottle":
        return t("waterCupName.typeExtraLargeBottle");
      default:
        return t("waterCupName.typeGlass");
    }
  };

  // Handle water press
  const handleWaterPress = async () => {
    if (filledGlass < totalWater) {
      const newFilledGlass = filledGlass + 1;
      setFilledGlass(newFilledGlass);

      playSound();

      let isCompleted = false;
      let newStreakDays = waterStreak;
      let newLastChange = new Date().toISOString().split("T")[0];

      if (newFilledGlass === totalWater) {
        isCompleted = true;
        newStreakDays += 1;
        setWaterStreak(newStreakDays);
        setIsFeedbackVisible(true);
        setIsWaterDone(true);
      }

      try {
        // Find the water habit document
        const habitsRef = collection(db, `users/${userId}/habits`);
        const q = query(habitsRef, where("variant", "==", "Water"));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const habitDoc = querySnapshot.docs[0]; // Get the first document
          const habitDocRef = doc(db, `users/${userId}/habits/${habitDoc.id}`);

          // Update data in Firestore
          await updateDoc(habitDocRef, {
            filledCup: newFilledGlass,
            lastChangeAt: newLastChange,
            ...(isCompleted && {
              isDone: true,
              streakDays: newStreakDays,
            }),
          });

          console.log("Updated water habit data!");
        }
      } catch (error) {
        console.error("Error updating water habit data:", error);
      }
    }
  };

  // Get cup component
  const getCupComponent = (size: number, isFilled: boolean) => {
    const cupItem = cupSizes.find((cup) => cup.size === size);

    if (!cupItem) return <GlassIcon width={25} height={25} variant="empty" />; // Default component

    if (isFilled) {
      return React.cloneElement(cupItem.component, { variant: "full" });
    }
    return cupItem.component;
  };

  // Get feedback props
  const getFeedbackProps = () => {
    if (waterStreak === 14) {
      return {
        text: t("feedbackProps.successWater14"),
      };
    } else if (waterStreak === 21) {
      return {
        text: t("feedbackProps.successWater21"),
      };
    } else if (waterStreak === 40) {
      return {
        text: t("feedbackProps.successWater40"),
      };
    } else {
      return {
        text: t("feedbackProps.successHabit"),
      };
    }
  };

  return (
    <View>
      <View style={[isWaterDone ? styles.doneHabit : styles.container]}>
        {/* Left side: Grid of cups */}
        <View style={styles.cupGrid}>
          {Array.from({ length: totalWater }).map((_, index) => (
            <View key={index} style={styles.cupContainer}>
              {getCupComponent(cupSize, index < filledGlass)}
            </View>
          ))}
        </View>

        {/* Right side: Subtext, streak, and add icon */}
        <View style={styles.rightContainer}>
          <View style={styles.top}>
            <View style={styles.textContainer}>
              <CustomText
                style={styles.subTextDone}
                type="light"
                color="#1E3A5F"
                fontSize={14}
              >{`${filledGlass}/${totalWater}`}</CustomText>
              <View style={styles.streakContainer}>
                {waterStreak > 20 ? (
                  <TreeIcon
                    size={22}
                    color={isWaterDone ? "#1E3A5F" : "#1E3A5FCC"}
                    variant={isWaterDone ? "fill" : "outlined"}
                    type="plural"
                  />
                ) : waterStreak > 13 ? (
                  <TreeIcon
                    size={22}
                    color={isWaterDone ? "#1E3A5F" : "#1E3A5FCC"}
                    variant={isWaterDone ? "fill" : "outlined"}
                    type="single"
                  />
                ) : (
                  <LeafIcon
                    size={18}
                    color={isWaterDone ? "#1E3A5F" : "#1E3A5FCC"}
                    variant={isWaterDone ? "fill" : "outlined"}
                  />
                )}
                <CustomText
                  style={styles.streakText}
                  color="#1E3A5F"
                  fontSize={16}
                  type="regular"
                >
                  {waterStreak}
                </CustomText>
              </View>
            </View>
            <Pressable onPress={handleWaterPress} style={styles.addButton}>
              {isWaterDone ? (
                <BoxIcon size={22} color="#1E3A5F" variant="fill" />
              ) : (
                <PlusIcon size={22} color="#1E3A5F" />
              )}
            </Pressable>
          </View>
          <View style={styles.bottom}>
            <CustomText
              style={styles.subTextType}
              color="#1E3A5F"
              fontSize={10}
              type="regular"
            >
              {getCupName()} | {cupSize} ml
            </CustomText>
          </View>
        </View>
      </View>

      {/* Feedback modal */}
      <CardFeedback
        isVisible={isFeedbackVisible}
        text={getFeedbackProps().text}
        type="celebration"
        onComplete={() => setIsFeedbackVisible(false)}
        isStreak={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
    minHeight: 70,
    backgroundColor: "#FDFDFD",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flex: 1,
  },
  doneHabit: {
    backgroundColor: "#E8EFF5",
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
    minHeight: 70,
    borderWidth: 1,
    borderColor: "#CEDEEB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flex: 1,
  },
  cupGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "55%",
    flexGrow: 1,
  },
  cupContainer: {
    marginBottom: 8,
    marginRight: 4,
  },
  rightContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    width: "45%",
    height: "100%",
    flexGrow: 1,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  subTextDone: {
    opacity: 0.8,
    marginRight: 20,
  },
  subTextType: {
    opacity: 0.6,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  streakText: {
    marginLeft: 2,
  },
  addButton: {
    justifyContent: "center",
    alignItems: "center",
  },
});
