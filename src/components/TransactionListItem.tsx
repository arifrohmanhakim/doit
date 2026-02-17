import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, List, Text } from 'react-native-paper';
import { Transaction } from '../types/transaction';
import { formatTransactionDateTime } from '../utils/date';

type TransactionListItemProps = {
  item: Transaction;
  onDelete?: (id: number) => void;
};

export const TransactionListItem = ({
  item,
  onDelete,
}: TransactionListItemProps) => (
  <List.Item
    title={item.category}
    description={
      item.description?.trim()
        ? `${formatTransactionDateTime(item.date)} • ${item.description}`
        : formatTransactionDateTime(item.date)
    }
    // eslint-disable-next-line react/no-unstable-nested-components
    left={props => <List.Icon {...props} icon="wallet-outline" />}
    // eslint-disable-next-line react/no-unstable-nested-components
    right={() => (
      <View style={styles.itemRight}>
        <Text
          variant="titleSmall"
          style={[
            styles.itemAmount,
            item.type === 'IN' ? styles.itemAmountIn : styles.itemAmountOut,
          ]}>
          {item.type === 'IN' ? '+' : '-'} Rp {item.amount.toLocaleString('id-ID')}
        </Text>
        {onDelete ? (
          <IconButton icon="delete" size={20} onPress={() => onDelete(item.id)} />
        ) : null}
      </View>
    )}
    style={styles.listItem}
  />
);

const styles = StyleSheet.create({
  listItem: { backgroundColor: 'white', marginBottom: 8, borderRadius: 8 },
  itemRight: { flexDirection: 'row', alignItems: 'center' },
  itemAmount: { fontWeight: 'bold', marginRight: 10 },
  itemAmountIn: { color: '#2e7d32' },
  itemAmountOut: { color: '#b71c1c' },
});
