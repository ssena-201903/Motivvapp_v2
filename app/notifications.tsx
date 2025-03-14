import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { CustomText } from "@/CustomText";
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase.config";
import FriendRequestCard from "@/components/cards/FriendRequestCard";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { showMessage } from "react-native-flash-message";
import NotificationRequestAcceptCard from "@/components/cards/NotificationRequestAcceptCard";
import RecommendationCard from "@/components/cards/RecommendationCard";

import { useLanguage } from "@/app/LanguageContext";

const { width } = Dimensions.get("window");

export default function NotificationPage() {
  const [friendRequests, setFriendRequests] = useState([]);
  const [recommendations, setRecommendations] = useState<any>([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = auth.currentUser?.uid;

  const [isFriendRequestsLoading, setFriendRequestsLoading] = useState(false);
  const [isRecommendationsLoading, setRecommendationsLoading] = useState(false);
  const [isNotificationsLoading, setNotificationsLoading] = useState(false);

  // language context
  const { t } = useLanguage();

  useEffect(() => {
    if (!currentUserId) return;

    // 1️⃣ Arkadaşlık istekleri için snapshot listener
    const friendRequestsRef = collection(db, "friendRequests");
    const friendRequestsQuery = query(
      friendRequestsRef,
      where("receiverId", "==", currentUserId),
      where("status", "==", "pending")
    );

    const unsubscribeFriendRequests = onSnapshot(
      friendRequestsQuery,
      (snapshot) => {
        const requests: any = [];
        snapshot.forEach((doc) => {
          requests.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setFriendRequests(requests);
        setFriendRequestsLoading(true);
      },
      (error) => {
        console.error("Error in friend requests listener:", error);
        showMessage({
          message: "Arkadaşlık istekleri yüklenirken bir hata oluştu!",
          type: "danger",
        });
        // setFriendRequestsLoading(false);
      }
    );

    // 2️⃣ Bildirimler için snapshot listener
    const notificationsRef = collection(db, "notifications");
    const notificationsQuery = query(
      notificationsRef,
      where("relatedUserId", "==", currentUserId)
    );

    const unsubscribeNotifications = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notificationsData: any = [];
        snapshot.forEach((doc) => {
          notificationsData.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setNotifications(notificationsData);
        setNotificationsLoading(true);
      },
      (error) => {
        console.error("Error in notifications listener:", error);
        showMessage({
          message: "Bildirimler yüklenirken bir hata oluştu!",
          type: "danger",
        });
        // setLoading(false);
      }
    );

    // 3️⃣ Tavsiyeler için snapshot listener
    const loadRecommendations = async () => {
      try {
        const friendshipsRef = collection(db, "friendships");
        const friendshipsQuery = query(
          friendshipsRef,
          where("participants", "array-contains", currentUserId)
        );

        const friendshipsSnapshot = await getDocs(friendshipsQuery);
        console.log("friendshipsSnapshot:", friendshipsSnapshot);
        const recommendationsData: any = [];

        for (const friendshipDoc of friendshipsSnapshot.docs) {
          const friendshipData = friendshipDoc.data();
          const recommendationsRef = collection(
            friendshipDoc.ref,
            "recommendations"
          );
          const recommendationsQuery = query(
            recommendationsRef,
            where("receiverId", "==", currentUserId)
          );

          const recommendationsSnapshot = await getDocs(recommendationsQuery);
          recommendationsSnapshot.forEach((doc) => {
            recommendationsData.push({
              id: doc.id,
              friendshipId: friendshipDoc.id,
              ...doc.data(),
              senderNickname:
                friendshipData.senderId === currentUserId
                  ? friendshipData.receiverNickname
                  : friendshipData.senderNickname,
            });
          });
        }

        // console.log("recommendationsData:", recommendationsData);
        setRecommendations(recommendationsData);
        console.log("recommendationsData:", recommendationsData);
        // console.log("recommendationsData:", recommendations);
      } catch (error) {
        console.error("Error loading recommendations:", error);
        showMessage({
          message: "Tavsiyeler yüklenirken bir hata oluştu!",
          type: "danger",
        });
      } finally {
        setRecommendationsLoading(true);
      }
    };

    loadRecommendations();

    // Cleanup fonksiyonu (Component unmount olunca dinleyicileri kaldır)
    return () => {
      unsubscribeFriendRequests();
      unsubscribeNotifications();
    };
  }, [currentUserId]);

  useEffect(() => {
    if (
      isFriendRequestsLoading &&
      isRecommendationsLoading &&
      isNotificationsLoading
    ) {
      setLoading(false);
    }
  }, [
    isFriendRequestsLoading,
    isRecommendationsLoading,
    isNotificationsLoading,
  ]);

  // close recommendation modal
  const handleCloseRecommendationCard = async (
    friendshipId: string,
    recommendationId: string
  ) => {
    try {
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) {
        console.error("Kullanıcı oturum açmamış.");
        return;
      }

      console.log("Current Method Inputs:", {
        currentUserId,
        friendshipId,
        recommendationId,
      });

      // Mevcut recommendations state'ini logla
      console.log("Current Recommendations State:", recommendations);

      // Belirli bir tavsiyeyi bul
      const specificRecommendation = recommendations.find(
        (rec: any) => rec.id === recommendationId
      );

      console.log("Specific Recommendation:", specificRecommendation);

      if (!specificRecommendation) {
        console.error("Tavsiye state'de bulunamadı.");
        return;
      }

      const recommendationRef = doc(
        db,
        "friendships",
        friendshipId,
        "recommendations",
        recommendationId
      );

      console.log("Recommendation Reference Path:", recommendationRef.path);

      const recommendationDoc = await getDoc(recommendationRef);

      console.log(
        "Recommendation Document Exists:",
        recommendationDoc.exists()
      );
      console.log("Recommendation Document Data:", recommendationDoc.data());

      if (!recommendationDoc.exists()) {
        console.error("Tavsiye belgesi bulunamadı.");

        // State'den de kaldır
        setRecommendations((prev: any) =>
          prev.filter((rec: any) => rec.id !== recommendationId)
        );

        return;
      }

      const recommendationData = recommendationDoc.data();

      // Firestore'daki belgeyi güncelle
      await updateDoc(recommendationRef, {
        isSeen: true,
      });

      console.log("Firestore belgesi başarıyla güncellendi.");

      // State'i güncelle
      setRecommendations((prev: any) =>
        prev.filter((rec: any) => rec.id !== recommendationId)
      );
    } catch (error) {
      console.error("Tavsiye kartı kapatılırken hata oluştu:", error);
      console.error("Hata Detayları:", JSON.stringify(error, null, 2));
      showMessage({
        message: "Tavsiye kartı kapatılırken hata oluştu!",
        type: "danger",
      });
    }
  };

  const handleRequestAction = (requestId: string) => {
    // Remove the request from the list
    setFriendRequests(
      friendRequests.filter((req: any) => req.id !== requestId)
    );
  };

  const handleRemoveNotification = async (notificationId: string) => {
    // console.log("Silme işlemi başlatıldı. Notification ID:", notificationId);

    try {
      const notificationRef = doc(db, "notifications", notificationId);

      const snapshot = await getDoc(notificationRef);
      if (!snapshot.exists()) {
        console.log("Bildirim zaten yok. Firestore'dan silinmiş olabilir.");
        return;
      }

      await deleteDoc(notificationRef);
      // console.log("Bildirim Firestore'dan başarıyla silindi.");

      // State'ten de kaldır
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notif: any) => notif.id !== notificationId)
      );
    } catch (error) {
      // console.error("Bildirim silinirken hata oluştu:", error);
      showMessage({
        message: "Bildirim silinirken bir hata oluştu!",
        type: "danger",
      });
    }
  };

  const filteredRecommendations = recommendations.filter(
    (recommendation: any) => !recommendation.isSeen && !recommendation.isAdded
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A5F" />
        </View>
      ) : friendRequests.length > 0 ||
        notifications.length > 0 ||
        filteredRecommendations.length > 0 ? (
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionContainer}>
            {friendRequests.map((request: any) => (
              <FriendRequestCard
                key={request.id}
                request={request}
                onAccept={() => handleRequestAction(request.id)}
                onReject={() => handleRequestAction(request.id)}
              />
            ))}
          </View>

          <View style={styles.sectionContainer}>
            {notifications.map((notification: any) => (
              <NotificationRequestAcceptCard
                key={notification.id}
                item={notification}
                onRead={() => handleRemoveNotification(notification.id)}
              />
            ))}
          </View>

          {/* Tavsiyeler */}
          <View style={styles.sectionContainer}>
            {filteredRecommendations.map((recommendation: any) => (
              <RecommendationCard
                key={recommendation.id}
                goal={recommendation}
                onClose={() =>
                  handleCloseRecommendationCard(
                    recommendation.friendshipId,
                    recommendation.id
                  )
                }
              />
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <CustomText type="medium" fontSize={14} color="#666">
            {t("notificationPage.noNotifications")}
          </CustomText>
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  sectionContainer: {
    paddingVertical: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
