import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableWithoutFeedback,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from "react-native";

import Modal from "react-native-modal";

import CustomButton from "../CustomButton";
import { db } from "@/firebase.config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { useLanguage } from "@/app/LanguageContext";
import { CustomText } from "@/CustomText";
import SparklesIcon from "../icons/SparklesIcon";

const { width } = Dimensions.get("window");

interface AddMemoryModalProps {
  visible: boolean;
  selectedDate?: string;
  onClose: () => void;
  userId: string;
}

export default function AddMemoryModal({
  visible,
  selectedDate,
  onClose,
  userId,
}: AddMemoryModalProps) {
  const [memoryText, setMemoryText] = useState("");

  // language context
  const { t, language, setLanguage } = useLanguage();

  const handleSaveMemory = async () => {
    if (memoryText.trim()) {
      try {
        // pushing data to collection of memories
        const memoryDate = selectedDate || serverTimestamp();

        const memoriesRef = collection(db, "users", userId, "memories");
        await addDoc(memoriesRef, {
          memory: memoryText,
          createdAt: memoryDate,
        });

        setMemoryText("");
        onClose();
      } catch (error) {
        console.error("Error adding memory: ", error);
      }
    }
  };

  return (
    <Modal
      isVisible={visible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropColor="rgba(0, 0, 0, 0.8)"
      onBackdropPress={onClose}
    >
      <View style={styles.overlay} pointerEvents="box-none">
          <View style={styles.modalContent}>
            <View style={styles.topMemoryCard}>
              <SparklesIcon size={20} color="#1E3A5F" variant="fill" />
              <CustomText
                style={styles.headerMemoryCard}
                type="semibold"
                fontSize={18}
                color="#1E3A5F"
              >
                {t("addMemoryModal.title")}
              </CustomText>
            </View>
            <CustomText style={styles.textMemoryCard}>
              {t("addMemoryModal.subTitle")}
            </CustomText>
            <TextInput
              style={styles.textInput}
              placeholder={t("addMemoryModal.memoryPlaceholder")}
              value={memoryText}
              onChangeText={setMemoryText}
              multiline={true}
            />
            <Pressable style={styles.modelButton}>
              <CustomButton
                label={t("addMemoryModal.saveButtonText")}
                onPress={handleSaveMemory}
                variant="fill"
                width="30%"
                height={45}
              />
            </Pressable>
          </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    // width: width > 760 ? width - 930 : width - 40,
    width: width > 768 ? "50%" : width - 40,
    backgroundColor: "#FCFCFC",
    padding: 20,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "auto",
  },
  topMemoryCard: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerMemoryCard: {
    marginLeft: 10,
  },
  textMemoryCard: {
    color: "#264653",
    opacity: 0.5,
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 20,
    textAlign: "center",
  },
  textInput: {
    display: "flex",
    backgroundColor: "#F5F8FF",
    borderWidth: 1,
    borderColor: "rgba(38, 70, 83, 0.3)",
    color: "#1E3A5F",
    opacity: 0.8,
    borderRadius: 8,
    marginBottom: 20,
    padding: 10,
    height: 180,
    width: "100%",
    textAlign: "left",
    textAlignVertical: "top",
  },
  modelButton: {
    margin: 0,
    width: "100%",
  },
});
