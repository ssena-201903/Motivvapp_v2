import { StyleSheet, View, Dimensions } from 'react-native';
import CardDate from '@/components/cards/CardDate';

const { width } = Dimensions.get('window');

export default function DateTodos () {
  return (
    <View style={styles.container}>
        <CardDate variant='active' text='Tue'/>
        <CardDate variant='passive' text='Wed'/>
        <CardDate variant='passive' text='Thu'/>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "column",
        marginHorizontal: 20,
        marginVertical: 20,
        width: width - 40,
        height: 150,
        overflow: "hidden",
        // backgroundColor: "black",
    },
});
