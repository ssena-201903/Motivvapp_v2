import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  TouchableOpacity,
  StatusBar,
  Platform,
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
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring
} from "react-native-reanimated";

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

  // Animation values
  const notificationBadgeScale = useSharedValue(1);
  const buttonPressedScale = useSharedValue(1);

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

  // Animated styles
  const badgeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: notificationBadgeScale.value }],
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonPressedScale.value }],
    };
  });

  const totalUnread =
    unreadNotifications + unreadFriendRequests + unreadRecommendations;


  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.dateContainer} 
          onPress={onDatePress}
          activeOpacity={0.7}
        >
          <CustomText
            style={styles.dateMonth}
            color="#1E3A5F"
            type="bold"
            fontSize={20}
          >
            {dateMonth} {dateDay}
          </CustomText>
          <CustomText
            style={styles.dateDay}
            color="#666"
            type="medium"
            fontSize={16}
          >
            {dateDayName}
          </CustomText>
        </TouchableOpacity>
        
        <View style={styles.actionButtons}>
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleNotificationsPress}
              activeOpacity={0.7}
            >
              <NotificationIcon size={22} color="#1E3A5F" variant="fill" />
              {totalUnread > 0 && (
                <Animated.View style={[styles.notificationBadge, badgeAnimatedStyle]}>
                  <CustomText color="#fff" type="medium" fontSize={10}>
                    {totalUnread}
                  </CustomText>
                </Animated.View>
              )}
            </TouchableOpacity>
          </Animated.View>
          
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={onDiamondPress}
              activeOpacity={0.7}
            >
              <SparklesIcon size={22} color="#1E3A5F" variant="fill" />
            </TouchableOpacity>
          </Animated.View>
          
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleProfileModals}
              activeOpacity={0.7}
            >
              <MenuIcon size={22} color="#1E3A5F" />
            </TouchableOpacity>
          </Animated.View>
        </View>
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
  outerContainer: {
    paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight : 0,
    width: '100%',
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E8EFF5",
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#999",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateMonth: {
    marginRight: 6,
  },
  dateDay: {
    opacity: 0.8,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FF5A5F",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#f8f8f8",
  },
});