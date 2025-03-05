import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Path, G } from 'react-native-svg'; // react-native-svg'den bileşenler
import { TouchableOpacity } from 'react-native-gesture-handler';

// Types ve Interfaces
interface Colors {
  trunk: string;
  branch: string;
  leaf: string;
  completedLeaf: string;
  text: string;
}

interface CompletedDays {
  [key: string]: boolean;
}

interface LeafProps {
  monthIndex: number;
  weekIndex: number;
  dayIndex: number;
  leafX: number;
  leafY: number;
  rotation: number;
  isCompleted: boolean;
  onPress: () => void;
  colors: Colors;
}

const HabitTree: React.FC = () => {
  const [completedDays, setCompletedDays] = useState<CompletedDays>({});

  const colors: Colors = {
    trunk: '#654321',
    branch: '#8B4513',
    leaf: '#90EE90',
    completedLeaf: '#228B22',
    text: '#4A5568'
  };

  const handleLeafPress = (monthIndex: number, weekIndex: number, dayIndex: number): void => {
    const key = `${monthIndex}-${weekIndex}-${dayIndex}`;
    setCompletedDays(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const months: string[] = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  const leafPath = "M0,0 C-5,-10 -10,-20 0,-30 C10,-20 5,-10 0,0";

  // Yaprak komponenti
  const Leaf: React.FC<LeafProps> = ({ 
    monthIndex, 
    weekIndex, 
    dayIndex, 
    leafX, 
    leafY, 
    rotation, 
    isCompleted, 
    onPress, 
    colors 
  }) => (
    <G
      transform={`translate(${leafX},${leafY}) rotate(${rotation})`}
    >
      <TouchableOpacity onPress={onPress}>
        <Path
          d={leafPath}
          fill={isCompleted ? colors.completedLeaf : colors.leaf}
        />
        <Text
          style={[
            styles.leafText,
            { transform: [{ rotate: `${-rotation}deg` }], color: colors.text }
          ]}
        >
          {dayIndex + 1}
        </Text>
      </TouchableOpacity>
    </G>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Habit Tree</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Svg width="100%" height="100%" viewBox="0 0 1400 1800">
          {/* Ağaç Gövdesi */}
          <Path
            d="M700 1700 Q700 900 700 100"
            stroke={colors.trunk}
            strokeWidth="30"
            fill="none"
          />
          {/* Aylar için dallar */}
          {months.map((month, monthIndex) => {
            const angleStep = 360 / 12;
            const angle = (monthIndex * angleStep - 90) * (Math.PI / 180);
            const radius = 500;
            const centerX = 700;
            const centerY = 900;
            
            const endX = centerX + Math.cos(angle) * radius;
            const endY = centerY + Math.sin(angle) * radius;
            
            return (
              <G key={monthIndex}>
                <Path
                  d={`M${centerX} ${centerY} Q${(centerX + endX) / 2} ${(centerY + endY) / 2} ${endX} ${endY}`}
                  stroke={colors.branch}
                  strokeWidth="15"
                  fill="none"
                />
                <Text
                  style={[
                    styles.monthText,
                    { left: endX, top: endY, transform: [{ translateX: 30 * Math.cos(angle) }, { translateY: 30 * Math.sin(angle) }] }
                  ]}
                >
                  {month}
                </Text>
                {Array.from({ length: 4 }).map((_, weekIndex) => {
                  const weekAngle = angle + (weekIndex - 1.5) * 0.2;
                  const weekRadius = 100;
                  const weekStartX = endX;
                  const weekStartY = endY;
                  const weekEndX = weekStartX + Math.cos(weekAngle) * weekRadius;
                  const weekEndY = weekStartY + Math.sin(weekAngle) * weekRadius;

                  return (
                    <G key={`${monthIndex}-${weekIndex}`}>
                      <Path
                        d={`M${weekStartX} ${weekStartY} Q${(weekStartX + weekEndX) / 2} ${(weekStartY + weekEndY) / 2} ${weekEndX} ${weekEndY}`}
                        stroke={colors.branch}
                        strokeWidth="8"
                        fill="none"
                      />
                      {Array.from({ length: 7 }).map((_, dayIndex) => {
                        const leafSpacing = 25;
                        const leafAngle = weekAngle + (dayIndex - 3) * 0.1;
                        const leafX = weekEndX + Math.cos(leafAngle) * (leafSpacing * (dayIndex + 1));
                        const leafY = weekEndY + Math.sin(leafAngle) * (leafSpacing * (dayIndex + 1));
                        const isCompleted = !!completedDays[`${monthIndex}-${weekIndex}-${dayIndex}`];
                        const rotation = (leafAngle * 180 / Math.PI) + 90;

                        return (
                          <Leaf
                            key={`${monthIndex}-${weekIndex}-${dayIndex}`}
                            monthIndex={monthIndex}
                            weekIndex={weekIndex}
                            dayIndex={dayIndex}
                            leafX={leafX}
                            leafY={leafY}
                            rotation={rotation}
                            isCompleted={isCompleted}
                            onPress={() => handleLeafPress(monthIndex, weekIndex, dayIndex)}
                            colors={colors}
                          />
                        );
                      })}
                    </G>
                  );
                })}
              </G>
            );
          })}
        </Svg>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  scrollContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: '600',
  },
  leafText: {
    fontSize: 12,
    textAlign: 'center',
    position: 'absolute',
  },
});

export default HabitTree;
