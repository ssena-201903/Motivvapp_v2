import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
  Platform,
} from "react-native";
import TopBar from "@/components/cards/TopBar";
import CustomButton from "@/components/CustomButton";
import HomeSection from "@/components/HomeSection";
import { useEffect, useState } from "react";
import AddTodoModal from "@/components/modals/AddTodoModal";
import AddMemoryModal from "@/components/modals/AddMemoryModal";

// import { useLanguage } from "@/app/LanguageContext";

import {
  doc,
  getDoc,
  updateDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { db, auth } from "@/firebase.config";

const { width } = Dimensions.get("window");

export default function Home() {
  const [isMemoryModalVisible, setIsMemoryModalVisible] = useState(false);
  const [isAddTodoModalVisible, setIsAddTodoModalVisible] = useState(false);

  // getting current user id from auth
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const checkAndResetUserData = async () => {
      if (!userId) return;
      try {
        // fetching user data
        const userRef = doc(db, "users", userId); // get user ıd document
        const userDocSnap = await getDoc(userRef);

        // updating last signed in date
        userDocSnap.data()?.lastSignedIn !==
          new Date().toISOString().split("T")[0] &&
          (await updateDoc(userRef, {
            lastSignedIn: new Date().toISOString().split("T")[0],
          }));

        // resetting habits data(streak days, isDone, filledCup)
        if (userDocSnap.exists()) {
          const habitsRef = collection(db, "users", userId, "habits");
          const querySnapshot = await getDocs(habitsRef);

          const currentDate = new Date().toISOString().split("T")[0];
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          // total days in current month
          const daysInCurrentMonth = new Date(
            currentYear,
            currentMonth + 1,
            0
          ).getDate();

          querySnapshot.docs.forEach(async (doc) => {
            const habitData = doc.data();
            const lastCompleted = habitData.lastChangeAt;

            // Check if lastChangeAt is 2 days before today or in the previous month
            const lastChangeDate = new Date(lastCompleted);
            const currentDateObj = new Date(currentDate);

            // Check if the habit's lastChangeAt is 2 days before today, considering month change
            const diffDays = Math.floor(
              (currentDateObj.getTime() - lastChangeDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diffDays === 2 || (currentDateObj.getDate() === 1 && lastChangeDate.getDate() === daysInCurrentMonth)) {
              // If lastChangeAt is 2 days ago or lastChangeAt is from the previous month and today is 1st
              await updateDoc(doc.ref, {
                streakDays: 0, // Reset streakDays
                isDone: false, // Reset completion status
                filledCup: 0, // Reset cup status
              });
              console.log("Habit streak reset due to month change or 2-day gap!");
            } else if (lastCompleted !== currentDate) {
              // Reset habit if it is not completed today
              await updateDoc(doc.ref, {
                isDone: false,
                filledCup: 0,
              });
              console.log("Habit data updated successfully!");
            }
          });
        } else {
          console.log("User not found in Firestore!");
        }
      } catch (error) {
        console.error("Error resetting user data:", error);
      }
    };

    checkAndResetUserData();
  }, [userId]);

  // handle close modals
  const handleCloseTodoModal = () => {
    setIsAddTodoModalVisible(false);
  };

  const handleCloseMemoryModal = () => {
    setIsMemoryModalVisible(false);
  };

  const backgroundImage = require("@/assets/images/habitCardBg.png")

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View
            style={[
              styles.topbarContainer,
              width >= 768 && styles.gridItemLarge,
            ]}
          >
            <TopBar
              onDiamondPress={() => setIsMemoryModalVisible(true)}
              onDatePress={() => setIsAddTodoModalVisible(true)}
            />
          </View>
          <View style={styles.gridContainer}>
            <View
              style={[styles.gridItem, width >= 768 && styles.gridItemLarge]}
            >
              <HomeSection variant="goals" />
            </View>
            <View
              style={[styles.gridItem, width >= 768 && styles.gridItemLarge]}
            >
              <HomeSection variant="habits" />
            </View>
            <View
              style={[styles.gridItem, width >= 768 && styles.gridItemLarge]}
            >
              <HomeSection variant="todos" />
            </View>
          </View>
        </View>

        {/* when user press diamond icon to add new memory */}
        {userId && (
          <AddMemoryModal
            visible={isMemoryModalVisible}
            onClose={handleCloseMemoryModal}
            userId={userId}
          />
        )}
        {/* when user press date card to add new todo */}
        {userId && (
          <AddTodoModal
            visible={isAddTodoModalVisible}
            onClose={handleCloseTodoModal}
            userId={userId}
          />
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scrollView: {
    flexGrow: 1,
    backgroundColor: "#FCFCFC",
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "column",
  },
  topbarContainer: {
    flexGrow: 1,
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  gridContainer: {
    flexDirection: "column",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    flexGrow: 1,
  },
  gridItem: {
    width: "100%",
    marginBottom: 20,
  },

  //responive grid for larger screens
  gridItemLarge: {
    width: "70%", // Two columns with some space between on larger screens
  },
});
