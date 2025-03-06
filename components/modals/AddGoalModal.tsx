import React, { useState } from "react";
import { View, TextInput, StyleSheet, Dimensions } from "react-native";

import Modal from "react-native-modal";

import { db, auth } from "@/firebase.config";
import CustomButton from "@/components/CustomButton";
import StarRating from "@/components/icons/StarRating";
import { addDoc, collection } from "firebase/firestore";
import { CustomText } from "@/CustomText";

import { useLanguage } from "@/app/LanguageContext";

const { width } = Dimensions.get("window");

type AddGoalModalProps = {
  visible: boolean;
  categoryId: string;
  onClose: () => void;
  onAdd: (data: any) => void;
};

export default function AddGoalModal({
  visible,
  categoryId,
  onClose,
  onAdd,
}: AddGoalModalProps) {
  const [goalData, setGoalData] = useState({
    name: "",
    author: "",
    director: "",
    rating: 0,
    quote: "",
    note: "",
  });

  // language context
  const { t } = useLanguage();

  const handleRatingChange = (rating: number) => {
    setGoalData({ ...goalData, rating });
  };

  // pushing goal data to firestore
  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("User is not logged in");
        return;
      }

      // Helper function to capitalize words
      const capitalizeWords = (text: string) => {
        return text
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");
      };

      // Format name, author, director with capitalized words
      const formattedName = capitalizeWords(goalData.name);
      const formattedAuthor =
        goalData.author && goalData.author.trim() !== ""
          ? capitalizeWords(goalData.author)
          : null;
      const formattedDirector =
        goalData.director && goalData.director.trim() !== ""
          ? capitalizeWords(goalData.director)
          : null;

      // Base data structure
      const baseData = {
        name: formattedName,
        rating: goalData.rating,
        isDone: false,
        createdAt: new Date(),
        category: categoryId,
        notes: goalData.note ? [goalData.note] : [],
      };

      // Category specific data
      const categorySpecificData = (() => {
        switch (categoryId) {
          case "Movie":
            return {
              ...(formattedDirector !== null
                ? { director: formattedDirector }
                : {}),
            };
          case "Book":
            return {
              ...(formattedAuthor !== null ? { author: formattedAuthor } : {}),
            };
          default:
            return {};
        }
      })();

      // Combine base data with category-specific data
      const dataToSave = {
        ...baseData,
        ...categorySpecificData,
      };

      // Add document to Firestore
      const goalsCollectionRef = collection(db, "users", user.uid, "goals");
      const docRef = await addDoc(goalsCollectionRef, dataToSave);

      if (docRef.id) {
        onAdd({ id: docRef.id, ...dataToSave });
        onClose();
        // Reset form
        setGoalData({
          name: "",
          author: "",
          director: "",
          rating: 0,
          quote: "",
          note: "",
        });
      }
    } catch (error) {
      console.error("Error adding goal: ", error);
    }
  };

  const getModalTitle = () => {
    switch (categoryId) {
      case "Movie":
        return t("addGoalsModal.titleWatch");
      case "Book":
        return t("addGoalsModal.titleRead");
      case "Activity":
        return t("addGoalsModal.titleTry");
      case "Place":
        return t("addGoalsModal.titleGo");
      case "Buy":
        return t("addGoalsModal.titleBuy");
      case "Food":
        return t("addGoalsModal.titleEat");
      default:
        return "";
    }
  };

  return (
    <Modal
      isVisible={visible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropColor="rgba(0, 0, 0, 0.8)"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <CustomText
            style={styles.title}
            type="semibold"
            color="#1E3A5F"
            fontSize={18}
          >
            {getModalTitle()}
          </CustomText>
          <TextInput
            style={styles.input}
            placeholder={
              categoryId === "Book"
                ? t("addGoalsModal.nameBookPlaceholder")
                : categoryId === "Movie"
                ? t("addGoalsModal.nameMoviePlaceholder")
                : t("addGoalsModal.namePlaceholder")
            }
            value={goalData.name}
            onChangeText={(text) => setGoalData({ ...goalData, name: text })}
          />
          {categoryId === "Movie" && (
            <TextInput
              style={styles.input}
              placeholder={t("addGoalsModal.directorPlaceholder")}
              value={goalData.director}
              onChangeText={(text) =>
                setGoalData({ ...goalData, director: text })
              }
            />
          )}
          {categoryId === "Book" && (
            <TextInput
              style={styles.input}
              placeholder={t("addGoalsModal.authorPlaceholder")}
              value={goalData.author}
              onChangeText={(text) =>
                setGoalData({ ...goalData, author: text })
              }
            />
          )}

          <TextInput
            style={styles.input}
            placeholder={t("addGoalsModal.notePlaceholder")}
            value={goalData.note}
            onChangeText={(text) => setGoalData({ ...goalData, note: text })}
          />

          <View style={styles.ratingContainer}>
            <CustomText style={styles.ratingText}>
              {t("addGoalsModal.rateText")}
            </CustomText>
            <StarRating
              rating={goalData.rating}
              onRatingChange={handleRatingChange}
            />
          </View>
          <View style={styles.buttonContainer}>
            <CustomButton
              label={t("addGoalsModal.cancelButtonText")}
              onPress={onClose}
              variant="cancel"
              width="50%"
              height={45}
            />
            <CustomButton
              label={t("addGoalsModal.addButtonText")}
              onPress={handleSave}
              variant="fill"
              width="50%"
              height={45}
              marginLeft={10}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: "#FCFCFC",
    alignItems: "center",
    borderRadius: 8,
    padding: 20,
    width: width > 768 ? "30%" : width - 40,
  },
  title: {
    marginBottom: 30,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#CCCCCC",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: "#F5F8FF",
    color: "#1E3A5F",
    opacity: 0.8,
  },
  ratingContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  ratingText: {
    color: "#1E3A5F",
    opacity: 0.8,
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "50%",
    marginTop: 30,
  },
});
