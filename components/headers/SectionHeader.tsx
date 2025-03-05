import { View, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { CustomText } from "@/CustomText";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { router } from "expo-router";
import ArrowIcon from "../icons/ArrowIcon";

import { useLanguage } from "@/app/LanguageContext";

type Props = {
  variant: "home" | "other";
  text: string;
  percentDone: number;
  id: string;
};

const { width } = Dimensions.get("screen");

export default function SectionHeader({ variant, text, percentDone, id }: Props) {
  const progressWidth = useRef(new Animated.Value(0)).current;

  // language context
  const { t } = useLanguage();

  useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: percentDone, // setting animation to percentDone
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [percentDone]);

  const handlePress = () => {
    if (variant === "home") {
      if (id === "goals") {
        router.push("/goals");
      } else if (id === "habits") {
        router.push(`/habits?percentDone=${percentDone}`);
      } else if (id === "todos") {
        router.push("/calendar");
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={handlePress}>
        <CustomText 
          color="#f8f8f8"
          fontSize={14}
          type="semibold"
        >
          {text}
        </CustomText>
        {variant === "home" && (
          <ArrowIcon size={10} color="#f8f8f8" variant="right" />
        )}
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[styles.progressBar, { width: `${percentDone}%` }]} // Responsive progress bar
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    marginTop: 20,
  },
  header: {
    flex: 3, 
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1E3A5F",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 4,
  },
  headerText: {
    color: "#f8f8f8",
    fontSize: 14,
    fontWeight: "700",
  },
  progressBarContainer: {
    flex: 7,
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginLeft: 20,
  },
  progressBarBackground: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FFA38F", // I can change later
  },
});
