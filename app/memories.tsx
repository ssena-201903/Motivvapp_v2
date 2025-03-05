import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from "react-native";
import { auth, db } from "../firebase.config";
import {
  collection,
  orderBy,
  query,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import moment from "moment";
import { ScrollView } from "react-native-gesture-handler";
import { CustomText } from "@/CustomText";
import { useLanguage } from "@/app/LanguageContext";
import TrashIcon from "@/components/icons/TrashIcon";
import PencilIcon from "@/components/icons/PencilIcon";
import BoxIcon from "@/components/icons/BoxIcon";
import CustomButton from "@/components/CustomButton";

const { width } = Dimensions.get("screen");

interface Memory {
  id: string;
  memoryText: string;
  createdAt: Timestamp;
}

interface GroupedMemories {
  [key: string]: Memory[];
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<GroupedMemories>({});
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [editedText, setEditedText] = useState<{ [key: string]: string }>({});
  const [editedMemoryId, setEditedMemoryId] = useState<string | null>(null);

  // language context
  const { t } = useLanguage();

  const formatMonthYear = (date: string | moment.Moment) => {
    const monthIndex = moment(date).month();
    const year = moment(date).format("YYYY");
    const monthName = t(`monthName.${monthIndex}`);
    return `${monthName} ${year}`;
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  // fetch memories
  const fetchMemories = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const memoriesRef = collection(db, "users", userId, "memories");
      const querySnapshot = await getDocs(
        query(memoriesRef, orderBy("createdAt", "desc"))
      );

      const groupedMemories: GroupedMemories = {};
      querySnapshot.forEach((doc) => {
        const memory = doc.data();
        const date = moment(memory.createdAt.toDate());
        const monthYear = formatMonthYear(date);

        if (!groupedMemories[monthYear]) {
          groupedMemories[monthYear] = [];
        }
        groupedMemories[monthYear].push({
          id: doc.id,
          memoryText: memory.memory || "",
          createdAt: memory.createdAt,
        });
      });

      setMemories(groupedMemories);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching memories:", error);
      setLoading(false);
    }
  };

  // delete memory
  const deleteMemory = async (memoryId: string) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      await deleteDoc(doc(db, "users", userId, "memories", memoryId));
      fetchMemories();
    } catch (error) {
      console.error("Error deleting memory:", error);
    }
  };

  // edit memory
  const startEditing = (memoryId: string, currentText: string) => {
    setEditedMemoryId(memoryId);
    setEditedText((prev) => ({ ...prev, [memoryId]: currentText }));
  };

  const cancelEditing = () => {
    setEditedMemoryId(null);
    setEditedText({});
  };

  const saveEditedMemory = async (memoryId: string) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId || !editedText[memoryId]) return;

      await updateDoc(doc(db, "users", userId, "memories", memoryId), {
        memory: editedText[memoryId],
        updatedAt: Timestamp.now(),
      });

      setEditedMemoryId(null);
      setEditedText({});
      fetchMemories();
    } catch (error) {
      console.error("Error updating memory:", error);
    }
  };

  const toggleMonth = (month: string) => {
    setExpandedMonth(expandedMonth === month ? null : month);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/habitCardBg.png")}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(memories).map(([month, monthMemories]) => (
          <View key={month} style={styles.monthContainer}>
            <TouchableOpacity
              style={styles.monthHeader}
              onPress={() => toggleMonth(month)}
            >
              <CustomText type="semibold" color="#1E3A5F" fontSize={18}>
                {month}
              </CustomText>
              <CustomText style={styles.arrow}>
                {expandedMonth === month ? "▲" : "▼"}
              </CustomText>
            </TouchableOpacity>

            {expandedMonth === month && (
              <View style={styles.memoriesContainer}>
                {monthMemories.map((memory) => (
                  <View key={memory.id} style={styles.memoryItem}>
                    <CustomText type="regular" color="#1E3A5F" fontSize={14}>
                      {memory.createdAt.toDate().toISOString().split("T")[0]}
                    </CustomText>
                    <View style={styles.containerBottom}>
                      {editedMemoryId === memory.id ? (
                        <View style={styles.editContainer}>
                          <TextInput
                            style={styles.editInput}
                            value={editedText[memory.id] || ""}
                            onChangeText={(text) =>
                              setEditedText((prev) => ({
                                ...prev,
                                [memory.id]: text,
                              }))
                            }
                            multiline
                            autoFocus
                          />
                          <View style={styles.editButtonsContainer}>
                            <CustomButton
                              onPress={() => saveEditedMemory(memory.id)}
                              label={t("memories.saveButtonText")}
                              width={"50%"}
                              height={40}
                              variant="fill"
                            />
                            <CustomButton
                              onPress={cancelEditing}
                              label={t("memories.cancelButtonText")}
                              width={"50%"}
                              height={40}
                              variant="cancel"
                            />
                          </View>
                        </View>
                      ) : (
                        <>
                          <CustomText
                            type="semibold"
                            color="#1E3A5F"
                            fontSize={16}
                          >
                            {memory.memoryText}
                          </CustomText>
                          <View style={styles.iconContainer}>
                            <TouchableOpacity
                              onPress={() => deleteMemory(memory.id)}
                            >
                              <TrashIcon size={22} color="#FFA38F" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() =>
                                startEditing(memory.id, memory.memoryText)
                              }
                            >
                              <PencilIcon size={22} color="#1E3A5F" />
                            </TouchableOpacity>
                          </View>
                        </>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    minWidth: width > 768 ? 700 : width - 40,
    justifyContent: "flex-start",
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  monthContainer: {
    width: "100%",
    marginBottom: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    overflow: "hidden",
  },
  monthHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#E5EEFF",
    gap: 20,
  },
  arrow: {
    fontSize: 16,
    color: "#666",
  },
  memoriesContainer: {
    padding: 20,
  },
  memoryItem: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 15,
  },
  containerBottom: {
    marginTop: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
  },
  memoryDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  iconContainer: {
    flexDirection: "row",
    gap: 10,
  },
  editContainer: {
    flex: 1,
    width: "100%",
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#E5EEFF",
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    marginBottom: 10,
    color: "#1E3A5F",
    backgroundColor: "#FFFFFF",
  },
  editButtonsContainer: {
    flexDirection: "row",
    width: "25%",
    justifyContent: "flex-start",
    gap: 10,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#FFA38F",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});