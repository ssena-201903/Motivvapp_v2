import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Dimensions,
  Alert,
  TouchableOpacity,
  Keyboard,
  Platform,
} from "react-native";

// components
import InputField from "@/components/cards/InputField";
import CustomButton from "@/components/CustomButton";
import { CustomText } from "@/CustomText";

// firebase
import { db, auth } from "@/firebase.config";
import { doc, collection, addDoc } from "firebase/firestore";
import CloseIcon from "@/components/icons/CloseIcon";

// language
import { useLanguage } from "@/app/LanguageContext";

// Dimensions
const { width } = Dimensions.get("window");

import { showMessage } from "react-native-flash-message";

type HabitVariant = "Sport" | "Book" | "Vocabulary" | "Custom";

interface Props {
  variant: HabitVariant;
  visible: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}

interface FormData {
  goalDays: string;
  dailyDuration: string;
  customText: string;
  dailyAmount: string;
}

export default function AddOtherHabitModal({
  variant,
  visible,
  onClose,
  onAdd,
}: Props) {
  const userId = auth.currentUser?.uid;
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    goalDays: "",
    dailyDuration: "",
    customText: "",
    dailyAmount: "",
  });

  // language context
  const { t } = useLanguage();

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const validateInputs = (): boolean => {
    const { goalDays, dailyDuration, customText, dailyAmount } = formData;

    if (variant === "Custom") {
      if (!customText.trim()) {
        showMessage({
          message: t("alerts.alertFillHabitName"),
          type: "danger",
        });
        return false;
      }
      if (!dailyAmount.trim()) {
        showMessage({
          message: t("alerts.alertFillDailyAmount"),
          type: "danger",
        });
        return false;
      }
      if (!goalDays.trim()) {
        showMessage({
          message: t("alerts.alertFillGoalDays"),
          type: "danger",
        });
        return false;
      }
      return true;
    }

    if (variant === "Vocabulary") {
      if (!dailyAmount.trim()) {
        showMessage({
          message: t("alerts.alertFillDailyWordAmount"),
          type: "danger",
        });
        return false;
      }
      if (!goalDays.trim()) {
        showMessage({
          message: t("alerts.alertFillGoalDays"),
          type: "danger",
        });
        return false;
      }
      return true;
    }

    // For other variants (Sport, Book)
    if (!goalDays.trim() || !dailyDuration.trim()) {
      showMessage({
        message: t("alerts.alertFillTheFields"),
        type: "danger",
      });
      return false;
    }

    return true;
  };

  const capitalizeText = (text: string): string => {
    return text
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // SEND DATA TO DB
  const handleSendDataToDb = async () => {
    if (isSaving) return;

    try {
      if (!validateInputs()) {
        return;
      }

      setIsSaving(true);

      if (!userId) {
        console.error("User not found");
        return;
      }

      const habitData = {
        duration:
          variant !== "Vocabulary" ? parseFloat(formData.dailyDuration) : null,
        goalNumber: parseFloat(formData.goalDays),
        customText:
          variant === "Custom" ? capitalizeText(formData.customText) : null,
        dailyAmount:
          variant === "Vocabulary" || variant === "Custom"
            ? parseFloat(formData.dailyAmount)
            : null,
        isDone: false,
        isArchieved: false,
        variant,
        streakDays: 0,
        doneNumber: 0,
        createdAt: new Date(),
        finishedAt: null,
        lastChangeAt: new Date().toISOString().split("T")[0],
      };

      const userDocRef = doc(db, "users", userId);
      const habitsDocRef = collection(userDocRef, "habits");

      const docRef = await addDoc(habitsDocRef, habitData);
      if (docRef.id) {
        onAdd({ id: docRef.id, ...habitData });
        onClose();
      }

      // Keyboard.dismiss();
      // onClose();
    } catch (error) {
      console.error("Error saving data to db:", error);
      Alert.alert("Error", "Failed to save habit. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // RENDER INPUT FIELDS
  const renderInputFields = () => {
    switch (variant) {
      case "Custom":
        return (
          <>
            <View style={styles.formItem}>
              <InputField
                label={t("otherHabitModal.habitName")}
                placeholder={t("otherHabitModal.habitNamePlaceholder")}
                value={formData.customText}
                onChangeText={(text) => handleInputChange("customText", text)}
              />
            </View>
            <View style={styles.formItem}>
              <InputField
                label={t("otherHabitModal.dailyDurationCustom")}
                placeholder={t(
                  "otherHabitModal.dailyDurationCustomPlaceholder"
                )}
                keyboardType="numeric"
                value={formData.dailyAmount}
                onChangeText={(text) => handleInputChange("dailyAmount", text)}
              />
            </View>
          </>
        );
      case "Vocabulary":
        return (
          <View style={styles.formItem}>
            <InputField
              label={t("otherHabitModal.dailyWordAmount")}
              placeholder={t("otherHabitModal.dailyWordAmountPlaceholder")}
              keyboardType="numeric"
              value={formData.dailyAmount}
              onChangeText={(text) => handleInputChange("dailyAmount", text)}
            />
          </View>
        );
      default:
        return (
          <View style={styles.formItem}>
            <InputField
              label={t("otherHabitModal.dailyDurationGeneral")}
              placeholder={t("otherHabitModal.dailyDurationGeneralPlaceholder")}
              keyboardType="numeric"
              value={formData.dailyDuration}
              onChangeText={(text) => handleInputChange("dailyDuration", text)}
            />
          </View>
        );
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        if (!isSaving) onClose();
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.modalView}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              if (!isSaving) onClose();
            }}
          >
            <CloseIcon size={24} color="#1E3A5F" />
          </TouchableOpacity>
          <View style={styles.modalContent}>
            <CustomText
              style={styles.modalTitle}
              type="bold"
              fontSize={20}
              color="#1E3A5F"
            >
              {/* {variant} {t("otherHabitModal.title")} */}
              {variant === "Custom" && (
                <CustomText type="bold" fontSize={20} color="#1E3A5F">
                  {t("otherHabitModal.titleCustom")}
                </CustomText>
              )}
              {variant === "Book" && (
                <CustomText type="bold" fontSize={20} color="#1E3A5F">
                  {t("otherHabitModal.titleBook")}
                </CustomText>
              )}
              {variant === "Sport" && (
                <CustomText type="bold" fontSize={20} color="#1E3A5F">
                  {t("otherHabitModal.titleSport")}
                </CustomText>
              )}
              {variant === "Vocabulary" && (
                <CustomText type="bold" fontSize={20} color="#1E3A5F">
                  {t("otherHabitModal.titleVocabulary")}
                </CustomText>
              )}
            </CustomText>
            <View style={styles.inputContainer}>
              {renderInputFields()}
              <View style={styles.formItem}>
                <InputField
                  label={t("otherHabitModal.goalDays")}
                  placeholder={t("otherHabitModal.goalDaysPlaceholder")}
                  keyboardType="numeric"
                  value={formData.goalDays}
                  onChangeText={(text) => handleInputChange("goalDays", text)}
                />
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <CustomButton
                label={
                  isSaving
                    ? t("otherHabitModal.savingButtonText")
                    : t("otherHabitModal.saveButtonText")
                }
                onPress={handleSendDataToDb}
                width="50%"
                height={50}
                variant="fill"
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "100%",
    maxWidth: 370,
    maxHeight: "90%",
    backgroundColor: "#FCFCFC",
    paddingHorizontal: 30,
    paddingVertical: 30,
    paddingTop: 60,
    borderRadius: 8,
    alignItems: "center",
    // elevation: 5,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
  },
  modalContent: {
    width: "100%",
    alignItems: "center",
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 40,
    width: "100%",
    alignItems: "center",
  },
  formItem: {
    width: "100%",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
});
