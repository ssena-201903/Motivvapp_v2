import React from "react";
import { View, StyleSheet, Dimensions, Pressable } from "react-native";
import BoxIcon from "../icons/BoxIcon";
import { CustomText } from "@/CustomText";
import TodoIcon from "../icons/TodoIcon";
import TrashIcon from "../icons/TrashIcon";

const { width } = Dimensions.get("window");

type Props = {
  id: string;
  text: string;
  isCompleted: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  type?: "birthday" | "todo";
};

export default function CardTodo({
  id,
  text,
  isCompleted,
  onToggle,
  onDelete,
  type,
}: Props) {
  return (
    <View style={[styles.container, isCompleted && styles.doneTodo]}>
      <View style={styles.leftView}>
        <View style={styles.leftIconContainer}>
          <TodoIcon
            size={20}
            color={isCompleted ? "#1E3A5F" : "#1E3A5FCC"}
            variant="fill"
            type={type}
          />
        </View>
        <View style={styles.leftTextContainer}>
          <CustomText
            style={[styles.leftText, isCompleted && styles.strikethrough]}
            color="#1E3A5F"
            fontSize={16}
            type="medium"
          >
            {text}
          </CustomText>
        </View>
      </View>
      <View style={styles.rightContainer}>
        {!isCompleted && (
          <Pressable onPress={() => onDelete(id)} style={styles.deleteButton}>
            <TrashIcon size={20} color="#1E3A5F" />
          </Pressable>
        )}
        <Pressable onPress={() => onToggle(id)}>
          <BoxIcon
            size={20}
            color="#1E3A5F"
            variant={isCompleted ? "fill" : "outlined"}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    minHeight: 70,
    backgroundColor: "#FDFDFD",
    borderWidth: 1,
    borderColor: "#E8EFF5",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flex: 1,
  },
  doneTodo: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 70,
    backgroundColor: "#E5EEFF",
    borderWidth: 1,
    borderColor: "#CEDEEB",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flex: 1,
  },
  completedContainer: {
    backgroundColor: "#B5C4E4",
  },
  leftView: {
    width: "45%",
    height: "auto",
    flexDirection: "row",
    alignItems: "center",
  },
  leftIconContainer: {
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  leftTextContainer: {
    flex: 1,
    overflow: "hidden",
  },
  leftText: {
    color: "#1E3A5F",
    fontWeight: "400",
    fontSize: 14,
  },
  rightContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "45%",
    height: "100%",
  },
  strikethrough: {
    textDecorationLine: "line-through",
    color: "#1E3A5F",
  },
  deleteButton: {
    marginRight: 20,
    opacity: 0.85,
  },
});
