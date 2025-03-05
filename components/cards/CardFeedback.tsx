import { useEffect } from "react";
import { View, StyleSheet, Dimensions, Modal } from "react-native";
import { Audio } from "expo-av";
import Lottie from "lottie-react-native";
import { CustomText } from "@/CustomText";

type Props = {
  isVisible: boolean;
  text: string;
  type: "celebration" | "success" | "warning";
  onComplete: () => void;
  isStreak?: boolean;
};

const { width } = Dimensions.get("window");

export default function CardFeedback({
  isVisible,
  text,
  type,
  onComplete,
  isStreak,
}: Props) {
  useEffect(() => {
    if (isVisible) {
      playSound();
      const timeDuration = isStreak ? 2000 : 2000;
      const timer = setTimeout(() => {
        onComplete();
      }, timeDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const playSound = async () => {
    const sound = new Audio.Sound();
    try {
      let soundSource;
      if (type === "celebration") soundSource = require("@/assets/sounds/success-1-6297.mp3");
      else if (type === "success") soundSource = require("@/assets/sounds/success-1-6297.mp3");
      else if (type === "warning") soundSource = require("@/assets/sounds/success-1-6297.mp3");
      else return;

      await sound.loadAsync(soundSource);
      await sound.playAsync();
    } catch (error) {
      console.error("Ses çalınırken hata oluştu:", error);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.messageCard}>
          <View style={styles.animationContainer}>
            <Lottie
              source={require("@/assets/animations/firework_animate.json")}
              autoPlay
              loop={false}
              style={styles.animation}
            />
          </View>
          <CustomText 
            style={styles.messageText}
            color="#1E3A5F"
            fontSize={16}
            type="medium"
          >
            {text}
          </CustomText>
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
  animationContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  messageCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: width > 760 ? 400 : width - 40,
    paddingHorizontal: 40,
    paddingVertical: 60,
    height: 400,
    backgroundColor: "#EFF4FF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  messageText: {
    marginTop: 20,
    textAlign: "center",
  },
});
