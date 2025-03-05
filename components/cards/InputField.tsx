import { CustomText } from "@/CustomText";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import EyeIcon from "../icons/EyeIcon";
import MailIcon from "../icons/MailIcon";
import LockIcon from "../icons/LockIcon";
import PersonIcon from "../icons/PersonIcon";
import PeopleIcon from "../icons/PeopleIcon";

const { width } = Dimensions.get("window");

type Props = {
  label?: string;
  description?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSave?: (field: string, currentValue: string) => void;
  isEditable?: boolean;
  secureTextEntry?: boolean;
  isPasswordField?: boolean;
  errorMessage?: string;
  inputStyle?: any;
  containerStyle?: any;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  variant?: "default" | "password" | "email" | "edit" | "name" | "nickname";
};

export default function InputField({
  label,
  description,
  placeholder,
  value,
  onChangeText,
  onSave,
  isEditable = true,
  secureTextEntry = false,
  isPasswordField = false,
  errorMessage,
  inputStyle,
  containerStyle,
  keyboardType = "default",
  variant = "default",
}: Props) {
  const [isSecure, setIsSecure] = useState(secureTextEntry || false);
  const hasIcon =
    variant === "password" ||
    variant === "email" ||
    variant === "name" ||
    variant === "nickname";

  const paddingNoIcon = variant === "default" ? 0 : 40;

  const [isFocused, setIsFocused] = useState(false);

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  const handleSavePress = () => {
    if (onSave && label) {
      onSave(label, value || "");
    }
  };

  return (
    <View
      style={[
        styles.container,
        containerStyle,
        !isEditable && { opacity: 0.5 },
        { width: "100%" },
      ]}
      pointerEvents={isEditable ? "auto" : "none"}
    >
      {label && (
        <CustomText style={styles.label} type="semibold" color="#1E3A5F">
          {label}
        </CustomText>
      )}
      {description && (
        <CustomText style={styles.description}>{description}</CustomText>
      )}
      <View
        style={[
          styles.inputContainer,
          errorMessage ? styles.errorInput : {},
          { width: "100%" },
          isFocused ? styles.focusedInput : {}, // Focus durumunda border değiştir
        ]}
      >
        {variant === "password" && (
          <TouchableOpacity style={styles.iconLeft} onPress={toggleSecureEntry}>
            <LockIcon size={18} color="#1E3A5F" />
          </TouchableOpacity>
        )}
        {variant === "email" && (
          <TouchableOpacity style={styles.iconLeft} onPress={toggleSecureEntry}>
            <MailIcon size={18} color="#1E3A5F" />
          </TouchableOpacity>
        )}
        {variant === "name" && (
          <TouchableOpacity style={styles.iconLeft} onPress={toggleSecureEntry}>
            <PersonIcon size={18} color="#1E3A5F" />
          </TouchableOpacity>
        )}
        {variant === "nickname" && (
          <TouchableOpacity style={styles.iconLeft} onPress={toggleSecureEntry}>
            <PeopleIcon size={18} color="#1E3A5F" />
          </TouchableOpacity>
        )}
        <TextInput
          style={[
            styles.input,
            {
              borderWidth: 0,
              paddingLeft: variant === "default" ? 10 : paddingNoIcon,
              paddingRight: variant === "default" ? 10 : paddingNoIcon,
            },
            Platform.select({
              ios: { fontWeight: "400" },
              android: { fontWeight: "400" },
              web: { fontWeight: "400" },
            }),
            inputStyle,
            !hasIcon && { marginLeft: 6 },
            !isEditable && styles.disabledInput,
            {
              width: "100%",
              fontSize: Platform.OS === "web" ? 16 : width * 0.04,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPasswordField && isSecure}
          keyboardType={keyboardType}
          editable={isEditable && variant !== "edit"}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {variant === "password" && (
          <TouchableOpacity
            style={styles.iconRight}
            onPress={toggleSecureEntry}
          >
            <EyeIcon
              size={18}
              color="#1E3A5F"
              variant={isSecure ? "off" : "on"}
            />
          </TouchableOpacity>
        )}
        {variant === "edit" && (
          <TouchableOpacity
            style={styles.iconRight}
            onPress={isEditable ? handleSavePress : undefined}
          >
            <Ionicons name="pencil" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    maxWidth: 500,
    alignSelf: "center",
  },
  label: {
    fontSize: Platform.OS === "web" ? 14 : width * 0.035,
    marginBottom: 10,
  },
  description: {
    fontSize: Platform.OS === "web" ? 12 : width * 0.03,
    color: "#666",
    marginBottom: 10,
  },
  focusedInput: {
    borderColor: "#1E3A5F",
    borderWidth: 1,
  },
  inputContainer: {
    position: "relative",
    borderRadius: 8,
    backgroundColor: "#F5F8FF",
    borderWidth: 1,
    borderColor: "#E5EEFF",
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 500,
    alignSelf: "center",
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: "#1E3A5F",
    fontWeight: "500",
    borderRadius: 8,
  },
  iconLeft: {
    position: "absolute",
    left: 14,
    color: "#1E3A5F",
    opacity: 0.5,
  },
  iconRight: {
    position: "absolute",
    right: 14,
    color: "#1E3A5F",
    opacity: 0.5,
  },
  errorInput: {
    borderColor: "#FF6B6B",
  },
  errorText: {
    fontSize: Platform.OS === "web" ? 12 : width * 0.03,
    color: "#FF6B6B",
    marginTop: 4,
  },
  disabledInput: {
    color: "#999",
  },
});
