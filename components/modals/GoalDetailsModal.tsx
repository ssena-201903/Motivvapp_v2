import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  FlatList,
  Image,
} from "react-native";
import { CustomText } from "@/CustomText"; // Özel metin bileşenin
import InfoIcon from "../icons/InfoIcon"; // Bilgi ikonu bileşenin
import { Timestamp } from "firebase/firestore";

import { useLanguage } from "@/app/LanguageContext";
import { ScrollView } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

type GoalDetailsModalProps = {
  visible: boolean;
  onClose: () => void;
  goal: any;
  isPrivate: boolean;
  isNotesVisible: boolean;
};

// function to format date
const formatDate = (timestamp: Timestamp | null) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString("tr-TR");
};

export default function GoalDetailsModal({
  visible,
  onClose,
  goal,
  isPrivate,
  isNotesVisible,
}: GoalDetailsModalProps) {
  const { t, language, setLanguage } = useLanguage();

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <View style={styles.titleContainer}>
            {goal.posterUrl && (
              <Image
                source={
                  goal.posterUrl
                    ? { uri: goal.posterUrl }
                    : require("@/assets/images/logo.png")
                }
                style={styles.poster}
              />
            )}

            <CustomText
              style={styles.title}
              color="#1E3A5F"
              fontSize={12}
              type="semibold"
            >
              {goal.name}
            </CustomText>
          </View>

          {/* scrollable detail content except title */}
          <ScrollView
            contentContainerStyle={styles.scrollableContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Director (if category is Movie) */}
            {goal.category === "Movie" && (
              <View>
                {/* director name */}
                <View style={styles.detailItem}>
                  <CustomText
                    style={styles.detailLabel}
                    color="#1E3A5F"
                    fontSize={14}
                    type="regular"
                  >
                    {t("goalDetails.director")}
                  </CustomText>
                  <CustomText type="medium" color="#333" fontSize={14}>
                    {goal.director || "Unknown"}
                  </CustomText>
                </View>
                {/* plot */}
                <View style={styles.detailItem}>
                  <CustomText
                    style={styles.detailLabel}
                    color="#1E3A5F"
                    fontSize={14}
                    type="regular"
                  >
                    {t("goalDetails.plot")}
                  </CustomText>
                  <CustomText type="medium" color="#333" fontSize={14}>
                    {goal.plot}
                  </CustomText>
                </View>
                {/* actors */}
                <View style={styles.detailItem}>
                  <CustomText
                    style={styles.detailLabel}
                    color="#1E3A5F"
                    fontSize={14}
                    type="regular"
                  >
                    {t("goalDetails.actors")}
                  </CustomText>

                  {goal.actors?.length > 0 ? (
                    <FlatList
                      data={goal.actors}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => (
                        <CustomText
                          style={styles.quoteItem}
                          type="medium"
                          color="#333"
                        >
                          {item}
                        </CustomText>
                      )}
                      showsVerticalScrollIndicator={false}
                    />
                  ) : (
                    <CustomText type="medium" color="#333" fontSize={14}>
                      {t("goalDetails.noActors")}{" "}
                      {/* Eğer boşsa bir mesaj göster */}
                    </CustomText>
                  )}
                </View>

                {/* start year */}
                <View style={styles.detailItem}>
                  <CustomText
                    style={styles.detailLabel}
                    color="#1E3A5F"
                    fontSize={14}
                    type="regular"
                  >
                    {t("goalDetails.startYear")}
                  </CustomText>
                  <CustomText type="medium" color="#333" fontSize={14}>
                    {goal.start_year}
                  </CustomText>
                </View>

                {goal.type === "series" && (
                  <View style={styles.detailItem}>
                    <CustomText
                      style={styles.detailLabel}
                      color="#1E3A5F"
                      fontSize={14}
                      type="regular"
                    >
                      {t("goalDetails.totalSeasons")}
                    </CustomText>
                    <CustomText type="medium" color="#333" fontSize={14}>
                      {goal.totalSeasons}
                    </CustomText>
                  </View>
                )}

                {isPrivate && (
                  <View style={styles.detailItem}>
                    <CustomText
                      style={styles.detailLabel}
                      color="#1E3A5F"
                      fontSize={14}
                      type="regular"
                    >
                      {t("goalDetails.imdbRate")}
                    </CustomText>
                    <CustomText type="medium" color="#333" fontSize={14}>
                      {goal.imdbRate}
                    </CustomText>
                  </View>
                )}

                {isPrivate && (
                  <View style={styles.detailItem}>
                    <CustomText
                      style={styles.detailLabel}
                      color="#1E3A5F"
                      fontSize={14}
                      type="regular"
                    >
                      {t("goalDetails.genres")}
                    </CustomText>

                    {goal.genres?.length > 0 ? (
                      <CustomText
                        style={styles.quoteItem}
                        type="medium"
                        color="#333"
                      >
                        {goal.genres.join(", ")}
                      </CustomText>
                    ) : (
                      <CustomText type="medium" color="#333" fontSize={14}>
                        {t("goalDetails.noGenres")}
                      </CustomText>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Author (if category is Book) */}
            {goal.category === "Book" && (
              <View style={styles.detailItem}>
                <CustomText
                  style={styles.detailLabel}
                  color="#1E3A5F"
                  fontSize={14}
                  type="regular"
                >
                  {t("goalDetails.author")}
                </CustomText>
                <CustomText type="medium" color="#333" fontSize={14}>
                  {goal.author || "Unknown"}
                </CustomText>
              </View>
            )}

            {/* Created At */}
            {isPrivate && (
              <View style={styles.detailItem}>
                <CustomText
                  style={styles.detailLabel}
                  color="#1E3A5F"
                  fontSize={14}
                  type="regular"
                >
                  {t("goalDetails.createdAt")}
                </CustomText>
                <CustomText type="medium" color="#333" fontSize={14}>
                  {formatDate(goal.createdAt)}
                </CustomText>
              </View>
            )}

            {/* Finished At */}
            {isPrivate && (
              <View style={styles.detailItem}>
                <CustomText
                  style={styles.detailLabel}
                  color="#1E3A5F"
                  fontSize={14}
                  type="regular"
                >
                  {t("goalDetails.finishedAt")}
                </CustomText>
                <CustomText type="medium" color="#333" fontSize={14}>
                  {goal.finishedAt ? formatDate(goal.finishedAt) : "-"}
                </CustomText>
              </View>
            )}

            {/* Notes List */}
            {!isNotesVisible && (
              <>
                <CustomText
                  style={styles.sectionTitle}
                  color="#1E3A5F"
                  fontSize={16}
                  type="semibold"
                >
                  {isPrivate
                    ? t("goalDetails.notesPrivate")
                    : `${goal.senderNickname} ${t("goalDetails.notesPublic")}`}
                </CustomText>
                {goal.notes?.length > 0 ? (
                  <FlatList
                    data={goal.notes}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <CustomText
                        style={styles.quoteItem}
                        type="medium"
                        color="#333"
                      >
                        - {item}
                      </CustomText>
                    )}
                    showsVerticalScrollIndicator={false}
                  />
                ) : (
                  <CustomText
                    style={styles.quoteItem}
                    type="medium"
                    color="#333"
                  >
                    {t("goalDetails.noNotesAdded")}
                  </CustomText>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 20,
    maxHeight: 400,
    width: width > 768 ? "30%" : width - 40,
  },
  titleContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  poster: {
    width: 30,
    height: 40,
    marginRight: 10,
    borderRadius: 5,
  },
  scrollableContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    // marginBottom: 15,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  detailLabel: {
    marginRight: 10,
  },
  sectionTitle: {
    marginTop: 15,
    marginBottom: 10,
  },
  quoteItem: {
    fontStyle: "italic",
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#1E3A5F",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
