import React, { useState } from "react";
import { View, StyleSheet, Dimensions, Pressable, Image } from "react-native";
import { CustomText } from "@/CustomText"; // Özel metin bileşeniniz
import CloseIcon from "../icons/CloseIcon";
import StarRating from "../icons/StarRating";
import { format, isToday, isYesterday } from "date-fns";
import { tr } from "date-fns/locale";
import CustomButton from "@/components/CustomButton";
import GoalDetailsModal from "@/components/modals/GoalDetailsModal";

import { auth, db } from "@/firebase.config";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";

import { useLanguage } from "@/app/LanguageContext";
import { showMessage } from "react-native-flash-message";

const { width } = Dimensions.get("window");

type RecommendationCardProps = {
  goal: any;
  onClose: (id: string) => void;
  onAdd: (data: any) => void;
};

export default function RecommendationCard({
  goal,
  onClose,
  onAdd,
}: RecommendationCardProps) {
  const [isDetailsModalVisible, setIsDetailsModalVisible] =
    useState<boolean>(false);

  const { t } = useLanguage();

  const createdAt = goal.createdAt.toDate(); // convert Timestamp to Date
  let formattedDate = "";

  if (isToday(createdAt)) {
    formattedDate = format(createdAt, "HH:mm", { locale: tr }); // if it's today, show only time
  } else if (isYesterday(createdAt)) {
    formattedDate = "Dün"; // show "Yesterday"
  } else {
    formattedDate = format(createdAt, "dd.MM.yyyy", { locale: tr }); // if it's not today or yesterday, show full date
  }

  const handleDetailsPress = () => {
    setIsDetailsModalVisible(true);
  };

  const handleAddPersonalList = async () => {
    try {
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) return;
  
      const userGoalRef = collection(db, "users", currentUserId, "goals");
  
      const newGoal = {
        name: goal.name,
        category: goal.category,
  
        // Add Book specific fields
        ...(goal.category === "Book" && {
          readingStatus: "not started",
          author: goal.author,
        }),
  
        // Add Movie specific fields
        ...(goal.category === "Movie" && {
          director: goal.director,
          actors: goal.actors,
          genres: goal.genres,
          imdbRate: goal.imdbRate,
          plot: goal.plot,
          runtime: goal.runtime,
          start_year: goal.start_year,
          type: goal.type,
          posterUrl: goal.posterUrl,
        }),
  
        // Add Series specific fields if type is series
        ...(goal.type === "series" && {
          totalSeasons: goal.totalSeasons,
        }),
  
        rating: 0,
        createdAt: new Date(),
        finishedAt: null,
        notes: [],
        isDone: false,
        isAdvice: false,
      };
  
      await addDoc(userGoalRef, newGoal);
      showMessage({ message: "Kendi hedef listene başarıyla eklendi", type: "success" });
  
      const recommendationRef = doc(
        db,
        "friendships",
        goal.friendshipId,
        "recommendations",
        goal.id
      );
  
      // Update isAdded field to true
      await updateDoc(recommendationRef, {
        isAdded: true,
      });
  
      // onAdd prop'unu çağırarak NotificationPage'e bilgi ver
      onAdd({ id: goal.id, friendshipId: goal.friendshipId });
    } catch (error) {
      console.error("Error adding personal goal: ", error);
      showMessage({ message: "Tavsiye ekleme hatası", type: "danger" });
    }
  };

  return (
    <View style={styles.card}>
      <Pressable style={styles.closeButton} onPress={() => onClose(goal.id)}>
        <CloseIcon size={20} color="#666" />
      </Pressable>

      {goal.category === "Movie" && goal.type === "movie" && (
        <CustomText
          style={styles.categoryTitle}
          type="regular"
          fontSize={14}
          color="#999"
        >
          🍿 {t("recommendation.movieText")} • {formattedDate}
        </CustomText>
      )}
      {goal.category === "Movie" && goal.type === "series" && (
        <CustomText
          style={styles.categoryTitle}
          type="regular"
          fontSize={14}
          color="#999"
        >
          📺 {t("recommendation.serieText")} • {formattedDate}
        </CustomText>
      )}

      {goal.category === "Book" && (
        <CustomText
          style={styles.categoryTitle}
          type="regular"
          fontSize={14}
          color="#999"
        >
          📖 {t("recommendation.bookText")} • {formattedDate}
        </CustomText>
      )}
      {goal.category === "Food" && (
        <CustomText
          style={styles.categoryTitle}
          type="regular"
          fontSize={14}
          color="#999"
        >
          🍔 {t("recommendation.foodText")} • {formattedDate}
        </CustomText>
      )}
      {goal.category === "Try" && (
        <CustomText
          style={styles.categoryTitle}
          type="regular"
          fontSize={14}
          color="#999"
        >
          🪂 {t("recommendation.activityText")} • {formattedDate}
        </CustomText>
      )}
      {goal.category === "Place" && (
        <CustomText
          style={styles.categoryTitle}
          type="regular"
          fontSize={14}
          color="#999"
        >
          🚗 {t("recommendation.placeText")} • {formattedDate}
        </CustomText>
      )}
      {goal.category === "Buy" && (
        <CustomText
          style={styles.categoryTitle}
          type="regular"
          fontSize={14}
          color="#999"
        >
          💵 {t("recommendation.shoppingText")} • {formattedDate}
        </CustomText>
      )}

      <View style={styles.nameContainer}>
        <CustomText type="semibold" fontSize={16} color="#1E3A5F">
          {goal.senderNickname}
        </CustomText>
        <CustomText type="regular" fontSize={14} color="#666">
          {t("recommendation.recommendYou")} 👍🏻
        </CustomText>
      </View>

      <View style={styles.goalContainer}>
        {goal.category === "Movie" && (
          <Image
            source={
              goal.posterUrl
                ? { uri: goal.posterUrl }
                : require("@/assets/images/logo.png")
            }
            style={styles.poster}
          />
        )}
        <View style={styles.goalInfo}>
          <View style={styles.topContainer}>
            <CustomText type="bold" fontSize={18} color="#1E3A5F">
              {goal.name}
            </CustomText>
            {goal.category === "Movie" && (
              <CustomText type="regular" fontSize={14} color="#666">
                Imdb: {goal.imdbRate}
              </CustomText>
            )}
          </View>

          <View>
            <StarRating rating={goal.rating} onRatingChange={() => {}} />
          </View>
        </View>
      </View>

      <View style={styles.commentContainer}>
        <CustomText type="bold" fontSize={14} color="#1E3A5F">
          {goal.senderNickname} {t("goalDetails.comment")}:
        </CustomText>
        <CustomText
          type="regular"
          fontSize={14}
          color="#333"
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {goal.comment}
        </CustomText>
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          label={t("recommendation.detailsButtonText")}
          onPress={handleDetailsPress}
          width={"50%"}
          height={40}
          variant="cancel"
        />
        <CustomButton
          label={t("recommendation.saveButtonText")}
          onPress={handleAddPersonalList}
          width={"50%"}
          height={40}
          variant="fill"
        />
      </View>

      <GoalDetailsModal
        visible={isDetailsModalVisible}
        onClose={() => setIsDetailsModalVisible(false)}
        goal={goal}
        isPrivate={false}
        isNotesVisible={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FDFDFD",
    borderWidth: 1,
    borderColor: "#E8EFF5",
    width: width > 768 ? 400 : width - 40,
    borderRadius: 8,
    padding: 20,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  categoryTitle: {
    marginBottom: 8,
  },
  nameContainer: {
    marginTop: 16,
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  poster: {
    width: 60,
    height: 100,
    marginRight: 15,
    borderRadius: 4,
  },
  topContainer: {
    gap: 4,
  },
  goalContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  goalInfo: {
    flex: 1,
    justifyContent: "space-between",
    height: "100%",
    // backgroundColor: "yellow",
  },
  buttonContainer: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  commentContainer: {
    marginTop: 20,
    gap: 10,
  },
});
