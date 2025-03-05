import { CustomText } from "@/CustomText";
import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ImageBackground,
} from "react-native";
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";
import AddTodoModal from "@/components/modals/AddTodoModal";
import CardTodo from "@/components/cards/CardTodo";
import { db, auth } from "@/firebase.config";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import PlusIcon from "@/components/icons/PlusIcon";

import { useLanguage } from "@/app/LanguageContext";
import { setupCalendarLocale } from "@/languages/calendarLocale";

const { width } = Dimensions.get("screen");

interface Todo {
  id: string;
  text: string;
  isDone: boolean;
  createdAt: Timestamp;
  dueDate: string;
}

export default function CalendarPage() {
  const userId = auth.currentUser?.uid;
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [todos, setTodos] = useState<{ [key: string]: Todo[] }>({});
  const [modalVisible, setModalVisible] = useState(false);

  // language context
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    setupCalendarLocale(language);
  }, [language]);

  const today = new Date().toISOString().split("T")[0];

  // Fetch todos from Firebase
  const fetchTodos = async () => {
    if (!userId) return;

    try {
      const todosRef = collection(db, "users", userId, "todos");
      const querySnapshot = await getDocs(todosRef);
      // console.log("querySnapshot", querySnapshot);

      const todos: { [key: string]: Todo[] } = {};

      querySnapshot.docs.forEach((doc) => {
        const todo = doc.data();
        const dueDate = todo.dueDate.toDate().toISOString().split("T")[0];
        // console.log("todo", dueDate);

        if (!todos[dueDate]) {
          todos[dueDate] = [];
        }

        todos[dueDate].push({
          id: doc.id,
          text: todo.text,
          isDone: todo.isDone,
          createdAt: todo.createdAt,
          dueDate: todo.dueDate.toDate().toISOString(),
        });
        // console.log("todo", todos);
        setTodos(todos);
      });
    } catch (error) {}
  };

  useEffect(() => {
    fetchTodos();
    setSelectedDay(today);
  }, [userId]);

  const handleDayPress = (day: DateData) => {
    setSelectedDay(day.dateString);
  };

  // Toggle todo completion
  const toggleTodo = async (todoId: string) => {
    if (!userId || !selectedDay) return;

    try {
      const todoRef = doc(db, "users", userId, "todos", todoId);
      const currentTodo = todos[selectedDay].find((todo) => todo.id === todoId);

      if (currentTodo) {
        await updateDoc(todoRef, {
          isDone: !currentTodo.isDone,
        });

        setTodos((prevTodos) => ({
          ...prevTodos,
          [selectedDay]: prevTodos[selectedDay].map((todo) =>
            todo.id === todoId ? { ...todo, isDone: !todo.isDone } : todo
          ),
        }));
      }
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  // Delete todo
  const deleteTodo = async (todoId: string) => {
    if (!userId || !selectedDay) return;

    try {
      const todoRef = doc(db, "users", userId, "todos", todoId);
      await deleteDoc(todoRef);

      setTodos((prevTodos) => ({
        ...prevTodos,
        [selectedDay]: prevTodos[selectedDay].filter(
          (todo) => todo.id !== todoId
        ),
      }));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const renderDayTodos = (dateString: string) => {
    const dayTodos = todos[dateString] || [];
    if (dayTodos.length === 0) return null;

    return (
      <View style={styles.dayTodoList}>
        {dayTodos.slice(0, 2).map((todo, index) => (
          <CustomText
            key={todo.id}
            style={[
              styles.dayTodoText,
              todo.isDone && styles.completedDayTodoText,
            ]}
            numberOfLines={1}
          >
            • {todo.text}
          </CustomText>
        ))}
        {dayTodos.length > 2 && (
          <CustomText style={styles.moreTodosText}>+{dayTodos.length - 2} more</CustomText>
        )}
      </View>
    );
  };

  return (
    <ImageBackground
      source={require("@/assets/images/habitCardBg.png")}
      style={styles.backgroundImage}
    >
      <ScrollView>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            [selectedDay || ""]: { selected: true, selectedColor: "#FFA38F" },
            [today]: { selected: true, selectedColor: "#E5EEFF" },
          }}
          theme={{
            todayTextColor: "#1E3A5F",
            selectedDayBackgroundColor: "#FFA38F",
            selectedDayTextColor: "#1E3A5F",
            arrowColor: "#FFA38F",
          }}
          firstDay={(LocaleConfig.locales[language] as any)?.firstDay ?? 0}
          dayComponent={({ date }) => {
            if (!date) return null;

            const isSelected = date.dateString === selectedDay;
            const isToday = date.dateString === today;

            return (
              <TouchableOpacity
                style={[
                  styles.dayContainer,
                  isSelected && styles.selectedDayContainer,
                  isToday && styles.todayContainer,
                ]}
                onPress={() => handleDayPress(date)}
              >
                <CustomText
                  style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                    isToday && styles.todayText,
                  ]}
                >
                  {date.day}
                </CustomText>
                {renderDayTodos(date.dateString)}
              </TouchableOpacity>
            );
          }}
        />

        {selectedDay && todos[selectedDay]?.length > 0 && (
          <View style={styles.selectedDayTodos}>
            <CustomText 
              style={styles.selectedDayTitle}
              type="bold"
              fontSize={18}
              color="#1E3A5F"
            >
              {selectedDay}  {t("calendar.title")}
            </CustomText>
            <View style={styles.todoList}>
              {todos[selectedDay]?.map((todo) => (
                <CardTodo
                  key={todo.id}
                  id={todo.id}
                  text={todo.text}
                  isCompleted={todo.isDone}
                  type="todo"
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => deleteTodo(todo.id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <PlusIcon size={18} color="white" />
        </TouchableOpacity>

        {userId && (
          <AddTodoModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            userId={userId}
            selectedDate={selectedDay || today}
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
  dayContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    borderWidth: 1,
    borderColor: "#E5EEFF",
    padding: 5,
    borderRadius: 4,
    width: width / 7 - 4,
    height: width > 760 ? 80 : 110,
    backgroundColor: "#fff",
  },
  selectedDayContainer: {
    backgroundColor: "#FFA38F",
  },
  todayContainer: {
    backgroundColor: "#E5EEFF",
    borderColor: "#1E3A5F",
  },
  dayText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#1E3A5F",
  },
  selectedDayText: {
    color: "#1E3A5F",
  },
  todayText: {
    color: "#1E3A5F",
  },
  dayTodoList: {
    width: "100%",
    paddingHorizontal: 2,
  },
  dayTodoText: {
    fontSize: 10,
    color: "#1E3A5F",
    marginBottom: 2,
  },
  moreTodosText: {
    fontSize: 10,
    color: "#1E3A5F",
    fontStyle: "italic",
  },
  addButton: {
    position: "absolute",
    right: 30,
    top: 480,
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: "#1E3A5F",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectedDayTodos: {
    position: "relative",
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 20,
    paddingBottom: 100,
    height: "auto",
  },
  selectedDayTitle: {
    marginBottom: width > 768 ? 50 : 40,
  },
  todoList: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    width: width > 760 ? width - 600 : width - 40,
    gap: 8,
  },
  completedDayTodoText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
});
