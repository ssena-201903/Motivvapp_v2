import { CustomText } from "@/CustomText";
import { View, StyleSheet, Modal, Pressable, Image } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase.config";
import { router } from "expo-router";
import LogoutIcon from "../icons/LogoutIcon";
import PersonIcon from "../icons/PersonIcon";
import GoalsIcon from "../icons/GoalsIcon";
import LeafIcon from "../icons/LeafIcon";
import SettingsIcon from "../icons/SettingsIcon";

import { useLanguage } from "@/app/LanguageContext";
import SparklesIcon from "../icons/SparklesIcon";

type ProfileModalProps = {
  isModalVisible: boolean;
  onClose: () => void;
  userId: string | undefined;
};

export default function ProfileModal({
  isModalVisible,
  onClose,
  userId,
}: ProfileModalProps) {
  if (!isModalVisible) return null;

  const currentUser = auth.currentUser?.email;

  // language context
  const { t, language, setLanguage } = useLanguage();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/(auth)/login");
      onClose();
    } catch (error) {
      console.log("logout error", error);
    }
  };

  const handleProfileRoute = () => {
    router.push("/profile");
    onClose();
  };

  const handleHabitsRoute = () => {
    router.push("/habits");
    onClose();
  };

  const handleGoalsRoute = () => {
    router.push("/goals");
    onClose();
  };

  const handleMemoriesRoute = () => {
    router.push("/memories");
    onClose();
  }

  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container}>
          <View style={styles.topSection}>
            <View style={styles.topSectionSubHeaderContainer}>
              <Image
                source={require("@/assets/images/brandName2.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <CustomText 
                style={styles.topSectionSubHeader}
                fontSize={12}
                color="#1E3A5F"
                type="regular"
              >
                {currentUser}
              </CustomText>
            </View>
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <LogoutIcon size={24} color="#f8f8f8" />
            </Pressable>
          </View>
          <View style={styles.menus}>
            <Pressable style={styles.menuItem} onPress={handleProfileRoute}>
              <PersonIcon size={20} color="#1E3A5F"/>
              <CustomText style={styles.menuItemText} type="medium">{t("profileModal.profile")}</CustomText>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={handleGoalsRoute}>
              <GoalsIcon size={20} color="#1E3A5F" variant="fill"/>
              <CustomText style={styles.menuItemText} type="medium">{t("profileModal.goals")}</CustomText>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={handleHabitsRoute}>
              <LeafIcon size={20} color="#1E3A5F" variant="fill"/>
              <CustomText style={styles.menuItemText} type="medium">{t("profileModal.habits")}</CustomText>
            </Pressable>
            <Pressable style={styles.menuItem}>
              <SettingsIcon size={20} color="#1E3A5F" variant="fill"/>
              <CustomText style={styles.menuItemText} type="medium">{t("profileModal.settings")}</CustomText>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={handleMemoriesRoute}>
              <SparklesIcon size={20} color="#1E3A5F" variant="fill"/>
              <CustomText style={styles.menuItemText} type="medium">{t("profileModal.memories")}</CustomText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
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
  container: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "#FCFCFC",
    position: "absolute",
    top: 0,
    right: 0,
    width: 260,
    height: "100%",
    padding: 20,
  },
  topSection: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 40,
    marginBottom: 40,
  },
  topSectionSubHeaderContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  topSectionSubHeader: {
    opacity: 0.8,
    marginTop: -4,
    marginLeft: 6,
  },
  logo: {
    width: 100,
    height: 40,
  },
  logoutButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E3A5F",
    padding: 8,
    borderRadius: 12,
  },
  menus: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    height: 180,
    // marginVertical: 10,
  },
  menuItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#F5F8FF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuItemText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: 500,
    color: "#1E3A5F",
  },
});
