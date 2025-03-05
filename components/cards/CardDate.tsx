import React from "react";
import { StyleSheet, View, Dimensions, Text } from "react-native";

const { width } = Dimensions.get("window");

type Props = {
  variant: "active" | "passive";
  text: string;
}

export default function CardDate ({ variant, text } : Props) {
  return (
    <View
      style={[
        styles.container,
        variant === "active" ? styles.active : styles.passive,
      ]}
    >
      <Text
        style={[
          styles.dateText,
          variant === "active" ? styles.activeText : styles.passiveText,
        ]}
      >
        {text}
      </Text>
      <View style={styles.todos}>
        <Text style={styles.todosText}>Todo1</Text>
        <Text style={styles.todosText}>Todo2</Text>
        <Text style={styles.todosText}>Todo3</Text>
        <Text style={styles.todosText}>Todo4</Text>
        <Text style={styles.todosText}>Todo5</Text>
        <Text style={styles.todosText}>Todo6</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: width - 40,
    height: 55,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  dateText: {
    fontSize: 14,
  },
  active: {
    backgroundColor: "#EFF4FF",
  },
  passive: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#264653",
    opacity: 0.2,
  },
  activeText: {
    color: "#264653",
    fontWeight: 800,
    fontSize: 16,
  },
  passiveText: {
    color: "#264653",
    fontWeight: 400,
  },
  todos: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: width - 110,
    height: 40,
    backgroundColor: "white",
    marginHorizontal: 10,
    marginVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  todosText: {
    color: "#264653",
    opacity: 0.7,
    marginLeft: 8,
  },
});
