import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { RADIUS } from '../../constants/theme';

export interface ProgressBarProps {
  progress: number; // 0 to 1 (or 0% to 100%)
  height?: number;
  color?: string;
  trackColor?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color,
  trackColor,
  style,
}) => {
  const { colors } = useTheme();

  // Clamp progress between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const fillWidth = `${clampedProgress * 100}%` as const;

  const defaultFillColor =
    clampedProgress >= 1.0
      ? colors.negative
      : clampedProgress >= 0.8
      ? colors.warning
      : colors.positive;

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: trackColor || colors.inputBg,
          borderRadius: height / 2,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: fillWidth,
            height,
            backgroundColor: color || defaultFillColor,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
