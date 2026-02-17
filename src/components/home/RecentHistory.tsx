import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Divider,
  Dialog,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';
import { AnimatedPressable } from '../AnimatedPressable';
import { Transaction } from '../../types/transaction';
import { parseTransactionDate } from '../../utils/date';
import { createHomeStyles } from './styles';

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
}: RecentHistoryProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createHomeStyles(theme), [theme]);
  const [selectedItem, setSelectedItem] = useState<Transaction | null>(null);

  const handleCloseDialog = () => setSelectedItem(null);

  const handleDeleteSelected = () => {
    if (!selectedItem) {
      return;
    }
    onDeleteItem(selectedItem);
    handleCloseDialog();
  };

  return (
    <>
      <View style={styles.historyHeader}>
        <Text variant="headlineSmall" style={styles.historyTitle}>
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
            <Text variant="labelLarge" style={styles.groupTitle}>
              {group.title}
            </Text>
            <Divider style={styles.groupDivider} />
          </View>
          {group.data.map(item => {
            const iconData = mapCategoryStyle(item.category);
            const date = parseTransactionDate(item.date);
            const iconBackgroundStyle = { backgroundColor: iconData.bg };
            return (
              <AnimatedPressable
                key={item.id}
                onLongPress={() => setSelectedItem(item)}
                containerStyle={styles.transactionPressable}
              >
                <Card style={styles.transactionCard} mode="contained">
                  <Card.Content style={styles.transactionContent}>
                    <View style={styles.leftInfo}>
                      <Avatar.Icon
                        size={28}
                        icon={iconData.icon}
                        style={iconBackgroundStyle}
                        color={iconData.iconColor}
                      />
                      <View style={styles.transactionTextWrap}>
                        <Text
                          variant="titleMedium"
                          style={styles.transactionTitle}
                        >
                          {item.category}
                        </Text>
                        <Text variant="bodyMedium" style={styles.transactionMeta}>
                          {item.description?.trim() ||
                            (item.type === 'IN' ? 'Pemasukan' : 'Pengeluaran')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.rightInfo}>
                      <Text>
                        {date.isValid() ? date.format('HH:mm') : '--:--'}
                      </Text>
                      <Text
                        variant="titleMedium"
                        style={[
                          styles.transactionAmount,
                          item.type === 'IN' ? styles.amountIn : styles.amountOut,
                        ]}
                      >
                        {item.type === 'IN' ? '+' : '-'} Rp{' '}
                        {item.amount.toLocaleString('id-ID')}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              </AnimatedPressable>
            );
          })}
        </View>
      ))}

      <Portal>
        <Dialog
          visible={Boolean(selectedItem)}
          onDismiss={handleCloseDialog}
          style={styles.dialog}
        >
          <Dialog.Title>Hapus Transaksi</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Apakah Anda yakin akan menghapus transaksi "
              {selectedItem?.category ?? '-'}"
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCloseDialog}>Batal</Button>
            <Button textColor={theme.colors.error} onPress={handleDeleteSelected}>
              Hapus
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};
