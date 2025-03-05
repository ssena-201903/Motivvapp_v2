import { StyleSheet, Pressable, Dimensions } from "react-native";
import { CustomText } from "@/CustomText";
import MovieIcon from "../icons/MovieIcon";
import CarIcon from "../icons/CarIcon";
import FoodIcon from "../icons/FoodIcon";
import WalletIcon from "../icons/WalletIcon";
import ActivityIcon from "../icons/ActivityIcon";
import BookIcon from "../icons/BookIcon";
import SellIcon from "../icons/SellIcon";

const { width } = Dimensions.get("window");

type Props = {
  inlineText: string;
  categoryId: string;
  onCategoryPress: (categoryId: string) => void;
  iconFamily?: "fontawesome" | "ionicons" | "material-community";
};

export default function CardGoal({
  inlineText,
  categoryId,
  onCategoryPress,
}: Props) {
  return (
    <Pressable
      style={styles.container}
      onPress={() => onCategoryPress(categoryId)}
    >
      {categoryId === "Movie" && (
        <MovieIcon size={18} color="#1E3A5F" variant="fill" />
      )}
      {categoryId === "Place" && (
        <CarIcon size={22} color="#1E3A5F" variant="fill" />
      )}
      {categoryId === "Food" && (
        <FoodIcon size={22} color="#1E3A5F" variant="fill" />
      )}
      {categoryId === "Buy" && (
        <WalletIcon size={22} color="#1E3A5F" variant="fill" />
      )}
      {categoryId === "Activity" && (
        <ActivityIcon size={26} color="#1E3A5F" variant="fill" />
      )}
      {categoryId === "Book" && (
        <BookIcon size={22} color="#1E3A5F" variant="fill" />
      )}
      <CustomText 
        style={styles.inlineText}
        color="#1E3A5F"
        type="medium"
        fontSize={12}
      >
        {inlineText}
      </CustomText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    // flexDirection: width > 768 ? "column" : "row",
    flexDirection: "column",
    width: "31%",
    height: width > 768 ? 80 : 65,
    backgroundColor: "white",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inlineText: {
    // marginLeft: width > 768 ? 0 : 8,
    // marginTop: width > 768 ? 8 : 0,
    marginTop: 8,
    opacity: 0.8,
  },
});
