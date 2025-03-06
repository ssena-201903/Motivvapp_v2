import { CustomText } from "@/CustomText";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import Modal from "react-native-modal";
import CloseIcon from "../icons/CloseIcon";
import InputField from "../cards/InputField";
import CustomButton from "../CustomButton";
import { showMessage } from "react-native-flash-message";
import { auth, db } from "@/firebase.config";
import {
  getDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";

const { width } = Dimensions.get("window");

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function FriendRequestModal({ visible, onClose }: Props) {
  const [nickname, setNickname] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentUserNickname, setCurrentUserNickname] = useState("");
  const currentsUserId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchNickname = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setCurrentUserNickname(userDoc.data().nickname); // get the current user's nickname
        }
      }
    };

    fetchNickname();
  }, []);

  const handleSendRequest = async () => {
    if (!nickname.trim()) {
      showMessage({
        message: "Lütfen geçerli bir kullanıcı adı girin!",
        type: "warning",
      });
      return;
    }

    if (nickname.trim() === currentUserNickname) {
      showMessage({
        message: "Kendinle arkadaş olamazsın!",
        type: "warning",
      });
      return;
    }

    setIsLoading(true);
    try {
      // find the user with the given nickname
      const userRef = collection(db, "users");
      const q = query(userRef, where("nickname", "==", nickname.trim()));
      const querySnapshots = await getDocs(q);

      if (querySnapshots.empty) {
        showMessage({
          message: "Kullanıcı bulunamadı!",
          type: "warning",
        });
        setIsLoading(false);
        return;
      }

      const receiverUser = querySnapshots.docs[0];
      // console.log("receiverUser", receiverUser);

      // check if a friend request has already been sent
      const requestRef = collection(db, "friendRequests");
      const existingRequestQuery = query(
        requestRef,
        where("senderId", "==", currentsUserId),
        where("receiverId", "==", receiverUser.id)
      );
      const existingRequestSnapshot = await getDocs(existingRequestQuery);

      if (!existingRequestSnapshot.empty) {
        showMessage({
          message: "İstek zaten gönderildi!",
          type: "warning",
        });
        setIsLoading(false);
        return;
      }

      await addDoc(collection(db, "friendRequests"), {
        senderId: currentsUserId,
        senderNickname: currentUserNickname,
        receiverId: receiverUser.id,
        receiverNickname: nickname.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
      });

      showMessage({
        message: "İstek gönderildi!",
        type: "success",
      });
      setNickname("");
      onClose();
    } catch (error) {
      showMessage({
        message: "İstek gönderilirken hata oluştu!",
        type: "danger",
      });
    }
  };

  return (
    <Modal
      isVisible={visible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropColor="rgba(0, 0, 0, 0.8)"
      onBackdropPress={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <CloseIcon size={26} color="#1E3A5F" />
          </TouchableOpacity>
          <CustomText
            style={styles.title}
            fontSize={18}
            type="semibold"
            color="#1E3A5F"
          >
            Arkadaş Ekle
          </CustomText>
          <InputField
            label="Arkadaşının kullanıcı adı"
            value={nickname}
            onChangeText={setNickname}
            variant="nickname"
          />

          <CustomButton
            label="Gönder"
            onPress={handleSendRequest}
            variant="fill"
            width={120}
            height={45}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#FCFCFC",
    padding: 20,
    borderRadius: 8,
    width: width > 768 ? "50%" : width - 40,
    alignItems: "center",
    position: "relative",
    gap: 20,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  title: {
    marginBottom: 30,
    marginTop: 20,
  },
});
