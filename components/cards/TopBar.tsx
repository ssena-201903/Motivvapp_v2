import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { CustomText } from "@/CustomText";
import { router, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import ProfileModal from "../modals/ProfileModal";
import { auth } from "@/firebase.config";
import NotificationIcon from "@/components/icons/NotificationIcon";
import MenuIcon from "@/components/icons/MenuIcon";
import SparklesIcon from "@/components/icons/SparklesIcon";

import { db } from "@/firebase.config";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { useLanguage } from "@/app/LanguageContext";

const { width } = Dimensions.get("window");

type Props = {
  onDiamondPress: () => void;
  onDatePress: () => void;
};

export default function TopBar({ onDiamondPress, onDatePress }: Props) {
  const userId = auth.currentUser?.uid;
  const [dateMonth, setDateMonth] = useState<string>("");
  const [dateDay, setDateDay] = useState<string>("");
  const [dateDayName, setDateDayName] = useState<string>("");
  const router = useRouter();

  const [unreadFriendRequests, setUnreadFriendRequests] = useState<number>(0);
  const [unreadRecommendations, setUnreadRecommendations] = useState<number>(0);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  // language context
  const { t } = useLanguage();

  useEffect(() => {
    if (!userId) return;
  
    // 📌 1️⃣ Okunmamış normal bildirimler (notifications)
    const notificationsRef = collection(db, "notifications");
    const unreadNotificationsQuery = query(
      notificationsRef,
      where("relatedUserId", "==", userId),
    );
  
    const unsubscribeNotifications = onSnapshot(unreadNotificationsQuery, (snapshot) => {
      setUnreadNotifications(snapshot.size);
    }, (error) => {
      console.error("Notifications listener error:", error);
    });
  
    // 📌 2️⃣ Okunmamış arkadaşlık istekleri (friendRequests)
    const friendRequestsRef = collection(db, "friendRequests");
    const unreadFriendRequestsQuery = query(
      friendRequestsRef,
      where("receiverId", "==", userId),
    );
  
    const unsubscribeFriendRequests = onSnapshot(unreadFriendRequestsQuery, (snapshot) => {
      setUnreadFriendRequests(snapshot.size);
    }, (error) => {
      console.error("Friend requests listener error:", error);
    });
  
    // 📌 3️⃣ Okunmamış tavsiyeler (recommendations)
    const friendshipsRef = collection(db, "friendships");
    const friendshipsQuery = query(
      friendshipsRef,
      where("participants", "array-contains", userId)
    );
  
    const unsubscribeFriendships = onSnapshot(friendshipsQuery, (friendshipsSnapshot) => {
      let unsubscribers: (() => void)[] = [];
      
      // Her değişiklikte önceki dinleyicileri temizle ve yeniden başlat
      unsubscribers.forEach(unsub => unsub());
      unsubscribers = [];
      
      let recommendationListeners = friendshipsSnapshot.docs.map(friendshipDoc => {
        const recommendationsRef = collection(friendshipDoc.ref, "recommendations");
        const recommendationsQuery = query(
          recommendationsRef,
          where("receiverId", "==", userId),
          where("isSeen", "==", false),
          where("isAdded", "==", false)
        );
        
        return onSnapshot(recommendationsQuery, (recommendationsSnapshot) => {
          // Tüm tavsiye dinleyicilerinden gelen verileri topla
          const totalRecommendations = friendshipsSnapshot.docs.reduce((total, doc) => {
            const recommendationsCollection = collection(doc.ref, "recommendations");
            const recommendationsQuery = query(
              recommendationsCollection,
              where("receiverId", "==", userId),
              where("isSeen", "==", false)
            );
            
            // Bu dinleyiciden gelen veriyi al
            const recommendations = recommendationsSnapshot.docs
              .filter(recDoc => recDoc.ref.parent.parent?.id === doc.id)
              .length;
              
            return total + recommendations;
          }, 0);
          
          setUnreadRecommendations(totalRecommendations);
        }, (error) => {
          console.error("Recommendations listener error:", error);
        });
      });
      
      // Dinleyicileri kaydet
      unsubscribers.push(...recommendationListeners);
      
      return () => {
        unsubscribers.forEach(unsub => unsub());
      };
    }, (error) => {
      console.error("Friendships listener error:", error);
    });
  
    return () => {
      unsubscribeNotifications();
      unsubscribeFriendRequests();
      unsubscribeFriendships();
    };
  }, [userId]);

  const [isProfileModalVisible, setIsProfileModalVisible] =
    useState<boolean>(false);

  const handleNotificationsPress = () => {
    router.push("/notifications");
  };

  const handleProfileModals = () => {
    setIsProfileModalVisible(true);
  };

  const handleProfileModalClose = () => {
    setIsProfileModalVisible(false);
  };

  // Get current date on component mount
  const getCurrentDate = () => {
    const date = new Date();
    const months = [
      t("monthName.0"),
      t("monthName.1"),
      t("monthName.2"),
      t("monthName.3"),
      t("monthName.4"),
      t("monthName.5"),
      t("monthName.6"),
      t("monthName.7"),
      t("monthName.8"),
      t("monthName.9"),
      t("monthName.10"),
      t("monthName.11"),
    ];
    const days = [
      t("dayName.0"),
      t("dayName.1"),
      t("dayName.2"),
      t("dayName.3"),
      t("dayName.4"),
      t("dayName.5"),
      t("dayName.6"),
    ];

    const month = months[date.getMonth()];
    const day = date.getDate().toString();
    const dayName = days[date.getDay()];

    setDateMonth(month);
    setDateDay(day);
    setDateDayName(dayName);
  };

  useEffect(() => {
    getCurrentDate();
  }, []);

  const totalUnread =
    unreadNotifications + unreadFriendRequests + unreadRecommendations;

  return (
    <View style={styles.container}>
      <Pressable style={styles.date} onPress={onDatePress}>
        <CustomText
          style={styles.dateMonth}
          color="#1E3A5F"
          type="bold"
          fontSize={24}
        >
          {dateMonth} {dateDay}
        </CustomText>
        <CustomText
          style={styles.dateDay}
          color="#1E3A5F"
          type="medium"
          fontSize={16}
        >
          {dateDayName}
        </CustomText>
      </Pressable>
      <View style={styles.topMenu}>
        <TouchableOpacity
          style={styles.topMenuItem}
          onPress={handleNotificationsPress}
        >
          <NotificationIcon size={24} color="#f8f8f8" variant="fill" />
        </TouchableOpacity>
        {totalUnread > 0 && (
          <View style={styles.notificationsDot}>
            <CustomText color="#1E3A5F" type="medium" fontSize={12}>
              {totalUnread}
            </CustomText>
          </View>
        )}
        <TouchableOpacity style={styles.topMenuItem} onPress={onDiamondPress}>
          <SparklesIcon size={24} color="#f8f8f8" variant="fill" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topMenuItem}
          onPress={handleProfileModals}
        >
          <MenuIcon size={24} color="#f8f8f8" />
        </TouchableOpacity>
      </View>
      <ProfileModal
        isModalVisible={isProfileModalVisible}
        userId={userId}
        onClose={handleProfileModalClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1E3A5F",
    borderRadius: 8,
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginTop: 20,
  },
  date: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#f8f8f8",
  },
  dateMonth: {
    marginRight: 16,
  },
  dateDay: {
    color: "#1E3A5F",
    opacity: 0.6,
    fontSize: 16,
    fontWeight: 400,
    marginRight: 16,
  },
  dateYear: {
    color: "#1E3A5F",
    fontSize: 16,
    fontWeight: "400",
    marginRight: 10,
  },
  topMenu: {
    display: "flex",
    flexDirection: "row",
  },
  topMenuItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  topMenuItemText: {
    color: "#1E3A5F",
    fontSize: 8,
    fontWeight: "regular",
    marginTop: 6,
  },
  notificationsDot: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: -4,
    right: 84,
    width: 16,
    height: 16,
    borderRadius: 20,
    backgroundColor: "#FFA38F",
  },
  notificationsDotText: {
    color: "#1E3A5F",
    fontSize: 10,
    fontWeight: "bold",
  },
});
