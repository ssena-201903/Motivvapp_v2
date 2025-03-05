import React from "react";
import { View, Text, StyleSheet, Dimensions, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { CustomText } from "@/CustomText";

const { width } = Dimensions.get("window");

type Props = {
  label?: string;
  description?: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
  errorMessage?: string;
  pickerStyle?: any;
  containerStyle?: any;
};

export default function InputPicker({
  label,
  description,
  selectedValue,
  onValueChange,
  items,
  errorMessage,
  pickerStyle,
  containerStyle,
}: Props) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <CustomText style={styles.label}>{label}</CustomText>}
      {description && <CustomText style={styles.description}>{description}</CustomText>}
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={[
          styles.picker,
          errorMessage ? styles.errorPicker : {},
          pickerStyle
        ]}
      >
        {items.map((item, index) => (
          <Picker.Item key={index} label={item.label} value={item.value} />
        ))}
      </Picker>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  label: {
    fontSize: Platform.OS === "web" ? 14 : 16,
    color: "#1E3A5F",
    fontWeight: "600",
    marginBottom: 10,
  },
  description: {
    fontSize: Platform.OS === "web" ? 12 : 14,
    color: "#666",
    marginBottom: 10,
  },
  picker: {
    width: "100%",
    color: "#1E3A5F",
    backgroundColor: "#F5F8FF",
    height: 50,
    borderWidth: 1,
    borderColor: "#E5EEFF",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  errorPicker: {
    borderColor: "#FF6B6B",
  },
  errorText: {
    fontSize: 12,
    color: "#FF6B6B",
    marginTop: 4,
  },
});