import React, { useState } from "react";
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { CustomText } from "@/CustomText";
import CustomButton from "../CustomButton";
import { db } from "@/firebase.config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useLanguage } from "@/app/LanguageContext";

const { width } = Dimensions.get("window");

interface AddTodoModalProps {
  visible: boolean;
  selectedDate?: string;
  onClose: () => void;
  userId: string;
}

export default function AddTodoModal({
  visible,
  selectedDate,
  onClose,
  userId,
}: AddTodoModalProps) {
  const [todoText, setTodoText] = useState<string>("");
  const [showRefreshModal, setShowRefreshModal] = useState<boolean>(false);

  const navigation = useNavigation();
  const route = useRoute();

  // language context
  const { t, language, setLanguage } = useLanguage();

  const handleAdd = async () => {
    if (todoText.trim()) {
      try {
        const dueDate = selectedDate
          ? Timestamp.fromDate(new Date(selectedDate))
          : serverTimestamp();

        const todosRef = collection(db, "users", userId, "todos");
        await addDoc(todosRef, {
          text: todoText,
          dueDate: dueDate,
          isDone: false,
          createdAt: serverTimestamp(),
        });

        setTodoText("");
        onClose();
        setShowRefreshModal(true);
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };

  return (
    <>
      {/* add todo modal */}
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <CustomText color="#1E3A5F" fontSize={18} type="bold">
              {selectedDate ? `${selectedDate}` : t("addTodoModal.title")}
            </CustomText>
            <TextInput
              style={styles.modalInput}
              value={todoText}
              onChangeText={setTodoText}
              placeholder={t("addTodoModal.todoPlaceholder")}
            />
            <View style={styles.modalButtons}>
              <CustomButton
                label={t("addTodoModal.cancelButtonText")}
                onPress={onClose}
                variant="cancel"
                width="50%"
                height={45}
              />

              <CustomButton
                label={t("addTodoModal.addButtonText")}
                onPress={handleAdd}
                variant="fill"
                width="50%"
                height={45}
                marginLeft={10}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* refresh screen modal */}
      <Modal visible={showRefreshModal} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.refreshModalContent]}>
            <CustomText style={styles.refreshModalHeader}>
              Added successfully! Refresh to continue
            </CustomText>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => {
                setShowRefreshModal(false);
                navigation.reset({
                  index: 0,
                  routes: [{ name: route.name }],
                });
              }}
            >
              <Ionicons name="refresh" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FCFCFC",
    padding: 20,
    borderRadius: 8,
    width: width > 768 ? "50%" : width - 40,
    alignItems: "center",
  },
  modalInput: {
    borderWidth: 1,
    color: "#1E3A5F",
    borderColor: "#E5EEFF",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#F5F8FF",
    width: "100%",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  modalButtons: {
    width: "50%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  // refresh screen
  refreshModalContent: {
    justifyContent: "center",
    alignItems: "center",
    height: 180,
    width: "80%",
  },
  refreshModalHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#264653",
    textAlign: "center",
    marginBottom: 20,
  },
  refreshButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#264653",
    justifyContent: "center",
    alignItems: "center",
  },
});
