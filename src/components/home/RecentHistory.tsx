import React from 'react';
import { View } from 'react-native';
import { Avatar, Button, Card, Divider, IconButton, Text } from 'react-native-paper';
import { Transaction } from '../../types/transaction';
import { parseTransactionDate } from '../../utils/date';
import { homeStyles as styles } from './styles';

type TransactionGroup = {
  title: string;
  data: Transaction[];
};

type RecentHistoryProps = {
  groupedHistory: TransactionGroup[];
  canSeeAll: boolean;
  onPressSeeAll: () => void;
  onDeleteItem: (item: Transaction) => void;
};

const mapCategoryStyle = (name: string) => {
  const value = name.toLowerCase();
  if (value.includes('makan') || value.includes('jajan')) {
    return { icon: 'food-fork-drink', bg: '#fff1e8', iconColor: '#ff7a2f' };
  }
  if (value.includes('gaji') || value.includes('masuk')) {
    return { icon: 'cash-multiple', bg: '#e8f9ef', iconColor: '#15a56f' };
  }
  if (value.includes('transport') || value.includes('bensin')) {
    return { icon: 'car', bg: '#e8efff', iconColor: '#4b7bec' };
  }
  return { icon: 'shopping', bg: '#f2eafe', iconColor: '#8f56e9' };
};

export const RecentHistory = ({
  groupedHistory,
  canSeeAll,
  onPressSeeAll,
  onDeleteItem,
}: RecentHistoryProps) => (
  <>
    <View style={styles.historyHeader}>
      <Text variant="headlineMedium" style={styles.historyTitle}>
        Riwayat Terakhir
      </Text>
      {canSeeAll ? (
        <Button mode="text" onPress={onPressSeeAll}>
          Lihat Semua
        </Button>
      ) : null}
    </View>

    {groupedHistory.map(group => (
      <View key={group.title} style={styles.groupBlock}>
        <View style={styles.groupTitleRow}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          <Divider style={styles.groupDivider} />
        </View>
        {group.data.map(item => {
          const iconData = mapCategoryStyle(item.category);
          const date = parseTransactionDate(item.date);
          return (
            <Card key={item.id} style={styles.transactionCard} mode="contained">
              <Card.Content style={styles.transactionContent}>
                <View style={styles.leftInfo}>
                  <Avatar.Icon
                    size={44}
                    icon={iconData.icon}
                    style={{ backgroundColor: iconData.bg }}
                    color={iconData.iconColor}
                  />
                  <View style={styles.transactionTextWrap}>
                    <Text style={styles.transactionTitle}>{item.category}</Text>
                    <Text style={styles.transactionMeta}>
                      {date.isValid() ? date.format('HH:mm') : '--:--'} •{' '}
                      {item.type === 'IN' ? 'Pemasukan' : 'Pengeluaran'}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    item.type === 'IN' ? styles.amountIn : styles.amountOut,
                  ]}>
                  {item.type === 'IN' ? '+' : '-'} Rp{' '}
                  {item.amount.toLocaleString('id-ID')}
                </Text>
                <IconButton icon="delete" size={20} onPress={() => onDeleteItem(item)} />
              </Card.Content>
            </Card>
          );
        })}
      </View>
    ))}
  </>
);
