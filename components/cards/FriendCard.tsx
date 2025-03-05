import React from "react";
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from "react-native";
import PersonIcon from "../icons/PersonIcon";
import { CustomText } from "@/CustomText";
import CustomButton from "../CustomButton";

type Props = {
  item: any;
  type: "request" | "friend";
  onAction: (id: string) => void;
};

export default function FriendCard({ item, type, onAction }: Props) {
  const renderActionButton = () => {
    if (type === "request") {
      return (
        <CustomButton
          label={getStatusText()}
          onPress={() => onAction(item.id)}
          variant="fill"
          width={80}
          height={40}
        />
      );
    } else {
      return (
        <CustomButton
          label={getStatusText()}
          onPress={() => onAction(item.id)}
          variant="cancel"
          width={80}
          height={40}
        />
      );
    }
  };

  const getStatusText = () => {
    if (type === "request") {
      return "Bekleniyor...";
    } else {
      return "Sil";
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onAction(item.id)}>
      <View style={styles.iconContainer}>
        <PersonIcon size={20} color="#1E3A5F" variant="fill" />
      </View>

      <View style={styles.infoContainer}>
        <CustomText type="semibold" fontSize={14} color="#1E3A5F">
          {type === "request" ? item.receiverNickname : item.displayNickname}
        </CustomText>
      </View>

      {renderActionButton()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    width: "100%",
    height: 80,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8EFF5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
});
