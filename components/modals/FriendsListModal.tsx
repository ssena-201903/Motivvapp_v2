import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { CustomText } from "@/CustomText";
import { useLanguage } from "@/app/LanguageContext";
import CustomButton from "../CustomButton";
import BoxIcon from "@/components/icons/BoxIcon";
import { auth, db } from "@/firebase.config";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { showMessage } from "react-native-flash-message";

const { width } = Dimensions.get("window");

type Props = {
  isFriendsModalVisible: boolean;
  onClose: () => void;
  goal: any;
};

type Friend = {
  id: string;
  nickname: string;
  selected: boolean;
};

export default function FriendsListModal({
  isFriendsModalVisible,
  onClose,
  goal,
}: Props) {
  const { t } = useLanguage();
  const [recommendComment, setRecommendComment] = useState<string>("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotesAdded, setIsNotesAdded] = useState<boolean>(false);

  useEffect(() => {
    if (isFriendsModalVisible) {
      fetchFriends();
    }
  }, [isFriendsModalVisible]);

  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      // get all friendships where the current user is a participant
      const friendshipsQuery = query(
        collection(db, "friendships"),
        where("participants", "array-contains", userId)
      );

      const friendshipsSnapshot = await getDocs(friendshipsQuery);
      const fetchedFriends: Friend[] = [];

      for (const doc of friendshipsSnapshot.docs) {
        const friendshipData = doc.data();

        // Kullanıcı gönderen mi yoksa alıcı mı kontrol et
        if (friendshipData.senderId === userId) {
          // Kullanıcı gönderici ise, alıcı bilgilerini kullan
          fetchedFriends.push({
            id: friendshipData.receiverId,
            nickname: friendshipData.receiverNickname,
            selected: false,
          });
        } else {
          // Kullanıcı alıcı ise, gönderici bilgilerini kullan
          fetchedFriends.push({
            id: friendshipData.senderId,
            nickname: friendshipData.senderNickname,
            selected: false,
          });
        }
      }

      setFriends(fetchedFriends);
    } catch (error) {
      console.error("Arkadaş getirme hatası:", error);
      showMessage({
        message: "Arkadaşları yüklenirken bir hata oluştu!",
        type: "warning",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    const updatedFriends = friends.map((friend) => {
      if (friend.id === friendId) {
        return { ...friend, selected: !friend.selected };
      }
      return friend;
    });
    setFriends(updatedFriends);
  };

  const handleSendRecommendation = async () => {
    try {
      const selectedFriends = friends.filter((friend) => friend.selected);

      if (selectedFriends.length === 0) {
        showMessage({
          message: "En az bir arkadaş seçmelisiniz!",
          type: "danger",
        });
        return;
      }

      const userId = auth.currentUser?.uid;
      if (!userId) return;

      for (const friend of selectedFriends) {
        // Sadece bir array-contains filtresi kullanıyoruz
        const friendshipQuery = query(
          collection(db, "friendships"),
          where("participants", "array-contains", userId)
        );

        const friendshipSnapshot = await getDocs(friendshipQuery);

        // JavaScript filter ve find kullanarak arkadaşı içeren belgeyi buluyoruz
        const matchingFriendship = friendshipSnapshot.docs.find((doc) =>
          doc.data().participants.includes(friend.id)
        );

        if (matchingFriendship) {
          const friendshipRef = matchingFriendship.ref;

          // add recommendation to the subcollection
          const recommendationRef = collection(
            friendshipRef,
            "recommendations"
          );

          await addDoc(recommendationRef, {
            name: goal.name,
            category: goal.category,

            ...(goal.category === "Book" && {
              readingStatus: "not started",
              author: goal.author,
            }),

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

            ...(goal.type === "series" && {
              totalSeasons: goal.totalSeasons,
            }),

            comment: recommendComment,
            rating: goal.rating,
            receiverId: friend.id,
            receiverNickname: friend.nickname,
            isSeen: false,
            isAdded: false,
            isNotesAdded,
            ...(isNotesAdded && { notes: goal.notes }),
            createdAt: new Date(),
          });
        }
      }

      showMessage({
        message: "Arkadaşlarına tavsiyen gönderildi!",
        type: "success",
      });

      handleCloseModal();
    } catch (error) {
      console.error("Tavsiye gönderme hatası:", error);
      showMessage({
        message: "Tavsiye gönderilirken bir hata oluştu!",
        type: "danger",
      });
    }
  };

  const handleCloseModal = () => {
    onClose();
    setRecommendComment("");
  };

  const handleModelContentPress = (event: any) => {
    event.stopPropagation();
  };

  return (
    <Modal
      visible={isFriendsModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCloseModal}
    >
      <View style={styles.modalContainer}>
        <Pressable
          style={styles.modalContent}
          onPress={handleModelContentPress}
        >
          <CustomText
            style={styles.modalTitle}
            color="#1E3A5F"
            fontSize={18}
            type="bold"
          >
            {"Arkadaşlarına Tavsiye Et"}
          </CustomText>

          <CustomText
            color="#666"
            fontSize={14}
            type="medium"
            style={styles.recommendationTitleText}
          >
            {goal.name}
          </CustomText>

          {/* Yorum alanı */}
          <View style={styles.commentInputContainer}>
            <CustomText color="#1E3A5F" fontSize={14} type="semibold">
              {"Yorum Ekle"}
            </CustomText>
            <TextInput
              style={styles.commentInput}
              placeholder={"Yorumunuzu buraya yazın..."}
              value={recommendComment}
              onChangeText={setRecommendComment}
              placeholderTextColor={"#999"}
              multiline
            />
          </View>

          <TouchableOpacity
            style={styles.addNotesContainer}
            onPress={() => setIsNotesAdded((prev) => !prev)}
          >
            <BoxIcon
              size={20}
              color={isNotesAdded ? "#1E3A5F" : "#666"}
              variant={isNotesAdded ? "fill" : "outlined"}
            />
            <CustomText
              color="#333"
              fontSize={14}
              type="medium"
              style={{ marginLeft: 10 }}
            >
              Notlarını Paylaş
            </CustomText>
          </TouchableOpacity>

          <CustomText
            color="#1E3A5F"
            fontSize={14}
            type="semibold"
            style={styles.friendsTitle}
          >
            {"Arkadaşlarını seç"}
          </CustomText>

          {isLoading ? (
            <ActivityIndicator size="large" color="#1E3A5F" />
          ) : (
            <FlatList
              data={friends}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.friendItem}
                  onPress={() => toggleFriendSelection(item.id)}
                >
                  <BoxIcon
                    size={20}
                    color={item.selected ? "#1E3A5F" : "#666"}
                    variant={item.selected ? "fill" : "outlined"}
                  />
                  <CustomText
                    color={item.selected ? "#333" : "#333"}
                    fontSize={14}
                    type={item.selected ? "semibold" : "medium"}
                  >
                    {item.nickname}
                  </CustomText>
                </TouchableOpacity>
              )}
              style={styles.friendsList}
              ListEmptyComponent={
                <CustomText
                  color="#666"
                  fontSize={14}
                  type="regular"
                  style={styles.emptyListText}
                >
                  {t("noFriendsFound") || "Arkadaş bulunamadı"}
                </CustomText>
              }
            />
          )}

          <View style={styles.modalButtons}>
            <CustomButton
              onPress={handleCloseModal}
              label="İptal"
              variant="cancel"
              width="50%"
              height={40}
            />
            <CustomButton
              onPress={handleSendRecommendation}
              label="Gönder"
              variant="fill"
              width="50%"
              height={40}
            />
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    width: width > 600 ? 500 : width - 40,
    maxHeight: 500,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
  },
  recommendationTitleText: {
    marginBottom: 20,
    textAlign: "center",
  },
  commentInputContainer: {
    marginBottom: 15,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
    marginTop: 5,
    minHeight: 80,
    textAlignVertical: "top",
  },
  addNotesContainer: {
    marginBottom: 15,
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
  friendsTitle: {
    marginBottom: 10,
  },
  friendsList: {
    maxHeight: 200,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 10,
    gap: 10,
  },
  emptyListText: {
    textAlign: "center",
    marginVertical: 20,
    fontStyle: "italic",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    gap: 10,
    width: "80%",
    alignSelf: "center",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: "#1E3A5F",
  },
});
