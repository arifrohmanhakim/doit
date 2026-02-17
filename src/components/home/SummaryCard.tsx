import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Avatar, Card, Text, useTheme } from 'react-native-paper';
import { createHomeStyles } from './styles';

type SummaryCardProps = {
  balance: number;
  totalIn: number;
  totalOut: number;
};

export const SummaryCard = ({ balance, totalIn, totalOut }: SummaryCardProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createHomeStyles(theme), [theme]);

  return (
    <Card style={styles.summaryCard} mode="contained">
      <Card.Content>
        <Text variant="titleLarge" style={styles.summaryLabel}>
          Saldo Total
        </Text>
        <Text variant="displaySmall" style={styles.balanceText}>
          Rp {balance.toLocaleString('id-ID')}
        </Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Avatar.Icon
              size={42}
              icon="arrow-up"
              style={styles.incomeAvatar}
              color={theme.colors.primary}
            />
            <View>
              <Text variant="labelMedium" style={styles.summaryItemLabel}>
                PEMASUKAN
              </Text>
              <Text variant="titleMedium" style={styles.summaryIn}>
                +Rp {totalIn.toLocaleString('id-ID')}
              </Text>
            </View>
          </View>
          <View style={styles.summaryItem}>
            <Avatar.Icon
              size={42}
              icon="arrow-down"
              style={styles.expenseAvatar}
              color={theme.colors.error}
            />
            <View>
              <Text variant="labelMedium" style={styles.summaryItemLabel}>
                PENGELUARAN
              </Text>
              <Text variant="titleMedium" style={styles.summaryOut}>
                -Rp {totalOut.toLocaleString('id-ID')}
              </Text>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};
