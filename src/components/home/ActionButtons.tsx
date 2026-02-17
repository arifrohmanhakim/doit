import React from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import { homeStyles as styles } from './styles';

type ActionButtonsProps = {
  onPressIn: () => void;
  onPressOut: () => void;
};

export const ActionButtons = ({ onPressIn, onPressOut }: ActionButtonsProps) => (
  <View style={styles.actionRow}>
    <Button
      mode="contained"
      icon="plus-circle"
      style={styles.incomeButton}
      contentStyle={styles.bigButtonContent}
      labelStyle={styles.bigButtonLabel}
      onPress={onPressIn}>
      Pemasukan
    </Button>
    <Button
      mode="outlined"
      icon="minus-circle"
      style={styles.expenseButton}
      contentStyle={styles.bigButtonContent}
      labelStyle={styles.expenseButtonLabel}
      onPress={onPressOut}>
      Pengeluaran
    </Button>
  </View>
);
