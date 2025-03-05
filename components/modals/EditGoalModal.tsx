import React, { useState } from "react";
import {
  View,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from "react-native";
import CustomButton from "@/components/CustomButton";
import { CustomText } from "@/CustomText";
import { useLanguage } from "@/app/LanguageContext";

const { width } = Dimensions.get("window");

type EditGoalModalProps = {
  visible: boolean;
  onClose: () => void;
  initialName: string;
  onSave: (updatedName: string) => void;
};

export default function EditGoalModal({ visible, onClose, initialName, onSave }: EditGoalModalProps) {
  const [name, setName] = useState(initialName);
  const { t } = useLanguage();

  const handleSave = () => {
    if (name.trim() !== "") {
      onSave(name.trim());
      onClose();
    }
  };

  const handleModelContentPress = (event: any) => {
    event.stopPropagation();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <Pressable style={styles.modalContent} onPress={handleModelContentPress}>
          <CustomText type="semibold" fontSize={18} color="#1E3A5F" style={{ marginBottom: 20 }}>
            {t("editModal.titleGoal")}
          </CustomText>

          <TextInput
            style={styles.modalInput}
            value={name}
            onChangeText={setName}
            placeholder={t("editModal.placeholderGoal")}
            placeholderTextColor="#999"
            autoFocus
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity>
              <CustomButton label={t("editModal.cancelButtonText")} onPress={onClose} variant="cancel" width={120} height={45} />
            </TouchableOpacity>
            <TouchableOpacity>
              <CustomButton
                label={t("editModal.saveButtonText")}
                onPress={handleSave}
                variant="fill"
                width={120}
                height={45}
                marginLeft={10}
              />
            </TouchableOpacity>
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: width > 768 ? "50%" : width - 40,
    alignItems: "center",
  },
  modalInput: {
    flex: 1,
    padding: 14,
    fontSize: 14,
    color: "#1E3A5F",
    fontWeight: "medium",
    width: "100%",
    height: 50,
    borderRadius: 8,
    backgroundColor: "#F5F8FF",
    borderWidth: 1,
    borderColor: "#E5EEFF",
  },
  modalButtons: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
});
