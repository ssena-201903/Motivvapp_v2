import { StyleSheet, Pressable, Dimensions, View } from "react-native";
import { CustomText } from "@/CustomText";
import MovieIcon from "../icons/MovieIcon";
// import TravelIcon from "../icons/TravelIcon";
import PlaneIcon from "../icons/PlaneIcon";
import FoodIcon from "../icons/FoodIcon";
import WalletIcon from "../icons/ShoppingIcon";
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
      <View>
        {categoryId === "Movie" && (
          <MovieIcon size={20} color="#1E3A5F" variant="fill" />
        )}
        {categoryId === "Place" && <PlaneIcon size={20} color="#1E3A5F" />}
        {categoryId === "Food" && <FoodIcon size={20} color="#1E3A5F" />}
        {categoryId === "Buy" && <WalletIcon size={20} color="#1E3A5F" />}
        {categoryId === "Book" && <BookIcon size={20} color="#1E3A5F" />}
        {categoryId === "Activity" && (
          <ActivityIcon size={20} color="#1E3A5F" />
        )}
      </View>
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
    alignItems: "center",
    justifyContent: "center",
    // gap: 4,
    backgroundColor: "#FDFDFD",
    borderWidth: 1,
    borderColor: "#E8EFF5",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // iconContainer: {
  //   width: 50,
  //   height: 50,
  //   // borderRadius: "50%",
  //   borderRadius: 4,
  //   backgroundColor: "#E5EEFF",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   // backgroundColor: "#FDFDFD",
  //   borderWidth: 1,
  //   borderColor: "#E5EEFF",
  //   // shadowColor: "#000",
  //   // shadowOffset: {
  //   //   width: 0,
  //   //   height: 1,
  //   // },
  //   // shadowOpacity: 0.1,
  //   // shadowRadius: 2,
  //   // elevation: 2,
  // },
  inlineText: {
    // marginLeft: width > 768 ? 0 : 8,
    // marginTop: width > 768 ? 8 : 0,
    marginTop: 8,
    opacity: 0.8,
    // marginLeft: 8,
  },
});
