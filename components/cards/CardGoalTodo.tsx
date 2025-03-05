import React, { useState } from "react";
import { View, StyleSheet, Dimensions, Pressable, Image } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { CustomText } from "@/CustomText";
import GoalDetailsModal from "@/components/modals/GoalDetailsModal";
import StarRating from "@/components/icons/StarRating";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/firebase.config";
import BoxIcon from "../icons/BoxIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import InfoIcon from "@/components/icons/InfoIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import PencilIcon from "@/components/icons/PencilIcon";
import HeartIcon from "@/components/icons/HeartIcon";
import ThumbsUpIcon from "@/components/icons/ThumbsUpIcon";

import { useLanguage } from "@/app/LanguageContext";
import AddGoalNoteModal from "../modals/AddGoalNoteModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import EditGoalModal from "@/components/modals/EditGoalModal";
import FriendsListModal from "../modals/FriendsListModal";

const { width } = Dimensions.get("window");

type CardGoalProps = {
  category: string;
  goal: any;
  onUpdate: () => void;
};

export default function CardGoalTodo({
  category,
  goal,
  onUpdate,
}: CardGoalProps) {
  const [isDone, setIsDone] = useState<boolean>(goal.isDone || false);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    goal.readingStatus || "not started"
  );
  const [isDetailsModalVisible, setIsDetailsModalVisible] =
    useState<boolean>(false);
  const [isAddNoteModalVisible, setIsAddNoteModalVisible] =
    useState<boolean>(false);
  const [isConfirmationVisible, setIsConfirmationVisible] =
    useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isFriendsModalVisible, setIsFriendsModalVisible] =
    useState<boolean>(false);

  // language context
  const { t } = useLanguage();

  const handleDelete = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      await deleteDoc(doc(db, "users", userId, "goals", goal.id));
      console.log("Öğe başarıyla silindi!");
      onUpdate();
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  const handleEditSubmit = async (updatedName: string) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      await updateDoc(doc(db, "users", userId, "goals", goal.id), {
        name: updatedName,
      });

      console.log("Öğe başarıyla güncellendi!");
      onUpdate();
      setIsEditModalVisible(false);
    } catch (error) {
      console.error("Güncelleme hatası:", error);
    }
  };

  const toggleCard = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const updateIsDone = !isDone;
      const updateReadingStatus =
        category === "Book" ? (updateIsDone ? "read" : "not started") : null;

      const goalRef = doc(db, "users", userId, "goals", goal.id);
      await updateDoc(goalRef, {
        isDone: updateIsDone,
        ...(category === "Book" && { readingStatus: updateReadingStatus }),
        finishedAt: updateIsDone ? new Date() : null,
      });

      setIsDone(updateIsDone);
      if (category === "Book")
        setSelectedStatus(updateReadingStatus || "not started");

      onUpdate();
    } catch (error) {
      console.error("Error updating goal status: ", error);
    }
  };

  const handleReadingStatusChange = async (newStatus: string) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const updateIsDone = newStatus === "read";

      const goalRef = doc(db, "users", userId, "goals", goal.id);
      await updateDoc(goalRef, {
        readingStatus: newStatus,
        isDone: updateIsDone,
        finishedAt: updateIsDone ? new Date() : null,
      });
      setSelectedStatus(newStatus);
      setIsDone(updateIsDone);
      onUpdate();
    } catch (error) {
      console.error("Error updating reading status: ", error);
    }
  };

  const handleRatingChange = async (newRating: number) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const goalRef = doc(db, "users", userId, "goals", goal.id);
      await updateDoc(goalRef, {
        rating: newRating,
      });
      onUpdate();
    } catch (error) {
      console.error("Error updating rating: ", error);
    }
  };

  const handleAddNote = (event: any) => {
    // Olayın üst bileşenlere yayılmasını önle
    event.stopPropagation();
    setIsAddNoteModalVisible(true);
  };

  const handleNoteAdded = (newNote: string) => {
    goal.notes = [...goal.notes, newNote];
    onUpdate();
  };

  // Kart tıklama işleyicisi
  const handleCardPress = () => {
    setIsDetailsModalVisible(true);
  };

  // İç butonlar için tıklama işleyicileri
  const handleDeleteButtonPress = (event: any) => {
    event.stopPropagation(); // Olayın kartın tıklama olayına yayılmasını engelle
    setIsConfirmationVisible(true);
  };

  const handleEditButtonPress = (event: any) => {
    event.stopPropagation();
    setIsEditModalVisible(true);
  };

  const handleCheckboxPress = (event: any) => {
    event.stopPropagation();
    toggleCard();
  };

  // Picker için tıklama işleyicisi
  const handlePickerPress = (event: any) => {
    event.stopPropagation();
  };

  const handleAdvicePress = (event: any) => {
    event.stopPropagation();
    setIsFriendsModalVisible(true);
  }

  return (
    <Pressable
      style={[styles.container, isDone && styles.completedContainer]}
      onPress={handleCardPress}
    >
      {/* Movie poster */}
      {category === "Movie" && (
        <Image
          source={
            goal.posterUrl
              ? { uri: goal.posterUrl }
              : require("@/assets/images/logo.png")
          }
          style={styles.poster}
        />
      )}

      <View style={styles.contentContainer}>
        {/* Top section: Title + Actions */}
        <View style={styles.topSection}>
          <View style={styles.titleWrapper}>
            <CustomText
              style={styles.titleText}
              color="#1E3A5F"
              fontSize={16}
              type="bold"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {goal.name}
            </CustomText>
            {category === "Movie" && (
              <CustomText
                style={styles.infoText}
                color="#666"
                fontSize={12}
                type="regular"
              >
                IMDB: {goal.imdbRate} / {goal.runtime}
              </CustomText>
            )}
            {category === "Book" && (
              <Pressable style={styles.infoSection} onPress={handlePickerPress}>
                <Picker
                  selectedValue={selectedStatus}
                  onValueChange={(value) => {
                    handleReadingStatusChange(value);
                  }}
                  style={styles.picker}
                  dropdownIconColor="#1E3A5F"
                >
                  <Picker.Item
                    label={t("cardGoalTodo.notStartedStatus")}
                    value="not started"
                  />
                  <Picker.Item
                    label={t("cardGoalTodo.readingStatus")}
                    value="reading"
                  />
                  <Picker.Item
                    label={t("cardGoalTodo.completedStatus")}
                    value="read"
                  />
                </Picker>
              </Pressable>
            )}
          </View>

          <View style={styles.actionsContainer}>
            <Pressable style={styles.actionButton} onPress={handleAddNote}>
              <PlusIcon size={12} color="#1E3A5F" />
              {width >= 340 && (
                <CustomText
                  style={styles.actionText}
                  color="#666"
                  fontSize={14}
                  type="medium"
                >
                  {t("cardGoalTodo.addNote")}
                </CustomText>
              )}
            </Pressable>

            <Pressable
              style={styles.checkboxButton}
              onPress={handleCheckboxPress}
            >
              {isDone ? (
                <BoxIcon size={20} color="#1E3A5F" variant="fill" />
              ) : (
                <BoxIcon size={20} color="#1E3A5F" variant="outlined" />
              )}
            </Pressable>
          </View>
        </View>

        {/* Bottom section: Status/Info + Rating/Icons */}
        <View style={styles.bottomSection}>
          {/* Rating and action icons */}
          <View style={styles.ratingSection}>
            <Pressable onPress={(event) => event.stopPropagation()}>
              <StarRating
                rating={goal.rating}
                onRatingChange={handleRatingChange}
              />
            </Pressable>
          </View>

          <View style={styles.iconsContainer}>
            {/* Edit button for non-Movie categories */}
            {category !== "Movie" && (
              <Pressable
                style={styles.actionButton}
                onPress={handleEditButtonPress}
              >
                <PencilIcon size={14} color="#1E3A5F" />
                <CustomText
                  style={styles.actionText}
                  color="#666"
                  fontSize={14}
                  type="medium"
                >
                  Düzenle
                </CustomText>
              </Pressable>
            )}

            <Pressable
              style={styles.iconButton}
              onPress={handleAdvicePress}
            >
              <ThumbsUpIcon size={20} color="#1E3A5F" variant="outlined" />
            </Pressable>

            {/* Delete button */}
            <Pressable
              style={styles.iconButton}
              onPress={handleDeleteButtonPress}
            >
              <TrashIcon size={20} color="#FF6347" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Modals */}
      <GoalDetailsModal
        visible={isDetailsModalVisible}
        onClose={() => setIsDetailsModalVisible(false)}
        goal={goal}
        isPrivate={true}
        isNotesVisible={true}
      />

      <AddGoalNoteModal
        visible={isAddNoteModalVisible}
        onClose={() => setIsAddNoteModalVisible(false)}
        goal={goal}
        onNoteAdded={handleNoteAdded}
      />

      <ConfirmationModal
        visible={isConfirmationVisible}
        title={t("confirmationModal.titleDeleteGoal")}
        message={t("confirmationModal.messageDeleteGoal")}
        onConfirm={() => {
          handleDelete();
          setIsConfirmationVisible(false);
        }}
        onCancel={() => setIsConfirmationVisible(false)}
      />

      <EditGoalModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        initialName={goal.name}
        onSave={handleEditSubmit}
      />

      <FriendsListModal
        isFriendsModalVisible={isFriendsModalVisible}
        onClose={() => {setIsFriendsModalVisible(false)}}
        goal={goal}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 8,
    width: width > 768 ? width - 900 : width - 40,
    minHeight: 100,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedContainer: {
    backgroundColor: "#E5EEFF",
  },
  poster: {
    width: 60,
    height: 100,
    marginRight: 15,
    borderRadius: 4,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    marginLeft: 10,
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  titleWrapper: {
    flex: 1,
    paddingRight: 10,
    gap: 2,
    width: "50%",
  },
  titleText: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "50%",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#E5EEFF",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    marginLeft: 8,
  },
  checkboxButton: {
    padding: 5,
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 5,
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  infoText: {
    opacity: 0.7,
  },
  picker: {
    width: 100,
    height: 30,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginRight: 12,
    borderRadius: 4,
    borderColor: "#999",
    color: "#666",
    backgroundColor: "transparent",
  },
  ratingSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconsContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 5,
  },
  iconButton: {
    marginLeft: 10,
    opacity: 0.7,
  },
});
