import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  Pressable,
  Text,
  View,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  RefreshControl,
  SafeAreaView,
  Alert,
} from "react-native";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
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
import { showMessage } from "react-native-flash-message";

const { width } = Dimensions.get("window");

export default function Habits() {
  const userId = auth.currentUser?.uid ?? "";

  const [activeHabits, setActiveHabits] = useState<any[]>([]);
  const [habitsPercentage, setHabitsPercentage] = useState<number>(0);

  const [isWaterCard, setIsWaterCard] = useState<boolean>(false);
  const [isBookCard, setIsBookCard] = useState<boolean>(false);
  const [isSportCard, setIsSportCard] = useState<boolean>(false);
  const [isVocabularyCard, setIsVocabularyCard] = useState<boolean>(false);
  // Custom alışkanlıkları ayrı bir state'te izliyoruz
  const [customHabits, setCustomHabits] = useState<any[]>([]);

  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [isWaterModalOpen, setIsWaterModalOpen] = useState<boolean>(false);
  const [isOtherModalOpen, setIsOtherModalOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [refreshing, setRefreshing] = useState(false);

  const { t } = useLanguage();

  // Real-time fetch habits
  const fetchHabitDatas = () => {
    if (!userId) return () => {};
    
    try {
      const habitsRef = collection(db, `users/${userId}/habits`);
      
      // listen datas for changes in real-time
      const unsubscribe = onSnapshot(habitsRef, (querySnapshot) => {
        const habits: any[] = [];
        const customHabitsList: any[] = [];
        
        querySnapshot.forEach((doc) => {
          const habitData: any = { id: doc.id, ...doc.data() };
          habits.push(habitData);
          
          // collect custom habits separately
          if (habitData.variant === "Custom") {
            customHabitsList.push(habitData);
          }
        });
        
        // Streak sayısına göre alışkanlıkları sırala (yüksekten düşüğe)
        const sortedHabits = habits.sort((a, b) => {
          const streakA = a.streakDays || 0;
          const streakB = b.streakDays || 0;
          return streakB - streakA;
        });
        
        // update all active habits
        setActiveHabits(sortedHabits);
        
        // Sort and update custom habits
        const sortedCustomHabits = customHabitsList.sort((a, b) => {
          const streakA = a.streakDays || 0;
          const streakB = b.streakDays || 0;
          return streakB - streakA;
        });
        setCustomHabits(sortedCustomHabits);
        
        // update card states
        setIsWaterCard(habits.some(habit => habit.variant === "Water"));
        setIsBookCard(habits.some(habit => habit.variant === "Book"));
        setIsSportCard(habits.some(habit => habit.variant === "Sport"));
        setIsVocabularyCard(habits.some(habit => habit.variant === "Vocabulary"));
        
        // calculate completion percentage
        const completionPercentage = calculatePercentDone(habits);
        setHabitsPercentage(completionPercentage);
      });
      
      return unsubscribe;
    } catch (error) {
      console.log("error fetching habits", error);
      return () => {};
    }
  };

  // Sayfa yüklendiğinde ve userId değiştiğinde veriler çekilsin
  useEffect(() => {
    const unsubscribe = fetchHabitDatas();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  // Refresh işlemi için
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      // Burada yeniden fetchHabitDatas çağrılmasına gerek yok
      // onSnapshot zaten real-time dinlediği için verileri otomatik güncelliyor
      setRefreshing(false);
    }, 1000);
  };

  // Alışkanlık ekleme işlemi - ModalClose sonrası tekrar verilerin çekilmesine gerek yok
  const handleHabitAdd = async (data: any) => {
    // onSnapshot zaten real-time dinlediği için burada ek işleme gerek yok
    // Modal'ları kapat
    setIsWaterModalOpen(false);
    setIsOtherModalOpen(false);
    showMessage({ message: "Alışkanlık eklendi", type: "success" });
  };

  // Alışkanlık silme işlemi
  const handleHabitDelete = async (habitId: string, habitName: string) => {
    if (!userId || !habitId) return;
    
    Alert.alert(
      t("general.confirm"),
      `${habitName} ${t("habits.deleteConfirmation")}`,
      [
        {
          text: t("general.cancel"),
          style: "cancel"
        },
        {
          text: t("general.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              const habitRef = doc(db, `users/${userId}/habits`, habitId);
              await deleteDoc(habitRef);
              showMessage({ message: t("habits.deleteSuccess"), type: "success" });
            } catch (error) {
              console.error("Error deleting habit:", error);
              showMessage({ message: t("general.errorOccurred"), type: "danger" });
            }
          }
        }
      ]
    );
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
    const totalHabits = habits.length - 1;
    if (totalHabits === 0) return 0;

    const completedHabits = habits.filter(
      (habit) => habit.isCompleted || habit.isDone
    ).length;
    return Math.floor((completedHabits / totalHabits) * 100);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <View style={styles.headerSection}>
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
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.contentBody}>
              {userId && isWaterCard && (
                <CardWaterHabit 
                  userId={userId} 
                />
              )}
              {userId && isBookCard && (
                <CardOtherHabit 
                  userId={userId} 
                  variant="Book" 
                  onLongPress={(habitId, habitName) => handleHabitDelete(habitId, habitName)}
                />
              )}
              {userId && isVocabularyCard && (
                <CardOtherHabit 
                  userId={userId} 
                  variant="Vocabulary" 
                  onLongPress={(habitId, habitName) => handleHabitDelete(habitId, habitName)}
                />
              )}
              {userId && isSportCard && (
                <CardOtherHabit 
                  userId={userId} 
                  variant="Sport" 
                  onLongPress={(habitId, habitName) => handleHabitDelete(habitId, habitName)}
                />
              )}
              {userId && customHabits.length > 0 && (
                <CardOtherHabit 
                  userId={userId} 
                  variant="Custom" 
                  onLongPress={(habitId, habitName) => handleHabitDelete(habitId, habitName)}
                />
              )}
            </View>
          </ScrollView>
        </View>
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
                disabled={false} // Custom her zaman eklenebilir
              >
                <BoxIcon
                  size={16}
                  color="#1E3A5F"
                  variant="outlined"
                />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FCFCFC",
  },
  outerContainer: {
    flex: 1,
    backgroundColor: "#FCFCFC",
  },
  container: {
    flex: 1,
    paddingHorizontal: width > 768 ? 430 : 20,
    alignItems: "center",
    marginTop: 20,
  },
  headerSection: {
    width: "100%",
    position: "relative",
    marginTop: 40,
    marginBottom: 10,
  },
  scrollView: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 20,
    width: "100%",
  },
  contentBody: {
    width: width > 768 ? width - 860 : "100%",
    flex: 1,
    gap: 8,
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    padding: 5,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: -40,
    right: 20,
    marginBottom: 20,
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