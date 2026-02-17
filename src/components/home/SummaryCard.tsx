import React from 'react';
import { View } from 'react-native';
import { Avatar, Card, Text } from 'react-native-paper';
import { homeStyles as styles } from './styles';

type SummaryCardProps = {
  balance: number;
  totalIn: number;
  totalOut: number;
};

export const SummaryCard = ({ balance, totalIn, totalOut }: SummaryCardProps) => (
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
            color="#0f9f65"
          />
          <View>
            <Text style={styles.summaryItemLabel}>PEMASUKAN</Text>
            <Text style={styles.summaryIn}>+{(totalIn / 1000000).toFixed(1)}jt</Text>
          </View>
        </View>
        <View style={styles.summaryItem}>
          <Avatar.Icon
            size={42}
            icon="arrow-down"
            style={styles.expenseAvatar}
            color="#ef3d5b"
          />
          <View>
            <Text style={styles.summaryItemLabel}>PENGELUARAN</Text>
            <Text style={styles.summaryOut}>-{(totalOut / 1000000).toFixed(1)}jt</Text>
          </View>
        </View>
      </View>
    </Card.Content>
  </Card>
);
