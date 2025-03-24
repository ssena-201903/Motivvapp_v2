import { CustomText } from "@/CustomText";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

type Props = {
  label: string;
  onPress: () => void;
  variant?: "outlined" | "fill" | "disabled" | "cancel";
  width?: string | number;
  height?: number | string;
  marginLeft?: number;
};

export default function CustomButton({
  label,
  onPress,
  variant = "fill",
  width = "100%",
  height,
  marginLeft = 0,
}: Props) {
  const getButtonStyle = () => {
    switch (variant) {
      case "outlined":
        return styles.outlined;
      case "fill":
        return styles.fill;
      case "disabled":
        return styles.disabled;
      case "cancel":
        return styles.cancel;
      default:
        return styles.fill;
    }
  };

  // Responsive yükseklik hesaplaması
  const buttonHeight =
    height || (Platform.OS === "web" ? 50 : screenWidth * 0.12);

  return (
    <TouchableOpacity
      onPress={variant !== "disabled" ? onPress : undefined}
      style={[
        styles.button,
        {
          width: width,
          height: buttonHeight,
          marginLeft,
        },
        getButtonStyle(),
      ]}
      disabled={variant === "disabled"}
    >
      <CustomText
        type="medium"
        color={variant === "outlined" ? "#FFA38F" : "white"}
        fontSize={Platform.OS === "web" ? 14 : 12}
        style={[
          styles.text,
          variant === "disabled" && styles.disabledText,
          variant === "outlined" && styles.outlinedText,
          variant === "cancel" && styles.cancelText,
        ]}
      >
        {label}
      </CustomText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "center",
  },
  text: {
    textAlign: "center",
  },
  fill: {
    backgroundColor: "#1E3A5F",
  },
  outlined: {
    borderWidth: 2,
    borderColor: "#FFA38F",
    backgroundColor: "transparent",
  },
  outlinedText: {
    color: "#FFA38F",
    fontWeight: "400",
  },
  disabled: {
    backgroundColor: "#1E3A5F",
    opacity: 0.7,
  },
  disabledText: {
    color: "white",
    opacity: 0.8,
  },
  cancel: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#1E3A5F",
  },
  cancelText: {
    color: "#1E3A5F",
    fontWeight: "400",
  },
});
