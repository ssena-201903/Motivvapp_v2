import { View, StyleSheet, Dimensions, TouchableOpacity, Pressable } from "react-native";
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
  const progressAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  // language context
  const { t } = useLanguage();

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percentDone,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percentDone]);

  const handlePress = () => {
    // Animate opacity for feedback
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.6,
        duration: 200,
        useNativeDriver: false,
      })
    ]).start();

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

  // Calculate progress bar color based on percentage
  // const getProgressColor = () => {
  //   if (percentDone < 30) return "#FF6B6B";  // Red for low progress
  //   if (percentDone < 70) return "#FFD166";  // Yellow for medium progress
  //   return "#06D6A0";  // Green for high progress
  // };

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  // const progressColor = getProgressColor();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.labelContainer} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <CustomText 
          color="#1E3A5F"
          fontSize={16}
          type="semibold"
          style={styles.labelText}
        >
          {text}
        </CustomText>
        
        {variant === "home" && (
          <View style={styles.seeAllContainer}>
            <CustomText
              color="#666"
              fontSize={12}
              type="medium"
              style={styles.seeAllText}
            >
              Hepsini Gör
            </CustomText>
            <View style={styles.arrowContainer}>
              <ArrowIcon size={12} color="#666" variant="right" />
            </View>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <View style={styles.progressMetadata}>
          <CustomText 
            color="#888"
            fontSize={12}
            type="medium"
          >
            {Math.round(percentDone)}%
          </CustomText>
        </View>
        
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBar, 
              { 
                width: progressBarWidth,
                backgroundColor: "#FF6B6B",
              }
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  labelText: {
    letterSpacing: 0.2,
  },
  seeAllContainer: {
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.8,
  },
  seeAllText: {
    marginRight: 4,
  },
  arrowContainer: {
    opacity: 0.6,
  },
  progressContainer: {
    width: "100%",
  },
  progressMetadata: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  progressBarBackground: {
    width: "100%",
    height: 6,
    borderRadius: 6,
    backgroundColor: "#E8EFF5",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 6,
  },
});