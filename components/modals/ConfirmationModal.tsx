import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import CustomButton from "../CustomButton";
import { CustomText } from "@/CustomText";

import { useLanguage } from "@/app/LanguageContext";

const { width } = Dimensions.get("window");

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  // language context
  const { t } = useLanguage();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <CustomText color="#1E3A5F" fontSize={18} type="bold">
            {title}
          </CustomText>
          <CustomText
            style={styles.message}
            color="#1E3A5F"
            fontSize={16}
            type="regular"
          >
            {message}
          </CustomText>
          <View style={styles.buttonContainer}>
            <CustomButton
              label={t("confirmationHabit.cancelButtonText")}
              onPress={onCancel}
              variant="cancel"
              width="50%"
              height={45}
            />
            <CustomButton
              label={t("confirmationHabit.confirmButtonText")}
              onPress={onConfirm}
              variant="fill"
              width="50%"
              height={45}
              marginLeft={10}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#f8f8f8",
    padding: 20,
    borderRadius: 8,
    width: width > 768 ? "50%" : width - 40,
    alignItems: "center",
  },
  message: {
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  buttonContainer: {
    width: "50%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});
