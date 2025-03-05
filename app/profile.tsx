import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  ImageBackground,
} from "react-native";
import { router } from "expo-router";
import { auth, db } from "@/firebase.config";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import {
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "@/components/CustomButton";
import AlertModal from "@/components/modals/AlertModal";
import { Platform } from "react-native";
import { CustomText } from "@/CustomText";
import { useLanguage } from "@/app/LanguageContext";
import PencilIcon from "@/components/icons/PencilIcon";

const { width } = Dimensions.get("window");

export default function Profile() {
  const { t } = useLanguage();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [userData, setUserData] = useState({
    formattedName: "",
    email: "",
    password: "",
    nickname: "",
  });
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState({
    visible: false,
    field: "",
    value: "",
    newPassword: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    password: "",
  });
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    buttons: [] as Array<{
      text: string;
      variant?: "fill" | "cancel" | "outline";
      onPress: () => void;
    }>,
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const showAlert = (
    title: string,
    message: string,
    buttons: typeof alert.buttons
  ) => {
    setAlert({
      visible: true,
      title,
      message,
      buttons,
    });
  };

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, visible: false }));
  };

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.replace("/(auth)/register");
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      setUserData({
        formattedName: userDoc.data()?.formattedName || "",
        email: user.email || "",
        password: "••••••",
        nickname: userDoc.data()?.nickname || "",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      showAlert("Error", "Failed to load user data", [
        {
          text: "OK",
          onPress: closeAlert,
        },
      ]);
    }
  };

  const reauthenticateUser = async (password: string) => {
    const user = auth.currentUser;
    if (!user?.email) return false;

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {
      console.error("Reauthentication error:", error);
      return false;
    }
  };

  const handleEditField = (field: string, currentValue: string) => {
    setEditModal({
      visible: true,
      field,
      value: field === "Password" ? "" : currentValue,
      newPassword: "",
    });
    setCurrentPassword("");
  };

  const handleSaveEdit = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      switch (editModal.field) {
        case "Name":
          const userDocRef1 = doc(db, "users", user.uid);
          await updateDoc(userDocRef1, {
            formattedName: editModal.value,
          });
          setUserData((prev) => ({ ...prev, formattedName: editModal.value }));
          break;
        case "Nickname":
          const userDocRef2 = doc(db, "users", user.uid);
          await updateDoc(userDocRef2, {
            nickname: editModal.value,
          });
          setUserData((prev) => ({ ...prev, nickname: editModal.value }));
          break;
        case "Password":
          if (!currentPassword || !editModal.value) {
            showAlert("Error", "Please fill in all password fields", [
              {
                text: "OK",
                onPress: closeAlert,
              },
            ]);
            return;
          }

          if (editModal.value.length < 6) {
            showAlert("Error", "Password must be at least 6 characters long", [
              {
                text: "OK",
                onPress: closeAlert,
              },
            ]);
            return;
          }

          const isReauthenticatedPassword = await reauthenticateUser(
            currentPassword
          );
          if (!isReauthenticatedPassword) {
            showAlert("Error", "Current password is incorrect", [
              {
                text: "OK",
                onPress: closeAlert,
              },
            ]);
            return;
          }

          await updatePassword(user, editModal.value);
          setUserData((prev) => ({ ...prev, password: "••••••" }));
          break;
      }

      setEditModal({ visible: false, field: "", value: "", newPassword: "" });
      setCurrentPassword("");
      showAlert("Success", `${editModal.field} updated successfully`, [
        {
          text: "OK",
          onPress: closeAlert,
        },
      ]);
    } catch (error: any) {
      console.error("Error updating field:", error);
      showAlert(
        "Error",
        error.message || "Failed to update. Please try again.",
        [
          {
            text: "OK",
            onPress: closeAlert,
          },
        ]
      );
    }
  };

  const handleDeleteAccount = () => {
    showAlert(
      t("profilePage.accountDeletionTitle"),
      t("profilePage.accountDeletionSubtext"),
      [
        {
          text: t("profilePage.cancelButtonText"),
          variant: "cancel",
          onPress: closeAlert,
        },
        {
          text: t("profilePage.continueButtonText"),
          variant: "fill",
          onPress: () => {
            closeAlert();
            setDeleteModal({ visible: true, password: "" });
          },
        },
      ]
    );
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.password) {
      showAlert("Error", "Password is required", [
        {
          text: "OK",
          onPress: closeAlert,
        },
      ]);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      const isReauthenticated = await reauthenticateUser(deleteModal.password);
      if (!isReauthenticated) {
        showAlert("Error", "Invalid password", [
          {
            text: "OK",
            onPress: closeAlert,
          },
        ]);
        return;
      }

      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);

      setDeleteModal({ visible: false, password: "" });
      router.replace("/(auth)/register");
    } catch (error) {
      console.error("Error deleting account:", error);
      showAlert("Error", "Failed to delete account. Please try again.", [
        {
          text: "OK",
          onPress: closeAlert,
        },
      ]);
    }
  };

  const ProfileField = ({
    label,
    type,
    value,
    isPassword = false,
  }: {
    label: string;
    value: string;
    type: string;
    isPassword?: boolean;
  }) => (
    <View style={styles.fieldContainer}>
      <CustomText style={styles.fieldLabel}>{label}</CustomText>
      {type === "Nickname" && (
        <CustomText style={styles.fieldDescription}>
          {t("profilePage.descriptionNickname")}
        </CustomText>
      )}
      <View style={styles.fieldValueContainer}>
        <CustomText style={styles.fieldValue}>
          {isPassword ? (isPasswordVisible ? value : "••••••") : value}
        </CustomText>
        {type !== "Email" && (
          <TouchableOpacity
            onPress={() => handleEditField(type, value)}
            style={styles.editButton}
          >
            <PencilIcon size={18} color="#1E3A5F" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <CustomText>Loading...</CustomText>
      </View>
    );
  }

  const backgroundImage = require("@/assets/images/habitCardBg.png");

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.content}>
          <ProfileField
            type="Name"
            label={t("profilePage.labelName")}
            value={userData.formattedName}
          />
          <ProfileField
            type="Nickname"
            label={t("profilePage.labelNickname")}
            value={userData.nickname}
          />
          <ProfileField
            type="Email"
            label={t("profilePage.labelEmail")}
            value={userData.email}
          />
          <ProfileField
            type="Password"
            label={t("profilePage.labelPassword")}
            value={userData.password}
            isPassword
          />
        </View>

        <TouchableOpacity style={styles.deleteButton}>
          <CustomButton
            label={t("profilePage.deleteButtonText")}
            variant="fill"
            width="100%"
            height={50}
            onPress={handleDeleteAccount}
          />
        </TouchableOpacity>

        {/* Edit Modal */}
        <Modal visible={editModal.visible} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <CustomText type="semibold" fontSize={18} color="#1E3A5F" style={{marginBottom: 20}}>
                Edit {editModal.field}
              </CustomText>

              {editModal.field === "Password" ? (
                <>
                  <TextInput
                    style={[styles.fieldValueContainer, styles.modalInput]}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                    placeholder={t("profilePage.currentPasswordPlaceholder")}
                  />
                  <TextInput
                    style={[styles.fieldValueContainer, styles.modalInput]}
                    value={editModal.value}
                    onChangeText={(text) =>
                      setEditModal((prev) => ({ ...prev, value: text }))
                    }
                    secureTextEntry
                    placeholder={t("profilePage.newPasswordPlaceholder")}
                  />
                </>
              ) : (
                <TextInput
                  style={[styles.fieldValueContainer, styles.modalInput]}
                  value={editModal.value}
                  onChangeText={(text) =>
                    setEditModal((prev) => ({ ...prev, value: text }))
                  }
                  placeholder={`Enter new ${editModal.field.toLowerCase()}`}
                />
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity>
                  <CustomButton
                    label={t("profilePage.cancelButtonText")}
                    onPress={() => {
                      setEditModal({
                        visible: false,
                        field: "",
                        value: "",
                        newPassword: "",
                      });
                      setCurrentPassword("");
                    }}
                    variant="cancel"
                    width={120}
                    height={45}
                  />
                </TouchableOpacity>
                <TouchableOpacity>
                  <CustomButton
                    label={t("profilePage.saveButtonText")}
                    onPress={handleSaveEdit}
                    variant="fill"
                    width={120}
                    height={45}
                    marginLeft={10}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal visible={deleteModal.visible} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <CustomText 
                type="semibold"
                fontSize={18}
                color="#1E3A5F"
              >
                {t("profilePage.accountDeletionTitle")}
              </CustomText>
              <CustomText 
                style={styles.modalDescription}
                color="#1E3A5F"
                fontSize={14}
                type="regular"
              >
                {t("profilePage.confirmEmailText")}
              </CustomText>

              <TextInput
                style={styles.fieldValueContainer}
                value={deleteModal.password}
                onChangeText={(text) =>
                  setDeleteModal((prev) => ({ ...prev, password: text }))
                }
                secureTextEntry
                placeholder={t("profilePage.currentPasswordPlaceholder")}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity>
                  <CustomButton
                    label={t("profilePage.cancelButtonText")}
                    onPress={() =>
                      setDeleteModal({ visible: false, password: "" })
                    }
                    variant="cancel"
                    width={120}
                    height={45}
                  />
                </TouchableOpacity>
                <TouchableOpacity>
                  <CustomButton
                    label={t("profilePage.deleteButtonText")}
                    onPress={handleConfirmDelete}
                    variant="fill"
                    width={120}
                    height={45}
                    marginLeft={10}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Alert Modal */}
        <AlertModal
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          buttons={alert.buttons}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    // backgroundColor: "#FCFCFC",
    width: "100%",
    height: "100%",
  },
  content: {
    marginTop: 20,
    width: width > 768 ? width - 700 : width - 40,
    maxWidth: 500,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    color: "#1E3A5F",
    fontWeight: "700",
    marginBottom: 10,
  },
  fieldDescription: {
    fontSize: 12,
    color: "#1E3A5F",
    opacity: 0.8,
    marginBottom: 10,
  },
  fieldValueContainer: {
    position: "relative",
    height: 50,
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F5F8FF",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5EEFF",
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  fieldValue: {
    flex: 1,
    padding: 14,
    fontSize: 14,
    color: "#1E3A5F",
    fontWeight: "medium",
    borderRadius: 12,
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    marginHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    width: width > 760 ? width - 1200 : width - 40,
    maxWidth: 500,
    bottom: 32,
    left: "auto",
    right: "auto",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#f8f8f8",
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
  },
  modalButtons: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  modalDescription: {
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },
});
