import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Dimensions,
} from "react-native";

import Modal from "react-native-modal";

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
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };

  return (
    <>
      {/* add todo modal */}
      <Modal
        isVisible={visible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropColor="rgba(0, 0, 0, 0.8)"
      >
        <View style={styles.overlay}>
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
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
});
