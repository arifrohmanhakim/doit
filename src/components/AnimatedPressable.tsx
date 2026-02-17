import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

type AnimatedPressableProps = PressableProps & {
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  pressedScale?: number;
};

export const AnimatedPressable = ({
  children,
  containerStyle,
  pressedScale = 0.98,
  onPressIn,
  onPressOut,
  ...pressableProps
}: AnimatedPressableProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = useCallback(
    (toValue: number) => {
      Animated.spring(scale, {
        toValue,
        useNativeDriver: true,
        speed: 24,
        bounciness: 4,
      }).start();
    },
    [scale],
  );

  const handlePressIn: PressableProps['onPressIn'] = event => {
    animateTo(pressedScale);
    onPressIn?.(event);
  };

  const handlePressOut: PressableProps['onPressOut'] = event => {
    animateTo(1);
    onPressOut?.(event);
  };

  return (
    <Pressable
      {...pressableProps}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
      <Animated.View style={[containerStyle, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
