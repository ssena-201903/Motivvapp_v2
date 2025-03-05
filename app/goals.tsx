import React, { useState, useEffect, act } from "react";
import { useLocalSearchParams } from "expo-router";
import { CustomText } from "@/CustomText";
import AddGoalModal from "@/components/modals/AddGoalModal";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";

import CardGoalTodo from "@/components/cards/CardGoalTodo";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/firebase.config";
import SectionHeader from "@/components/headers/SectionHeader";
import MovieIcon from "@/components/icons/MovieIcon";
import BookIcon from "@/components/icons/BookIcon";
import ActivityIcon from "@/components/icons/ActivityIcon";
import CarIcon from "@/components/icons/CarIcon";
import SellIcon from "@/components/icons/SellIcon";
import WalletIcon from "@/components/icons/WalletIcon";
import FoodIcon from "@/components/icons/FoodIcon";
import PlusIcon from "@/components/icons/PlusIcon";

import { useLanguage } from "@/app/LanguageContext";
import SearchMovie from "@/components/SearchMovie";

const { width } = Dimensions.get("window");
const containerWidth = width > 768 ? width - 900 : width - 40;
const buttonWidth = containerWidth / 6 - 4; // divide by number of buttons

export default function Goals() {
  const { categoryId = "Movie" } = useLocalSearchParams();
  const [activeCategory, setActiveCategory] = useState<string>(
    categoryId as string
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);
  const [percentDone, setPercentDone] = useState(0);

  // language context
  const { t, language, setLanguage } = useLanguage();

  const categories = [
    { id: "Movie", label: t("home.cardGoalWatch") },
    { id: "Book", label: t("home.cardGoalRead") },
    { id: "Activity", label: t("home.cardGoalTry") },
    { id: "Place", label: t("home.cardGoalGo") },
    { id: "Buy", label: t("home.cardGoalBuy") },
    { id: "Food", label: t("home.cardGoalEat") },
  ];

  const getSectionHeaderText = () => {
    switch (activeCategory) {
      case "Movie":
        return t("home.cardGoalWatch");
      case "Book":
        return t("home.cardGoalRead");
      case "Activity":
        return t("home.cardGoalTry");
      case "Place":
        return t("home.cardGoalGo");
      case "Buy":
        return t("home.cardGoalBuy");
      case "Food":
        return t("home.cardGoalEat");
    }
  };

  // fetch goals
  const fetchGoals = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.log("user did not login");
        return;
      }

      const goalsRef = collection(db, "users", userId, "goals");
      const q = query(goalsRef, where("category", "==", activeCategory));
      const querySnapshot = await getDocs(q);

      const fetchedGoals = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGoals(fetchedGoals);
    } catch (error) {
      console.error("Error fetching goals: ", error);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [activeCategory]);

  const handleCategoryPress = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  // toggle modal
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  // handle goal add
  const handleGoalAdd = async (data: any) => {
    await fetchGoals(); // update list after adding a new goal
  };

  // handleCalculatePercentDone
  const calculatePercentDone = (category: string) => {
    const filteredGoals = goals.filter((goal) => goal.category === category);
    const totalGoals = filteredGoals.length;
    if (totalGoals === 0) return 0;
    const completedGoals = filteredGoals.filter((goal) => goal.isDone).length;
    return Math.round((completedGoals / totalGoals) * 100);
  };

  const backgroundImage = require("@/assets/images/habitCardBg.png")

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              style={[
                styles.button,
                activeCategory === category.id ? styles.activeButton : {},
              ]}
              onPress={() => handleCategoryPress(category.id)}
              key={category.id}
            >
              {/* {category.id === "Movie" && (
                <MovieIcon
                  size={18}
                  color={activeCategory === category.id ? "#1E3A5F" : "#D3D3D3"}
                  variant={activeCategory === category.id ? "fill" : "fill"}
                />
              )}
              {category.id === "Book" && (
                <BookIcon
                  size={22}
                  color={activeCategory === category.id ? "#1E3A5F" : "#D3D3D3"}
                  variant={activeCategory === category.id ? "fill" : "fill"}
                />
              )}
              {category.id === "Activity" && (
                <ActivityIcon
                  size={24}
                  color={activeCategory === category.id ? "#1E3A5F" : "#D3D3D3"}
                  variant={activeCategory === category.id ? "fill" : "fill"}
                />
              )}
              {category.id === "Place" && (
                <CarIcon
                  size={24}
                  color={activeCategory === category.id ? "#1E3A5F" : "#D3D3D3"}
                  variant={activeCategory === category.id ? "fill" : "fill"}
                />
              )}
              {category.id === "Buy" && (
                <WalletIcon
                  size={22}
                  color={activeCategory === category.id ? "#1E3A5F" : "#D3D3D3"}
                  variant={activeCategory === category.id ? "fill" : "fill"}
                />
              )}
              {category.id === "Food" && (
                <FoodIcon
                  size={22}
                  color={activeCategory === category.id ? "#1E3A5F" : "#D3D3D3"}
                  variant={activeCategory === category.id ? "fill" : "fill"}
                />
              )} */}
              <CustomText
                type={activeCategory === category.id ? "bold" : "regular"}
                fontSize={12}
                color={activeCategory === category.id ? "#1E3A5F" : "#D3D3D3"}
              >
                {category.label}
              </CustomText>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.contentBody}>
          {/* search movie  */}
          {activeCategory === "Movie" && (
            <SearchMovie updateGoals={fetchGoals}/>
          )}
          
          <View style={styles.headerContainer}>
            <SectionHeader
              text={getSectionHeaderText()}
              percentDone={calculatePercentDone(activeCategory)}
              variant="other"
            />
          </View>

          <ScrollView
            style={styles.scrollViewStyle}
            contentContainerStyle={[
              styles.contentContainer,
              goals.length === 0 && styles.emptyContentContainer,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {goals.map((goal) => (
              <CardGoalTodo
                key={goal.id}
                goal={goal}
                category={activeCategory}
                onUpdate={fetchGoals}
              />
            ))}
            {goals.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <CustomText 
                  style={styles.noGoalsText}
                  fontSize={16}
                  color="#1E3A5F"
                  type="medium"
                >
                  {t("goals.noGoalsYet")}
                </CustomText>
              </View>
            )}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
          <PlusIcon size={22} color="white" />
        </TouchableOpacity>

        <AddGoalModal
          visible={isModalVisible}
          categoryId={activeCategory}
          onClose={toggleModal}
          onAdd={handleGoalAdd}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    width: "100%",
    paddingTop: 20,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#FCFCFC",
  },
  categoriesContainer: {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "flex-start",
    width: containerWidth,
    paddingVertical: 5,
    marginHorizontal: 20,
    gap: 4,
    height: 60, // fixed height without flexGrow
    marginBottom: 20, // fixed marginBottom without flexGrow
  },
  button: {
    width: buttonWidth,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  buttonText: {
    alignItems: "center",
    color: "#1E3A5F",
    opacity: 0.6,
    fontSize: 12,
  },
  activeButton: {
    backgroundColor: "#E5EEFF",
  },
  headerContainer: {
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  contentBody: {
    width: width > 768 ? width - 860 : "100%",
    marginHorizontal: 20,
    flex: 1,
  },
  scrollViewStyle: {
    width: "100%",
    flex: 1,
  },
  contentContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 10,
    width: width > 768 ? width - 860 : "100%",
    paddingHorizontal: width > 768 ? "auto" : 40,
    paddingBottom: 80, // leave some space for the floating button
  },
  emptyContentContainer: {
    flex: 1, // fill the remaining space of the ScrollView
    justifyContent: "center",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#1E3A5F",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  noGoalsText: {
    opacity: 0.7,
    marginTop: 40,
  },
});
