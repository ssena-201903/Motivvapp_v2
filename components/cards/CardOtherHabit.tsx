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
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase.config";
import CardFeedback from "./CardFeedback";
import { useLanguage } from "@/app/LanguageContext";

const { width } = Dimensions.get("window");

interface Props {
  variant: "Sport" | "Book" | "Vocabulary" | "Custom";
  userId: string;
  onLongPress: (habitId: string, habitText: string) => void;
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

export default function CardOtherHabit({ variant, userId, onLongPress }: Props) {
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

  useEffect(() => {
    // Veri tabanına bağlanmak için gerekli kontroller
    if (!userId) return;

    try {
      const habitsRef = collection(db, `users/${userId}/habits`);
      const q = query(habitsRef, where("variant", "==", variant));
      
      // onSnapshot ile veritabanındaki değişiklikleri dinle
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
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
      });

      // Component unmount olduğunda listener'ı temizle
      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up habit data listener: ", error);
    }
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
      // fetchHabitData() artık gerekli değil, onSnapshot otomatik olarak güncelliyor
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
            false
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
            size={18}
            color={isDone ? "#E8EFF5" : "#1E3A5F"}
          />
        );
      case "Sport":
        return (
          <SportIcon
            size={18}
            color={isDone ? "#E8EFF5" : "#1E3A5F"}
            variant="fill"
          />
        );
      case "Vocabulary":
        return (
          <VocabularyIcon
            size={18}
            color={isDone ? "#E8EFF5" : "#1E3A5F"}
            variant="fill"
          />
        );
      case "Custom":
        return (
          <SparklesIcon
            size={18}
            color={isDone ? "#E8EFF5" : "#1E3A5F"}
            variant="fill"
          />
        );
      default:
        return null;
    }
  };

  const renderHabitCard = (habit: HabitData) => (
    <Pressable
      key={habit.id}
      style={habit.isDone ? styles.doneHabit : styles.container}
      onLongPress={() => onLongPress && onLongPress(habit.id, habit.customText)}
    >
      <View style={styles.leftContainer}>
        <View
          style={[
            styles.iconContainer,
            habit.isDone && styles.doneIconContainer, 
          ]}
        >
          {getIcon(habit.isDone)}
        </View>

        <View style={styles.infoContainer}>
          <CustomText type="medium" color="#1E3A5F" fontSize={14}>
            {variant === "Custom" ? habit.customText : getHabitVariant()}
          </CustomText>
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

      <View style={styles.rightContainer}>
        <View style={styles.topRow}>
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

          <Pressable
            onPress={() => handleDonePress(habit)}
            style={styles.checkboxContainer}
          >
            <BoxIcon
              size={20}
              color="#1E3A5F"
              variant={habit.isDone ? "fill" : "outlined"}
            />
          </Pressable>
        </View>

        <View style={styles.bottomRow}>
          <CustomText
            style={styles.goalText}
            type="light"
            color="#1E3A5F"
            fontSize={10}
          >
            {`${habit.goalNumber} ${t("home.cardHabitGoalDays")}`}
          </CustomText>
        </View>
      </View>
    </Pressable>
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
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: "100%",
    minHeight: 70,
    backgroundColor: "#FDFDFD",
    borderWidth: 1,
    borderColor: "#E8EFF5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    backgroundColor: "#E8EFF5",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: "100%",
    minHeight: 70,
    borderWidth: 1,
    borderColor: "#CEDEEB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8EFF5",
    marginRight: 12,
  },
  doneIconContainer: {
    backgroundColor: "#1E3A5F",
  },
  infoContainer: {
    justifyContent: "center",
    gap: 4,
    flex: 1,
  },
  rightContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  bottomRow: {
    alignItems: "flex-end",
    width: "100%",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  streakText: {
    marginLeft: 2,
  },
  checkboxContainer: {
    padding: 2,
  },
  goalText: {
    opacity: 0.8,
  },
  subTextType: {
    opacity: 0.6,
    marginTop: 2,
  },
});