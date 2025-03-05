import React, { useState } from "react";
import { Modal, View, TextInput, StyleSheet, Dimensions, Pressable } from "react-native";
import CustomButton from "@/components/CustomButton";
import { CustomText } from "@/CustomText";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "@/firebase.config";
import InputField from "../cards/InputField";

const { width } = Dimensions.get("window");

import { useLanguage } from "@/app/LanguageContext";

type Props = {
  visible: boolean;
  onClose: () => void;
  goal: any;
  onNoteAdded: (note: string) => void;
};

export default function AddGoalNoteModal({
  visible,
  onClose,
  goal,
  onNoteAdded,
}: Props) {
  const [note, setNote] = useState("");

  // language context
  const { t } = useLanguage();

  const handleSaveNote = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const goalRef = doc(db, "users", userId, "goals", goal.id);
      await updateDoc(goalRef, {
        notes: arrayUnion(note),
      });

      onNoteAdded(note);
      setNote("");
      onClose();
    } catch (error) {
      console.error("Error adding note: ", error);
    }
  };

  const handleModelContentPress = (event: any) => {
    event.stopPropagation();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={styles.content} onPress={handleModelContentPress}>
          <CustomText
            style={styles.title}
            type="semibold"
            fontSize={18}
            color="#1E3A5F"
          >
            {t("addGoalNote.title")}
          </CustomText>
          <TextInput
            style={styles.input}
            placeholder={t("addGoalNote.notePlaceholder")}
            placeholderTextColor="#A0AEC0"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.buttonContainer}>
            <CustomButton
              label={t("addGoalNote.cancelButtonText")}
              onPress={onClose}
              variant="cancel"
              width="50%"
              height={45}
            />
            <CustomButton
              label={t("addGoalNote.addButtonText")}
              onPress={handleSaveNote}
              variant="fill"
              width="50%"
              height={45}
              marginLeft={10}
            />
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    backgroundColor: "#FCFCFC",
    borderRadius: 8,
    padding: 20,
    width: width > 768 ? "30%" : width - 40,
    alignItems: "center",
  },
  title: {
    marginBottom: 20,
  },
  input: {
    width: "100%",
    minHeight: 100, // Minimum yükseklik
    borderColor: "#E5EEFF",
    color: "#1E3A5F",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingTop: 10, // Placeholder ve ilk metin yukarıdan başlasın
    backgroundColor: "#F5F8FF",
    marginBottom: 15,
    textAlignVertical: "top", // İçeriği yukarıdan başlatır
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 20,
  },
});
