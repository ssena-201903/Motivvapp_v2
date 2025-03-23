import React, { useState, useEffect } from "react";
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
import PlaneIcon from "@/components/icons/PlaneIcon";
import WalletIcon from "@/components/icons/ShoppingIcon";
import FoodIcon from "@/components/icons/FoodIcon";
import PlusIcon from "@/components/icons/PlusIcon";

import { useLanguage } from "@/app/LanguageContext";
import SearchMovie from "@/components/SearchMovie";

const { width } = Dimensions.get("window");

export default function Goals() {
  const { categoryId = "Movie" } = useLocalSearchParams();
  const [activeCategory, setActiveCategory] = useState(categoryId as string);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);

  // language context
  const { t } = useLanguage();

  const categories = [
    { id: "Movie", label: t("home.cardGoalWatch"), icon: MovieIcon },
    { id: "Book", label: t("home.cardGoalRead"), icon: BookIcon },
    { id: "Activity", label: t("home.cardGoalTry"), icon: ActivityIcon },
    { id: "Place", label: t("home.cardGoalGo"), icon: PlaneIcon },
    { id: "Buy", label: t("home.cardGoalBuy"), icon: WalletIcon },
    { id: "Food", label: t("home.cardGoalEat"), icon: FoodIcon },
  ];

  const getSectionHeaderText = () => {
    const category = categories.find(cat => cat.id === activeCategory);
    return category?.label || "";
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

  // toggle modal
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  // handle goal add
  const handleGoalAdd = async () => {
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

  const renderIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return null;
    
    const IconComponent = category.icon;
    const isActive = activeCategory === categoryId;
    
    return (
      <IconComponent 
        size={16} 
        color={isActive ? "#1E3A5F" : "#C6C6C6"} 
        variant={isActive ? "fill" : "fill"} 
      />
    );
  };

  const backgroundImage = require("@/assets/images/habitCardBg.png");

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      <View style={styles.container}>
        {/* Category Buttons - Fixed Height */}
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoriesScrollContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryPill,
                  activeCategory === category.id && styles.activeCategoryPill
                ]}
                onPress={() => setActiveCategory(category.id)}
              >
                {renderIcon(category.id)}
                <CustomText
                  type={activeCategory === category.id ? "bold" : "regular"}
                  fontSize={10}
                  color={activeCategory === category.id ? "#1E3A5F" : "#C6C6C6"}
                >
                  {category.label}
                </CustomText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.contentBody}>
          {/* search movie  */}
          {activeCategory === "Movie" && (
            <SearchMovie updateGoals={fetchGoals}/>
          )}
          
          <View style={styles.headerContainer}>
            <SectionHeader
              id={activeCategory}
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

// const { width } = Dimensions.get("window");
const containerWidth = width > 768 ? width - 900 : width - 40;

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
    width: containerWidth,
    height: 60,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  categoriesScrollContent: {
    paddingHorizontal: 5,
    height: 60,
    gap: 6,
    alignItems: "center",
  },
  categoryPill: {
    flexDirection: "row",
    height: 40,
    // width: 100,
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#FDFDFD",
    borderWidth: 1,
    borderColor: "#E8EFF5",
    gap: 8,
    marginRight: 6,
  },
  activeCategoryPill: {
    backgroundColor: "#E8EFF5",
    borderColor: "#CEDEEB",
  },
  buttonText: {
    alignItems: "center",
    color: "#1E3A5F",
    opacity: 0.6,
    fontSize: 12,
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  noGoalsText: {
    opacity: 0.7,
    marginTop: 40,
  },
});