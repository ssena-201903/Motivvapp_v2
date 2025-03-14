import React, { useState, useRef } from "react";
import { View, StyleSheet, Dimensions, Pressable, Image } from "react-native";
import Modal from "react-native-modal";
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
import ThumbsUpIcon from "@/components/icons/ThumbsUpIcon";

import { useLanguage } from "@/app/LanguageContext";
import AddGoalNoteModal from "../modals/AddGoalNoteModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import EditGoalModal from "@/components/modals/EditGoalModal";
import FriendsListModal from "../modals/FriendsListModal";
import BookIcon from "../icons/BookIcon";
import MoreIcon from "../icons/MoreIcon";

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
  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

  // Menü butonu için referans
  const menuButtonRef = useRef(null);
  // Menü koordinatları için state
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

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
    event.stopPropagation();
    setIsAddNoteModalVisible(true);
    setIsMenuVisible(false);
  };

  const handleNoteAdded = (newNote: string) => {
    goal.notes = [...goal.notes, newNote];
    onUpdate();
  };

  // Kart tıklama işleyicisi
  const handleCardPress = () => {
    setIsDetailsModalVisible(true);
    setIsMenuVisible(false);
  };

  // İç butonlar için tıklama işleyicileri
  const handleDeleteButtonPress = (event: any) => {
    event.stopPropagation();
    setIsConfirmationVisible(true);
    setIsMenuVisible(false);
  };

  const handleEditButtonPress = (event: any) => {
    event.stopPropagation();
    setIsEditModalVisible(true);
    setIsMenuVisible(false);
  };

  const handleCheckboxPress = (event: any) => {
    event.stopPropagation();
    toggleCard();
  };

  // Menü için tıklama işleyicisi - pozisyon hesaplamasını içerir
  const openMoreMenu = (event: any) => {
    event.stopPropagation();
    setIsMenuVisible(true);
  };

  // Picker için tıklama işleyicisi
  const handlePickerPress = (event: any) => {
    event.stopPropagation();
  };

  const handleAdvicePress = (event: any) => {
    event.stopPropagation();
    setIsFriendsModalVisible(true);
    setIsMenuVisible(false);
  };

  const handleDetailsPress = (event: any) => {
    event.stopPropagation();
    setIsDetailsModalVisible(true);
    setIsMenuVisible(false);
  };

  return (
    <View style={[styles.mainContainer, isDone && styles.completedContainer]}>
      <View style={styles.container}>
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
                <Pressable
                  style={styles.infoSection}
                  onPress={handlePickerPress}
                >
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

          {/* Middle section: Rating and Menu */}
          <View style={styles.middleSection}>
            <View style={styles.ratingSection}>
              <Pressable onPress={(event) => event.stopPropagation()}>
                <StarRating
                  rating={goal.rating}
                  onRatingChange={handleRatingChange}
                />
              </Pressable>
            </View>

            <View style={styles.iconsContainer}>
              {/* 3 noktalı menü ikonu */}
              <Pressable
                ref={menuButtonRef}
                // style={styles.menuButton}
                onPress={openMoreMenu}
              >
                {/* <BookIcon size={20} color="#1E3A5F" /> */}
                <MoreIcon size={20} color="#1E3A5F" />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Button Container */}
      <View style={styles.buttonContainer}>
        <Pressable style={styles.detailsButton} onPress={handleDetailsPress}>
          <InfoIcon size={16} color="#1E3A5F" />
          <CustomText
            style={styles.buttonText}
            color="#1E3A5F"
            fontSize={14}
            type="medium"
          >
            Detaylar
          </CustomText>
        </Pressable>

        <Pressable style={styles.recommendButton} onPress={handleAdvicePress}>
          <ThumbsUpIcon size={16} color="#1E3A5F" variant="outlined" />
          <CustomText
            style={styles.buttonText}
            color="#1E3A5F"
            fontSize={14}
            type="medium"
          >
            Tavsiye Et
          </CustomText>
        </Pressable>
      </View>

      {/* Açılır Menü Modal olarak */}
      <Modal
        isVisible={isMenuVisible}
        animationIn={"slideInUp"}
        animationOut={"slideOutDown"}
        backdropColor="rgba(0, 0, 0, 0.8)"
        onBackdropPress={() => setIsMenuVisible(false)}
      >
        <Pressable
          style={styles.menuModalOverlay}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            <Pressable
              style={[styles.menuItem, styles.lastMenuItem]}
              onPress={handleAddNote}
            >
              <PlusIcon size={12} color="#1E3A5F" />
              <CustomText
                style={styles.menuItemText}
                color="#1E3A5F"
                fontSize={14}
                type="regular"
              >
                {t("cardGoalTodo.addNote") || "Not Ekle"}
              </CustomText>
            </Pressable>

            {category !== "Movie" && (
              <Pressable
                style={styles.menuItem}
                onPress={handleEditButtonPress}
              >
                <PencilIcon size={14} color="#1E3A5F" />
                <CustomText
                  style={styles.menuItemText}
                  color="#1E3A5F"
                  fontSize={14}
                  type="regular"
                >
                  {"Düzenle"}
                </CustomText>
              </Pressable>
            )}

            <Pressable
              style={styles.menuItem}
              onPress={handleDeleteButtonPress}
            >
              <TrashIcon size={16} color="#1E3A5F" />
              <CustomText
                style={styles.menuItemText}
                color="#1E3A5F"
                fontSize={14}
                type="regular"
              >
                {"Sil"}
              </CustomText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Diğer Modaller */}
      <GoalDetailsModal
        visible={isDetailsModalVisible}
        onClose={() => setIsDetailsModalVisible(false)}
        goal={goal}
        isPrivate={true}
        isNotesVisible={false}
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
        onClose={() => {
          setIsFriendsModalVisible(false);
        }}
        goal={goal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    width: width > 768 ? width - 900 : width - 40,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C6C6C6",
    marginBottom: 8,
    overflow: "hidden",
  },
  completedContainer: {
    backgroundColor: "#E5EEFF",
    borderColor: "#CEDEEB",
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: 15,
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
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  titleWrapper: {
    flex: 1,
    paddingRight: 10,
    gap: 2,
    minWidth: "50%",
  },
  titleText: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: width < 380 ? 10 : 0,
  },
  checkboxButton: {
    padding: 5,
  },
  middleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
    flexWrap: "wrap",
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
    marginBottom: width < 380 ? 10 : 0,
  },
  iconsContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  // Menü stilleri
  menuButton: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5EEFF",
    borderRadius: 6,
  },
  menuModalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownMenu: {
    width: 150,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8EFF5",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EFF5",
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    marginLeft: 10,
  },
  // Bottom Button Container stilleri
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#E8EFF5",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: "#E8EFF5",
  },
  recommendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
    paddingVertical: 12,
  },
  buttonText: {
    marginLeft: 8,
  },
});
