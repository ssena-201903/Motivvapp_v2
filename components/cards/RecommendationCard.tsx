import React, { useState } from "react";
import { View, StyleSheet, Dimensions, Pressable, Image } from "react-native";
import { CustomText } from "@/CustomText"; // Özel metin bileşeniniz
import CloseIcon from "../icons/CloseIcon";
import StarRating from "../icons/StarRating";
import { format, isToday, isYesterday } from "date-fns";
import { tr } from "date-fns/locale";
import CustomButton from "@/components/CustomButton";
import GoalDetailsModal from "@/components/modals/GoalDetailsModal";

const { width } = Dimensions.get("window");

type RecommendationCardProps = {
  goal: any;
  onClose: (id: string) => void;
};

export default function RecommendationCard({
  goal,
  onClose,
}: RecommendationCardProps) {
  const [isDetailsModalVisible, setIsDetailsModalVisible] =
    useState<boolean>(false);

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

  // console.log("Goal: ", goal);
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
          🍿 Film • {formattedDate}
        </CustomText>
      )}
      {goal.category === "Movie" && goal.type === "series" && (
        <CustomText
          style={styles.categoryTitle}
          type="regular"
          fontSize={14}
          color="#999"
        >
          📺 Dizi • {formattedDate}
        </CustomText>
      )}

      {goal.category === "Book" && (
        <CustomText
          style={styles.categoryTitle}
          type="regular"
          fontSize={14}
          color="#999"
        >
          📖 Kitap • {formattedDate}
        </CustomText>
      )}
      {goal.category === "Food" && (
        <CustomText
          style={styles.categoryTitle}
          type="regular"
          fontSize={14}
          color="#999"
        >
          🍔 Yemek • {formattedDate}
        </CustomText>
      )}
      {goal.category === "Try" && (
        <CustomText
          style={styles.categoryTitle}
          type="regular"
          fontSize={14}
          color="#999"
        >
          🪂 Aktivite • {formattedDate}
        </CustomText>
      )}
      {goal.category === "Place" && (
        <CustomText
          style={styles.categoryTitle}
          type="regular"
          fontSize={14}
          color="#999"
        >
          🚗 Seyahat • {formattedDate}
        </CustomText>
      )}
      {goal.category === "Buy" && (
        <CustomText
          style={styles.categoryTitle}
          type="regular"
          fontSize={14}
          color="#999"
        >
          💵 Alışveriş • {formattedDate}
        </CustomText>
      )}

      <View style={styles.nameContainer}>
        <CustomText type="semibold" fontSize={16} color="#1E3A5F">
          {goal.senderNickname}
        </CustomText>
        <CustomText type="regular" fontSize={14} color="#666">
          {"tavsiye ediyor"} 👍🏻
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
          Yorum:
        </CustomText>
        <CustomText type="regular" fontSize={14} color="#333">
          {goal.comment}
        </CustomText>
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          label="Detaylar"
          onPress={handleDetailsPress}
          width={"50%"}
          height={40}
          variant="cancel"
        />
        <CustomButton
          label="Listene Ekle"
          onPress={() => {}}
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
    backgroundColor: "#fff",
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
