import { Modal, View, StyleSheet, Dimensions } from "react-native";
import CustomButton from "@/components/CustomButton";
import { CustomText } from "@/CustomText";

const { width } = Dimensions.get("window");

type AlertModalProps = {
  visible: boolean;
  title: string;
  message: string;
  buttons?: Array<{
    text: string;
    variant?: "fill" | "cancel" | "outlined";
    onPress: () => void;
  }>;
};

export default function AlertModal({
  visible,
  title,
  message,
  buttons = [],
}: AlertModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.content}>
          <CustomText type="semibold" fontSize={18} color="#1E3A5F">
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
            {buttons.map((button, index) => (
              <CustomButton
                key={index}
                label={button.text}
                onPress={button.onPress}
                variant={button.variant || "fill"}
                height={45}
                style={styles.button} // Yeni stil eklendi
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    // alignItems: "center",
    // height: "auto",
    // backgroundColor: "#FCFCFC",
    // borderRadius: 12,
    // padding: 20,
    // width: Platform.select({
    //   web: Math.min(400, width - 40),
    //   default: width - 80,
    // }),
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
  // buttonContainer: {
  //   flex: 1,
  //   width: "50%",
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   marginTop: 20,
  // },
  buttonContainer: {
    width: "30%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
  },
});
