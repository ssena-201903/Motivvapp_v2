import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import BookIcon from "@/components/icons/BookIcon";
import SportIcon from "@/components/icons/SportIcon";
import VocabularyIcon from "@/components/icons/VocabularyIcon";
import TreeIcon from "@/components/icons/TreeIcon";
import LeafIcon from "@/components/icons/LeafIcon";
import BoxIcon from "@/components/icons/BoxIcon";
import SparklesIcon from "../icons/SparklesIcon";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import { CustomText } from "@/CustomText";
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase.config";
import CardFeedback from "./CardFeedback";

import { useLanguage } from "@/app/LanguageContext";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const { width } = Dimensions.get("window");

interface Props {
  variant: "Sport" | "Book" | "Vocabulary" | "Custom";
  userId: string;
}

interface HabitData {
  id: string;
  customText: string;
  isDone: boolean;
  streakDays: number;
  duration: number;
  goalNumber: number;
  dailyAmount: number;
  doneNumber: number;
}

export default function CardOtherHabit({ variant, userId }: Props) {
  const [habits, setHabits] = useState<HabitData[]>([]);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState<boolean>(false);
  const [isConfirmationVisible, setIsConfirmationVisible] =
    useState<boolean>(false);
  const [ConfirmationModalData, setIsConfirmationModalData] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // language context
  const { t } = useLanguage();

  const fetchHabitData = async () => {
    try {
      const habitsRef = collection(db, `users/${userId}/habits`);
      const q = query(habitsRef, where("variant", "==", variant));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const habitsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as HabitData[];

        // get the first habit if variant is not "Custom"
        if (variant !== "Custom") {
          setHabits([habitsList[0]]);
        } else {
          // set all habits if variant is "Custom"
          setHabits(habitsList);
        }
      } else {
        setHabits([]);
      }
    } catch (error) {
      console.error("Error fetching habit data: ", error);
    }
  };

  useEffect(() => {
    fetchHabitData();
  }, [userId, variant]);

  const updateHabit = async (
    habitId: string,
    isDone: boolean,
    newStreak: number,
    newDoneNumber: number,
    newLastChangeAt: string = new Date().toISOString().split("T")[0],
    isArchieved: boolean = false
  ) => {
    try {
      const habitDocRef = doc(db, `users/${userId}/habits/${habitId}`);

      await updateDoc(habitDocRef, {
        isDone,
        streakDays: newStreak,
        doneNumber: newDoneNumber,
        lastChangeAt: newLastChangeAt,
        isArchieved,
      });

      setIsFeedbackVisible(isDone);
      fetchHabitData();
    } catch (error) {
      console.error("Error updating habit: ", error);
    }
  };

  const handleDonePress = (habit: HabitData) => {
    const currentDate = new Date().toISOString().split("T")[0];
    const isArchieved = false;

    if (habit.isDone) {
      setIsConfirmationModalData({
        title: t("confirmationHabit.titleNegative"),
        message: t("confirmationHabit.messageNegative"),
        onConfirm: () =>
          updateHabit(
            habit.id,
            false,
            habit.streakDays - 1,
            habit.doneNumber - 1,
            currentDate,
            false,
          ),
      });
    } else {
      const newStreak = habit.streakDays + 1;
      const isArchieved = newStreak >= habit.goalNumber;

      setIsConfirmationModalData({
        title: t("confirmationHabit.titlePossitive"),
        message: t("confirmationHabit.messagePossitive"),
        onConfirm: () =>
          updateHabit(
            habit.id,
            true,
            habit.streakDays + 1,
            habit.doneNumber + 1,
            currentDate,
            isArchieved
          ),
      });
    }
    setIsConfirmationVisible(true);
  };

  const getSubTextType = (habit: HabitData) => {
    switch (variant) {
      case "Sport":
      case "Book":
        return `${habit.duration} ${t("home.cardHabitMinute")}`;
      case "Custom":
        return habit.duration && !isNaN(habit.duration)
          ? `${habit.duration} ${t("home.cardHabitMinute")}`
          : t("home.cardHabitNoTimeLimit");
      case "Vocabulary":
        return `${habit.dailyAmount} ${t("home.cardHabitWord")}`;
      default:
        return "";
    }
  };

  const getHabitVariant = () => {
    switch (variant) {
      case "Sport":
        return t("home.cardHabitSport");
      case "Book":
        return t("home.cardHabitBook");
      case "Vocabulary":
        return t("home.cardHabitVocabulary");
      case "Custom":
        return t("home.cardHabitCustom");
      default:
        return "";
    }
  };

  const getIcon = (isDone: boolean) => {
    switch (variant) {
      case "Book":
        return (
          <BookIcon
            size={22}
            color={isDone ? "#1E3A5F" : "#1E3A5FCC"}
            variant="fill"
          />
        );
      case "Sport":
        return (
          <SportIcon
            size={22}
            color={isDone ? "#1E3A5F" : "#1E3A5FCC"}
            variant="fill"
          />
        );
      case "Vocabulary":
        return (
          <VocabularyIcon
            size={26}
            color={isDone ? "#1E3A5F" : "#1E3A5FCC"}
            variant="fill"
          />
        );
      case "Custom":
        return (
          <SparklesIcon
            size={22}
            color={isDone ? "#1E3A5F" : "#1E3A5FCC"}
            variant="fill"
          />
        );
      default:
        return null;
    }
  };

  const renderHabitCard = (habit: HabitData) => (
    <View
      key={habit.id}
      style={habit.isDone ? styles.doneHabit : styles.container}
    >
      <View style={styles.leftView}>
        <View style={styles.leftIconContainer}>{getIcon(habit.isDone)}</View>
        <View style={styles.leftTextContainer}>
          <CustomText
            type="medium"
            color="#1E3A5F"
            fontSize={14}
          >
            {variant === "Custom" ? habit.customText : getHabitVariant()}
          </CustomText>
        </View>
      </View>
      <View style={styles.rightContainer}>
        <View style={styles.top}>
          <View style={styles.textContainer}>
            <CustomText
              style={styles.subTextDone}
              type="light"
              color="#1E3A5F"
              fontSize={14}
            >{`${habit.goalNumber} ${t("home.cardHabitGoalDays")}`}</CustomText>
            <View style={styles.streakContainer}>
              {habit.streakDays > 20 ? (
                <TreeIcon
                  size={22}
                  color={habit.isDone ? "#1E3A5F" : "#1E3A5FCC"}
                  variant={habit.isDone ? "fill" : "outlined"}
                  type="plural"
                />
              ) : habit.streakDays > 13 ? (
                <TreeIcon
                  size={22}
                  color={habit.isDone ? "#1E3A5F" : "#1E3A5FCC"}
                  variant={habit.isDone ? "fill" : "outlined"}
                  type="single"
                />
              ) : (
                <LeafIcon
                  size={18}
                  color={habit.isDone ? "#1E3A5F" : "#1E3A5FCC"}
                  variant={habit.isDone ? "fill" : "outlined"}
                />
              )}
              <CustomText
                style={styles.streakText}
                color="#1E3A5F"
                fontSize={16}
                type={habit.isDone ? "medium" : "regular"}
              >
                {habit.streakDays}
              </CustomText>
            </View>
          </View>
          <Pressable onPress={() => handleDonePress(habit)}>
            <BoxIcon
              size={20}
              color="#1E3A5F"
              variant={habit.isDone ? "fill" : "outlined"}
            />
          </Pressable>
        </View>
        <View style={styles.bottom}>
          <CustomText
            style={styles.subTextType}
            color="#1E3A5F"
            fontSize={10}
            type="regular"
          >
            {getSubTextType(habit)}
          </CustomText>
        </View>
      </View>
    </View>
  );

  return (
    <>
      {habits.map(renderHabitCard)}
      <CardFeedback
        isVisible={isFeedbackVisible}
        text={t("feedbackProps.successHabit")}
        type="celebration"
        onComplete={() => setIsFeedbackVisible(false)}
        isStreak={true}
      />
      <ConfirmationModal
        visible={isConfirmationVisible}
        title={ConfirmationModalData.title}
        message={ConfirmationModalData.message}
        onConfirm={() => {
          ConfirmationModalData.onConfirm();
          setIsConfirmationVisible(false);
        }}
        onCancel={() => setIsConfirmationVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    minWidth: "100%",
    minHeight: 70,
    backgroundColor: "#FDFDFD",
    borderWidth: 1,
    borderColor: "#E8EFF5",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  doneHabit: {
    backgroundColor: "#E5EEFF",
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    minWidth: "100%",
    minHeight: 70,
    borderWidth: 1,
    borderColor: "#CEDEEB",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  leftView: {
    width: "50%",
    height: "auto",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  leftIconContainer: {
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  leftTextContainer: {
    flex: 1,
    overflow: "hidden",
  },
  rightContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    width: "50%",
    height: "100%",
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
    marginRight: 20,
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
  },
  streakText: {
    marginLeft: 2,
  },
});
