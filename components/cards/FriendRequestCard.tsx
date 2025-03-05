import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import PersonIcon from "../icons/PersonIcon";
import { CustomText } from "@/CustomText";
import CustomButton from "../CustomButton";
import { doc, updateDoc, deleteDoc, getDoc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/firebase.config";
import { showMessage } from "react-native-flash-message";

type Props = {
  request: any;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
};

export default function FriendRequestCard({ request, onAccept, onReject }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  // const [actionType, setActionType] = useState<string>("");
  const currentUserId = auth.currentUser?.uid;

  const handleAccept = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      // Create a new friend connection document
      await addDoc(collection(db, "friendships"), {
        senderId: request.senderId,
        senderNickname: request.senderNickname,
        receiverId: currentUserId,
        receiverNickname: request.receiverNickname,
        isConnected: true,
        participants: [request.senderId, currentUserId],
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "notifications"), {
        senderUserId: currentUserId,
        receiverNickname: request.receiverNickname,
        type: "friendRequestAccepted",
        relatedUserId: request.senderId,
        createdAt: serverTimestamp(),
        isRead: false,
      })

      // Delete the friend request
      await deleteDoc(doc(db, "friendRequests", request.id));
      
      // Call the onAccept callback
      onAccept(request.id);
      
      showMessage({
        message: "Arkadaşlık isteği kabul edildi!",
        type: "success",
      });
    } catch (error) {
      console.error("Error accepting friend request:", error);
      showMessage({
        message: "İstek kabul edilirken bir hata oluştu!",
        type: "danger",
      });
    } finally {
      setLoading(false);
      // setActionType("");
    }
  };

  const handleReject = async () => {
    if (loading) return;
    
    setLoading(true);
    // setActionType("reject");
    
    try {
      // Delete the friend request
      await deleteDoc(doc(db, "friendRequests", request.id));
      
      // Call the onReject callback
      onReject(request.id);
      
      showMessage({
        message: "Arkadaşlık isteği reddedildi!",
        type: "info",
      });
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      showMessage({
        message: "İstek reddedilirken bir hata oluştu!",
        type: "danger",
      });
    } finally {
      setLoading(false);
      // setActionType("");
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <PersonIcon size={20} color="#1E3A5F" variant="fill" />
      </View>

      <View style={styles.infoContainer}>
        <CustomText
          type="semibold"
          fontSize={14}
          color="#1E3A5F"
          style={{ marginBottom: 4 }}
        >
          {request.senderNickname}
        </CustomText>
        <CustomText type="regular" fontSize={12} color="#666">
          seninle arkadaş olmak istiyor
        </CustomText>
      </View>

      <View style={styles.actionsContainer}>
        {loading ? (
          <ActivityIndicator size="small" color="#1E3A5F" />
        ) : (
          <>
            <CustomButton
              label="Kabul Et"
              onPress={handleAccept}
              variant="fill"
              width={100}
              height={40}
            />
            <CustomButton
              label="Reddet"
              onPress={handleReject}
              variant="cancel"
              width={100}
              height={40}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  actionsContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
});