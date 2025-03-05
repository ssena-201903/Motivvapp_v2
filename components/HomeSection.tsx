import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import SectionHeader from "@/components/headers/SectionHeader";
import CardGoal from "@/components/cards/CardGoal";
import CardWaterHabit from "@/components/cards/CardWaterHabit";
import CardTodo from "@/components/cards/CardTodo";
import React, { useEffect, useState } from "react";
import { db, auth } from "@/firebase.config";
import { orderBy, Timestamp } from "firebase/firestore";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { CustomText } from "@/CustomText";
import { router } from "expo-router";
import CardOtherHabit from "./cards/CardOtherHabit";

import { useLanguage } from "@/app/LanguageContext";

const { width } = Dimensions.get("window");

type Props = {
  variant: "goals" | "habits" | "todos";
};

export default function HomeSection({ variant }: Props) {
  const userId = auth.currentUser?.uid;
  const [activeHabits, setActiveHabits] = useState<any[]>([]);
  const [currentTodos, setCurrentTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [todosPercentage, setTodosPercentage] = useState<number>(0);
  const [habitsPercentage, setHabitsPercentage] = useState<number>(0);
  const [goals, setGoals] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isWaterCard, setIsWaterCard] = useState<boolean>(false);
  const [isBookCard, setIsBookCard] = useState<boolean>(false);
  const [isSportCard, setIsSportCard] = useState<boolean>(false);
  const [isCustomCard, setIsCustomCard] = useState<boolean>(false);
  const [isVocabularyCard, setIsVocabularyCard] = useState<boolean>(false);

  // language context
  const { t } = useLanguage();

  // Helper function to sort todos
  const sortTodos = (todos: any[]) => {
    return todos.sort((a, b) => {
      if (a.isDone === b.isDone) return 0;
      return a.isDone ? 1 : -1;
    });
  };

  const fetchHabitDatas = async () => {
    try {
      const habitsRef = collection(db, `users/${userId}/habits`);

      const q = query(habitsRef, orderBy("streakDays", "desc"));
      const querySnapshot = await getDocs(q);

      // Reset all habit states
      setIsWaterCard(false);
      setIsBookCard(false);
      setIsSportCard(false);
      setIsCustomCard(false);
      setIsVocabularyCard(false);

      // active habits
      const newActiveHabits: any[] = [];

      querySnapshot.docs.forEach((doc) => {
        const habitDoc = doc.data();

        if (!habitDoc.isArchieved) {
          newActiveHabits.push(habitDoc);
        }

        switch (habitDoc.variant) {
          case "Water":
            setIsWaterCard(true);
            break;
          case "Book":
            setIsBookCard(true);
            break;
          case "Sport":
            setIsSportCard(true);
            break;
          case "Custom":
            setIsCustomCard(true);
            break;
          case "Vocabulary":
            setIsVocabularyCard(true);
            break;
          default:
            break;
        }
      });

      setActiveHabits(newActiveHabits);
      setHabitsPercentage(calculateHabitsPercentage(newActiveHabits));
    } catch (error) {
      console.log("Error fetching habits:", error);
    }
  };

  useEffect(() => {
    fetchHabitDatas();
  }, [userId, activeHabits]);

  const calculateTodosPercentage = (todos: any[]) => {
    const totalTodos = todos.length;
    if (totalTodos === 0) return 0;
    const completedTodos = todos.filter((todo) => todo.isDone).length;
    return Math.round((completedTodos / totalTodos) * 100);
  };

  const calculateGoalsPercentage = (goals: any[]) => {
    const totalGoals = goals.length - 1;
    if (totalGoals === 0) return 0;
    const completedGoals = goals.filter((goal) => goal.isDone).length;
    return Math.round((completedGoals / totalGoals) * 100);
  };

  const calculateHabitsPercentage = (habits: any[]) => {
    const totalHabits = habits.length;
    if (totalHabits === 0) return 0;
    const completedHabits = habits.filter((habit) => habit.isDone).length;
    return Math.round((completedHabits / totalHabits) * 100);
  };

  const fetchTodos = async () => {
    if (!userId) return;

    try {
      const todosRef = collection(db, "users", userId, "todos");
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        todosRef,
        where("dueDate", ">=", startOfDay),
        where("dueDate", "<=", endOfDay)
      );
      const querySnapshot = await getDocs(q);
      const todosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort todos: false (incomplete) first, then true (complete)
      const sortedTodos = todosData.sort((a: any, b: any) => {
        if (a.isDone === b.isDone) return 0;
        return a.isDone ? 1 : -1;
      });

      setCurrentTodos(sortedTodos);
      setTodosPercentage(calculateTodosPercentage(sortedTodos));
    } catch (error) {
      console.log("error fetching todos", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    if (!userId) return;
    try {
      const goalsRef = collection(db, "users", userId, "goals");
      const querySnapshot = await getDocs(goalsRef);
      const goalsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGoals(goalsData);
    } catch (error) {
      console.log("error fetching goals", error);
    }
  };

  const toggleTodo = async (id: string, currentStatus: boolean) => {
    if (!userId) return;
    try {
      const todoRef = doc(db, "users", userId, "todos", id);
      await updateDoc(todoRef, {
        isDone: !currentStatus,
      });

      // Update the todo in the state and resort
      const updatedTodos = currentTodos.map((todo) =>
        todo.id === id ? { ...todo, isDone: !currentStatus } : todo
      );

      // Sort the updated todos
      const sortedTodos = sortTodos(updatedTodos);

      // Update state with sorted todos
      setCurrentTodos(sortedTodos);
      setTodosPercentage(calculateTodosPercentage(sortedTodos));
    } catch (error) {
      console.log("error toggling todo status", error);
    }
  };

  const deleteTodo = async (id: string) => {
    if (!userId) return;
    try {
      const todoRef = doc(db, "users", userId, "todos", id);
      await deleteDoc(todoRef);
      const updatedTodos = currentTodos.filter((todo) => todo.id !== id);
      const sortedTodos = sortTodos(updatedTodos);
      setCurrentTodos(sortedTodos);
      setTodosPercentage(calculateTodosPercentage(sortedTodos));
    } catch (error) {
      console.log("error deleting todo", error);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    router.push({
      pathname: "/goals",
      params: { categoryId },
    });
  };

  useEffect(() => {
    if (variant === "todos") {
      fetchTodos();
    }
    if (variant === "goals") {
      fetchGoals();
    }
  }, [variant, userId]);

  const createHomeSection = () => {
    if (variant === "goals") {
      return (
        <>
          <SectionHeader
            text={t("home.sectionHeaderGoals")}
            percentDone={calculateGoalsPercentage(goals)}
            variant="home"
            id="goals"
          />
          <View style={styles.gridViewRow}>
            <CardGoal
              inlineText={t("home.cardGoalGo")}
              categoryId="Place"
              onCategoryPress={handleCategoryPress}
            />
            <CardGoal
              inlineText={t("home.cardGoalWatch")}
              categoryId="Movie"
              onCategoryPress={handleCategoryPress}
            />
            <CardGoal
              inlineText={t("home.cardGoalBuy")}
              categoryId="Buy"
              onCategoryPress={handleCategoryPress}
            />
            <CardGoal
              inlineText={t("home.cardGoalEat")}
              categoryId="Food"
              onCategoryPress={handleCategoryPress}
            />
            <CardGoal
              inlineText={t("home.cardGoalTry")}
              categoryId="Activity"
              onCategoryPress={handleCategoryPress}
            />
            <CardGoal
              inlineText={t("home.cardGoalRead")}
              categoryId="Book"
              onCategoryPress={handleCategoryPress}
            />
          </View>
        </>
      );
    } else if (variant === "habits") {
      return (
        <>
          <SectionHeader
            text={t("home.sectionHeaderHabits")}
            percentDone={habitsPercentage}
            variant="home"
            id="habits"
          />
          <ScrollView
            contentContainerStyle={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.gridView}>
              {userId && isWaterCard && <CardWaterHabit userId={userId} />}
              {userId && isBookCard && (
                <CardOtherHabit userId={userId} variant="Book" />
              )}
              {/* {userId && isVocabularyCard && (
                <CardOtherHabit userId={userId} variant="Vocabulary" />
              )} */}
              {userId && isSportCard && (
                <CardOtherHabit userId={userId} variant="Sport" />
              )}
              {userId && isCustomCard && (
                <CardOtherHabit userId={userId} variant="Custom" />
              )}
            </View>
          </ScrollView>
        </>
      );
    } else if (variant === "todos") {
      if (loading) {
        return <CustomText>Loading...</CustomText>;
      }
      return (
        <>
          <SectionHeader
            text={t("home.sectionHeaderTodo")}
            percentDone={todosPercentage}
            variant="home"
            id="todos"
          />
          <View style={styles.gridView}>
            {currentTodos.map((todo) => (
              <CardTodo
                key={todo.id}
                id={todo.id}
                text={todo.text}
                isCompleted={todo.isDone}
                type="todo"
                onToggle={() => toggleTodo(todo.id, todo.isDone)}
                onDelete={() => deleteTodo(todo.id)}
              />
            ))}
          </View>
        </>
      );
    }
  };

  return <View style={styles.container}>{createHomeSection()}</View>;
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  scrollView: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 20,
  },
  gridView: {
    display: "flex",
    flexWrap: "wrap",
    padding: 5,
    gap: 8,
    width: width > 768 ? width - 510 : "100%",
    // marginHorizontal: 20,
    flex: 1,
    justifyContent: "flex-start",
    flexGrow: 1,
    height: 300,
  },
  gridViewRow: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    padding: 5,
    gap: 8,
    flexGrow: 1,
  },
});
