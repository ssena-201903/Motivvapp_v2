import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { CustomText } from "@/CustomText";
import PersonIcon from "@/components/icons/PersonIcon";
import NotificationIcon from "@/components/icons/NotificationIcon";
import CloseIcon from "../icons/CloseIcon";
import { format, isToday, isYesterday } from "date-fns";
import { tr } from "date-fns/locale";

type Props = {
  item: any;
  onRead: (id: string) => void;
};

export default function NotificationRequestAcceptCard({ item, onRead }: Props) {
  const createdAt = item.createdAt.toDate(); // convert Timestamp to Date
  let formattedDate = "";

  if (isToday(createdAt)) {
    formattedDate = format(createdAt, "HH:mm", { locale: tr }); // if it's today, show only time
  } else if (isYesterday(createdAt)) {
    formattedDate = "Dün"; // show "Yesterday"
  } else {
    formattedDate = format(createdAt, "dd.MM.yyyy", { locale: tr }); // if it's not today or yesterday, show full date
  }

  const renderIcon = () => {
    switch (item.type) {
      case "friendRequestAccepted":
        return <PersonIcon size={20} color="#1E3A5F" variant="fill" />;
      default:
        return <NotificationIcon size={20} color="#1E3A5F" variant="fill" />;
    }
  };

  return (
    <TouchableOpacity style={styles.container}>
      <TouchableOpacity
        style={styles.closeIcon}
        onPress={() => {
          console.log("CloseIcon'a tıklandı! ID:", item.id);
          onRead(item.id);
        }}
      >
        <CloseIcon size={20} color="#1E3A5F" />
      </TouchableOpacity>

      <View style={styles.iconContainer}>{renderIcon()}</View>

      <View style={styles.textContainer}>
        <CustomText color="#1E3A5F" fontSize={14}>
          <CustomText type="bold" color="#1E3A5F" fontSize={14}>
            {item.receiverNickname}
          </CustomText>
          <CustomText type="medium" color="#1E3A5F" fontSize={14}>
            {" takip isteğinizi kabul etti 🎉"}
          </CustomText>
        </CustomText>
        <CustomText type="regular" color="#666" fontSize={12}>
          {formattedDate}
        </CustomText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    width: "90%",
    maxWidth: 440,
    marginHorizontal: 20,
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
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10, // increase priority
    padding: 5,
    borderRadius: 10, 
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
  textContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 5,
  },
});
