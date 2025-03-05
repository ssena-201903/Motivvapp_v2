import { CustomText } from "@/CustomText";
import { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { db, auth } from "@/firebase.config";
import {
  collection,
  query,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  where,
  Timestamp,
} from "firebase/firestore";
import PeopleIcon from "@/components/icons/PeopleIcon";
import PersonIcon from "@/components/icons/PersonIcon";
import FriendCard from "@/components/cards/FriendCard";
import FriendRequestModal from "@/components/modals/FriendRequestModal";
import { showMessage } from "react-native-flash-message";
import ConfirmationModal from "@/components/modals/ConfirmationModal";

const { width } = Dimensions.get("screen");

type Friend = {
  id: string;
  userIds: string[];
  type: "accepted";
};

type FriendRequest = {
  id: string;
  senderId: string;
  receiverId: string;
  status: "pending";
  type: "sent";
};

export default function FriendsPage() {
  const [isRequestModalVisible, setIsRequestModalVisible] =
    useState<boolean>(false);
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    useState<boolean>(false);
  const [friendToRemove, setFriendToRemove] = useState<string | null>(null);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    console.log("loadData");
    if (!currentUserId) return;

    try {
      await Promise.all([loadFriendships(), loadSentRequests()]);
    } catch (error) {
      console.error("Error loading data:", error);
      showMessage({
        message: "Veriler yüklenirken bir hata oluştu!",
        type: "danger",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUserId]);

  const loadFriendships = async () => {
    try {
      const friendsRef = collection(db, "friendships");
      const q = query(
        friendsRef,
        where("isConnected", "==", true),
        where("participants", "array-contains", currentUserId)
      );

      const querySnapshot = await getDocs(q);
      const friendsList: any = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(data);

        const friendId = data.participants.find(
          (id: string) => id !== currentUserId
        );

        let displayNickname;
        if (data.senderId === currentUserId) {
          displayNickname = data.receiverNickname;
        } else {
          displayNickname = data.senderNickname;
        }

        console.log("DİSPLAY NAME:", displayNickname);

        friendsList.push({
          id: doc.id,
          friendId,
          displayNickname,
          senderId: data.senderId,
          receiverId: data.receiverId,
          senderNickname: data.senderNickname,
          receiverNickname: data.receiverNickname,
          isConnected: data.isConnected,
          createdAt: data.createdAt,
        });
      });

      setFriends(friendsList);
    } catch (error) {
      console.error("Error loading friendships:", error);
      throw error;
    }
  };

  const loadSentRequests = async () => {
    try {
      const requestsRef = collection(db, "friendRequests");
      const q = query(
        requestsRef,
        where("senderId", "==", currentUserId),
        where("status", "==", "pending")
      );

      const querySnapshot = await getDocs(q);
      const requestsList: any = [];

      querySnapshot.forEach((doc) => {
        requestsList.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setSentRequests(requestsList);
    } catch (error) {
      console.error("Error loading sent requests:", error);
      throw error;
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, "friendRequests", requestId));

      setSentRequests((prevRequests) =>
        prevRequests.filter((req) => req.id !== requestId)
      );

      showMessage({
        message: "İstek iptal edildi",
        type: "success",
      });
    } catch (error) {
      console.error("Error canceling request:", error);
      showMessage({
        message: "İstek iptal edilirken bir hata oluştu!",
        type: "danger",
      });
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    setFriendToRemove(friendshipId);
    setIsConfirmationModalVisible(true);
  };

  const confirmRemoveFriend = async () => {
    if (!friendToRemove) return;
    
    try {
      await deleteDoc(doc(db, "friendships", friendToRemove));
  
      setFriends((prevFriends) =>
        prevFriends.filter((friend) => friend.id !== friendToRemove)
      );
  
      showMessage({
        message: "Arkadaş silindi",
        type: "success",
      });
    } catch (error) {
      console.error("Error removing friend:", error);
      showMessage({
        message: "Arkadaş silinirken bir hata oluştu!",
        type: "danger",
      });
    } finally {
      setIsConfirmationModalVisible(false);
      setFriendToRemove(null);
    }
  };

  const handleViewRequestModal = () => {
    setIsRequestModalVisible(true);
  };

  const showCantMakeGroup = () => {
    showMessage({
      message: "Grup oluşturma özelliği çok yakında sizlerle!",
      type: "info",
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#1E3A5F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleViewRequestModal}
        >
          <PersonIcon size={18} color="white" />
          <CustomText type="medium" color="white">
            Arkadaş Ekle
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => showCantMakeGroup()}
        >
          <PeopleIcon size={18} color="white" />
          <CustomText type="medium" color="white">
            Grup Ekle
          </CustomText>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A5F" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {sentRequests.length > 0 && (
            <View style={styles.sectionContainer}>
              <CustomText
                type="semibold"
                fontSize={16}
                color="#1E3A5F"
                style={styles.sectionTitle}
              >
                Giden İstekler
              </CustomText>
              {sentRequests.map((request) => (
                <FriendCard
                  key={request.id}
                  item={request}
                  type="request"
                  onAction={handleCancelRequest}
                />
              ))}
            </View>
          )}

          {friends.length > 0 && (
            <View style={styles.sectionContainer}>
              <CustomText
                type="semibold"
                fontSize={16}
                color="#1E3A5F"
                style={styles.sectionTitle}
              >
                Arkadaşlarım
              </CustomText>
              {friends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  item={friend}
                  type="friend"
                  onAction={handleRemoveFriend}
                />
              ))}
            </View>
          )}

          {friends.length === 0 && sentRequests.length === 0 && (
            <View style={styles.emptyContainer}>
              <CustomText style={styles.emptyText} type="medium" fontSize={14} color="#666">
                Henüz bir arkadaşınız veya gönderilmiş bir isteğiniz
                bulunmamaktadır.
              </CustomText>
            </View>
          )}
        </ScrollView>
      )}

      <FriendRequestModal
        visible={isRequestModalVisible}
        onClose={() => {
          setIsRequestModalVisible(false);
          loadData();
        }}
      />
      <ConfirmationModal
        visible={isConfirmationModalVisible}
        title="Arkadaş Silme"
        message="Arkadaşı silmek istediginizden emin misiniz?"
        onCancel={() => setIsConfirmationModalVisible(false)}
        onConfirm={confirmRemoveFriend}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCFCFC",
    position: "relative",
    alignItems: "center",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
  },
  addButton: {
    backgroundColor: "#1E3A5F",
    borderRadius: 8,
    width: 150,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  scrollContainer: {
    flex: 1,
    marginTop: 40,
    width: width > 768 ? width - 860 : width - 40,
    // backgroundColor: "yellow",
  },
  contentContainer: {
    paddingBottom: 80,
    paddingHorizontal: 20,
    // backgroundColor: "green",
  },
  emptyText: {
    alignContent: "center",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginLeft: 20,
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
    padding: 20,
  },
});
