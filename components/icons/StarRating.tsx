import { View, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import StarIcon from './StarIcon';

type StarRatingProps = {
  rating: number;
  onRatingChange: (rating: number) => void;
};

export default function StarRating ({ rating, onRatingChange }: StarRatingProps) {
  return (
    <View style={styles.starContainer}>
      {Array.from({ length: 5 }, (_, index) => (
        <Pressable style={styles.icon} key={index} onPress={() => onRatingChange(index + 1)}>
          <StarIcon size={16} color={index < rating ? "#FFA38F" : "#1E3A5F"} variant={index < rating ? "fill" : "outlined"}/>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 10,
  },
  icon: {
    marginLeft: 2,
  }
});
