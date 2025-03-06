import { View, StyleSheet, Dimensions, Text } from "react-native";
import StarIcon from "@/components/icons/StarIcon";

const { width } = Dimensions.get("window");

export default function DailyText () {
  return (
    <View style={styles.container}>
      <StarIcon size={16} color={"#264653"} variant={"fill"}  />
      <Text style={styles.text}>
        “What you do today, shapes tomorrow’s success”
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: width - 40,
    backgroundColor: "white",
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  text: {
    color: "#264653",
    fontSize: 14,
    marginLeft: 16,
  },
});
