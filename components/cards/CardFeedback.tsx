import { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Modal from "react-native-modal";
import { Audio } from "expo-av";
import Lottie from "lottie-react-native";
import { CustomText } from "@/CustomText";
import { FadeIn } from "react-native-reanimated";

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
      if (type === "celebration")
        soundSource = require("@/assets/sounds/success-1-6297.mp3");
      else if (type === "success")
        soundSource = require("@/assets/sounds/success-1-6297.mp3");
      else if (type === "warning")
        soundSource = require("@/assets/sounds/success-1-6297.mp3");
      else return;

      await sound.loadAsync(soundSource);
      await sound.playAsync();
    } catch (error) {
      console.error("Ses çalınırken hata oluştu:", error);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      isVisible={isVisible}
      animationIn={"fadeIn"}
      animationOut={"fadeOut"}
      backdropColor="rgba(0, 0, 0, 0.8)"
    >
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
    backgroundColor: "#FDFDFD",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    marginTop: 20,
    textAlign: "center",
  },
});
