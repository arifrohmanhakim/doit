import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { AnimatedPressable } from '../AnimatedPressable';
import { createHomeStyles } from './styles';

type ActionButtonsProps = {
  onPressIn: () => void;
  onPressOut: () => void;
};

export const ActionButtons = ({ onPressIn, onPressOut }: ActionButtonsProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createHomeStyles(theme), [theme]);

  return (
    <View style={styles.actionRow}>
      <AnimatedPressable onPress={onPressIn} containerStyle={styles.actionButtonWrap}>
        <Button
          mode="contained"
          icon="plus-circle"
          style={styles.incomeButton}
          contentStyle={styles.bigButtonContent}
          labelStyle={styles.bigButtonLabel}>
          Pemasukan
        </Button>
      </AnimatedPressable>
      <AnimatedPressable onPress={onPressOut} containerStyle={styles.actionButtonWrap}>
        <Button
          mode="outlined"
          icon="minus-circle"
          buttonColor={theme.colors.error}
          style={styles.expenseButton}
          contentStyle={styles.bigButtonContent}
          labelStyle={styles.expenseButtonLabel}>
          Pengeluaran
        </Button>
      </AnimatedPressable>
    </View>
  );
};
