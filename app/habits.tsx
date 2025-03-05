import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  ImageBackground,
  Pressable,
  Text,
  View,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  RefreshControl, // added to refresh habits list
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/firebase.config";
import CardOtherHabit from "@/components/cards/CardOtherHabit";
import CardWaterHabit from "@/components/cards/CardWaterHabit";
import SectionHeader from "@/components/headers/SectionHeader";
import AddWaterHabitModal from "@/components/modals/AddWaterHabitModal";
import AddOtherHabitModal from "@/components/modals/AddOtherHabitModal";

import { useLanguage } from "@/app/LanguageContext";
import { CustomText } from "@/CustomText";
import PlusIcon from "@/components/icons/PlusIcon";
import BoxIcon from "@/components/icons/BoxIcon";

const { width } = Dimensions.get("window");

export default function Habits() {
  const userId = auth.currentUser?.uid ?? "";

  const [activeHabits, setActiveHabits] = useState<any[]>([]);
  const [habitsPercentage, setHabitsPercentage] = useState<number>(0);

  const [isWaterCard, setIsWaterCard] = useState<boolean>(false);
  const [isBookCard, setIsBookCard] = useState<boolean>(false);
  const [isSportCard, setIsSportCard] = useState<boolean>(false);
  const [isVocabularyCard, setIsVocabularyCard] = useState<boolean>(false);
  const [isCustomCard, setIsCustomCard] = useState<boolean>(false);

  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [isWaterModalOpen, setIsWaterModalOpen] = useState<boolean>(false);
  const [isOtherModalOpen, setIsOtherModalOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // refresh page
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }

  // language context
  const { t, language, setLanguage } = useLanguage();

  const fetchHabitDatas = async () => {
    try {
      const habitsRef = collection(db, `users/${userId}/habits`);
      const querySnapshot = await getDocs(habitsRef);

      // Reset all habit states
      setIsWaterCard(false);
      setIsBookCard(false);
      setIsSportCard(false);
      // setIsCustomCard(false);
      setIsVocabularyCard(false);

      // active habits
      const newActiveHabits: any[] = [];

      querySnapshot.docs.forEach((doc) => {
        const habitDoc = doc.data();

        if (!habitDoc.isArchieved) {
          newActiveHabits.push(habitDoc);
        }

        if (habitDoc.variant === "Water") {
          setIsWaterCard(true);
        } else if (habitDoc.variant === "Book") {
          setIsBookCard(true);
        } else if (habitDoc.variant === "Sport") {
          setIsSportCard(true);
        } else if (habitDoc.variant === "Vocabulary") {
          setIsVocabularyCard(true);
        }
      });

      setActiveHabits(newActiveHabits);
      setHabitsPercentage(calculatePercentDone(newActiveHabits));
    } catch (error) {
      console.log("error fetching habits", error);
    }
  };

  useEffect(() => {
    fetchHabitDatas();
  }, [userId]);

  const handleHabitAdd = async (data: any) => {
    await fetchHabitDatas(); // update list after adding a new goal
  };

  const openAddHabitModal = (variant: string) => {
    setSelectedVariant(variant);
    setIsModalOpen(false);
    if (variant === "Water") {
      setIsWaterModalOpen(true);
    } else {
      setIsOtherModalOpen(true);
    }
  };

  const calculatePercentDone = (habits: any[]) => {
    const totalHabits = activeHabits.length;
    const completedHabits = activeHabits.filter((habit) => habit.isCompleted).length;
    return Math.floor((completedHabits / totalHabits) * 100);
  };

  return (
    <ImageBackground
      source={require("@/assets/images/habitCardBg.png")}
      style={styles.imageBackground}
    >
      <View style={styles.container}>
        {/* add new habit button */}
        <Pressable
          style={styles.addButton}
          onPress={() => setIsModalOpen(true)}
        >
          <PlusIcon size={16} color="#fff" />
          <CustomText type="regular" color="#fff" fontSize={14}>
            {t("habits.newButtonText")}
          </CustomText>
        </Pressable>

        <SectionHeader
          text={t("habits.title")}
          percentDone={habitsPercentage}
          variant="other"
          id="habits"
        />
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.contentBody}>
            {userId && isWaterCard && <CardWaterHabit userId={userId} />}
            {userId && isBookCard && (
              <CardOtherHabit userId={userId} variant="Book" />
            )}
            {userId && isVocabularyCard && (
              <CardOtherHabit userId={userId} variant="Vocabulary" />
            )}
            {userId && isSportCard && (
              <CardOtherHabit userId={userId} variant="Sport" />
            )}
          
              <CardOtherHabit userId={userId} variant="Custom" />
            
          </View>
        </ScrollView>
      </View>

      {/* type modal */}
      <Modal visible={isModalOpen} animationType="fade" transparent>
        <TouchableWithoutFeedback onPress={() => setIsModalOpen(false)}>
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor:
                  isWaterModalOpen || isOtherModalOpen
                    ? "transparent"
                    : "rgba(119, 128, 137, 0.32)",
              },
            ]}
          >
            <CustomText
              type="semibold"
              fontSize={20}
              color="#1E3A5F"
              style={styles.modalTitle}
            >
              {t("habits.chooseType")}
            </CustomText>
            <View style={styles.typeContainer}>
              <Pressable
                style={[styles.typeButton, isWaterCard && styles.disabledType]}
                onPress={() => openAddHabitModal("Water")}
                disabled={isWaterCard}
              >
                <BoxIcon
                  size={16}
                  color="#1E3A5F"
                  variant={isWaterCard ? "fill" : "outlined"}
                />
                <CustomText type="medium" fontSize={16} color="#1E3A5F">
                  {t("habits.water")}
                </CustomText>
              </Pressable>
              <Pressable
                style={[styles.typeButton, isBookCard && styles.disabledType]}
                onPress={() => openAddHabitModal("Book")}
                disabled={isBookCard}
              >
                <BoxIcon
                  size={16}
                  color="#1E3A5F"
                  variant={isBookCard ? "fill" : "outlined"}
                />
                <CustomText type="medium" fontSize={16} color="#1E3A5F">
                  {t("habits.book")}
                </CustomText>
              </Pressable>
              <Pressable
                style={[styles.typeButton, isSportCard && styles.disabledType]}
                onPress={() => openAddHabitModal("Sport")}
                disabled={isSportCard}
              >
                <BoxIcon
                  size={16}
                  color="#1E3A5F"
                  variant={isSportCard ? "fill" : "outlined"}
                />
                <CustomText type="medium" fontSize={16} color="#1E3A5F">
                  {t("habits.sport")}
                </CustomText>
              </Pressable>
              <Pressable
                style={[
                  styles.typeButton,
                  isVocabularyCard && styles.disabledType,
                ]}
                onPress={() => openAddHabitModal("Vocabulary")}
                disabled={isVocabularyCard}
              >
                <BoxIcon
                  size={16}
                  color="#1E3A5F"
                  variant={isVocabularyCard ? "fill" : "outlined"}
                />
                <CustomText type="medium" fontSize={16} color="#1E3A5F">
                  {t("habits.vocabulary")}
                </CustomText>
              </Pressable>
              <Pressable
                style={styles.typeButton}
                onPress={() => openAddHabitModal("Custom")}
              >
                <BoxIcon size={16} color="#1E3A5F" variant="outlined"/>
                <CustomText type="medium" fontSize={16} color="#1E3A5F">
                  {t("habits.custom")}
                </CustomText>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Add Habit Modals */}
      {isWaterModalOpen && (
        <AddWaterHabitModal
          visible={isWaterModalOpen}
          onClose={() => setIsWaterModalOpen(false)}
        />
      )}
      {isOtherModalOpen && (
        <AddOtherHabitModal
          visible={isOtherModalOpen}
          onClose={() => setIsOtherModalOpen(false)}
          variant={selectedVariant}
          onAdd={handleHabitAdd}
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    position: "relative",
  },
  container: {
    flex: 1,
    width: width > 768 ? width - 860 : width - 40,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 60,
  },
  scrollView: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 20,
  },
  contentBody: {
    width: width > 768 ? width - 860 : "100%",
    marginHorizontal: 20,
    flex: 1,
    gap: 8,
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    padding: 5,
    flexGrow: 1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: -40,
    right: 20,
    backgroundColor: "#1E3A5F",
    padding: 10,
    borderRadius: 10,
    zIndex: 10,
    gap: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    marginBottom: 20,
  },
  typeContainer: {
    flexDirection: "column",
    gap: 10,
  },
  typeButton: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    gap: 12,
  },
  disabledType: {
    backgroundColor: "#FFA38F",
  },
});
