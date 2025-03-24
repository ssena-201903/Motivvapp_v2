import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";

// Import your custom icons
import EyeIcon from "../icons/EyeIcon";
import MailIcon from "../icons/MailIcon";
import LockIcon from "../icons/LockIcon";
import PersonIcon from "../icons/PersonIcon";
import PeopleIcon from "../icons/PeopleIcon";
import { CustomText } from "@/CustomText";
import PencilIcon from "../icons/PencilIcon";

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
  maxLength?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

export default function ModernInputField({
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
  maxLength,
  autoCapitalize = "none",
}: Props) {
  const [isSecure, setIsSecure] = useState(secureTextEntry || false);
  const [isFocused, setIsFocused] = useState(false);

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  const handleSavePress = () => {
    if (onSave && label) {
      onSave(label, value || "");
    }
  };

  // Determine icon based on variant
  const renderIcon = () => {
    const iconColor = "#1E3A5F";
    
    if (variant === "password") {
      return <LockIcon size={18} color={iconColor} />;
    } else if (variant === "email") {
      return <MailIcon size={18} color={iconColor} />;
    } else if (variant === "name") {
      return <PersonIcon size={18} color={iconColor} />;
    } else if (variant === "nickname") {
      return <PeopleIcon size={18} color={iconColor} variant="fill" />;
    }
    return null;
  };

  // Determine styles based on error state
  const getBorderColor = () => {
    return errorMessage ? "#FF6B6B" : "#E5EEFF";
  };

  return (
    <View
      style={[
        styles.container,
        containerStyle,
        !isEditable && { opacity: 0.7 },
      ]}
      pointerEvents={isEditable ? "auto" : "none"}
    >
      {label && (
        <CustomText 
          fontSize={14}
          style={styles.label}
          color="#1E3A5F"
          type="semibold"
        >
          {label}
        </CustomText>
      )}
      
      {description && (
        <CustomText style={styles.description}>{description}</CustomText>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
          },
        ]}
      >
        {renderIcon() && (
          <View style={styles.iconLeft}>
            {renderIcon()}
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            {
              paddingLeft: variant !== "default" ? 44 : 16,
              paddingRight: (variant === "password" || variant === "edit") ? 44 : 16,
              // color: isEditable ? "#1E3A5F" : "rgba(30, 58, 95, 0.6)",
            },
            // inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor="rgba(30, 58, 95, 0.4)"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPasswordField && isSecure}
          keyboardType={keyboardType}
          editable={isEditable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
        />

        {variant === "password" && (
          <TouchableOpacity
            style={styles.iconRight}
            onPress={toggleSecureEntry}
          >
            <EyeIcon
              size={18}
              color="#666"
              variant={isSecure ? "off" : "on"}
            />
          </TouchableOpacity>
        )}

        {variant === "edit" && (
          <TouchableOpacity
            style={styles.iconRight}
            onPress={isEditable ? handleSavePress : undefined}
          >
            <PencilIcon size={18} color="#1E3A5F" />
          </TouchableOpacity>
        )}
      </View>

      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 8,
    maxWidth: 500,
    alignSelf: "center",
  },
  label: {
    marginBottom: 8,
  },
  description: {
    fontSize: Platform.OS === "web" ? 12 : width * 0.03,
    color: "rgba(30, 58, 95, 0.6)",
    marginBottom: 8,
  },
  inputContainer: {
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E8EFF5",
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    overflow: "hidden",
    // shadowColor: "#1E3A5F",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.05,
    // shadowRadius: 4,
    // elevation: 2,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: Platform.OS === "web" ? 16 : width * 0.04,
    color: "#1E3A5F",
    fontWeight: "400",
  },
  iconLeft: {
    position: "absolute",
    left: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  iconRight: {
    position: "absolute",
    right: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    marginTop: 6,
  },
  errorText: {
    fontSize: Platform.OS === "web" ? 12 : width * 0.03,
    color: "#FF6B6B",
    fontWeight: "500",
  },
});