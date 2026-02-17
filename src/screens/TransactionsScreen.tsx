import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Searchbar, Text, TextInput, useTheme } from 'react-native-paper';
import { TransactionListItem } from '../components/TransactionListItem';
import { createTable, getTransactions } from '../services/database';
import { Transaction } from '../types/transaction';
import { toDateKey } from '../utils/date';

const PAGE_SIZE = 20;

export const TransactionsScreen = () => {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          padding: 16,
          backgroundColor: theme.colors.background,
        },
        filterInput: { marginBottom: 10, backgroundColor: theme.colors.surface },
        filterActions: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        },
        emptyText: {
          textAlign: 'center',
          marginTop: 24,
          color: theme.colors.onSurfaceVariant,
        },
        loadMoreButton: { marginVertical: 12 },
      }),
    [theme],
  );
  const [history, setHistory] = useState<Transaction[]>([]);
  const [categoryQuery, setCategoryQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const loadData = useCallback(async () => {
    try {
      await createTable();
      const data = await getTransactions();
      setHistory(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTransactions = useMemo(() => {
    return history.filter(transaction => {
      const categoryMatch = transaction.category
        .toLowerCase()
        .includes(categoryQuery.trim().toLowerCase());

      const normalizedDateFilter = dateFilter.trim();
      const dateMatch =
        normalizedDateFilter.length === 0 ||
        toDateKey(transaction.date) === normalizedDateFilter;

      return categoryMatch && dateMatch;
    });
  }, [categoryQuery, dateFilter, history]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [categoryQuery, dateFilter]);

  const visibleTransactions = useMemo(
    () => filteredTransactions.slice(0, visibleCount),
    [filteredTransactions, visibleCount],
  );

  const hasMore = visibleCount < filteredTransactions.length;

  const loadMore = () => {
    if (!hasMore) {
      return;
    }
    setVisibleCount(prev => prev + PAGE_SIZE);
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Filter kategori..."
        value={categoryQuery}
        onChangeText={setCategoryQuery}
        style={styles.filterInput}
      />
      <TextInput
        label="Filter tanggal (YYYY-MM-DD)"
        mode="outlined"
        value={dateFilter}
        onChangeText={setDateFilter}
        style={styles.filterInput}
      />
      <View style={styles.filterActions}>
        <Text variant="bodyMedium">
          Menampilkan {visibleTransactions.length} dari {filteredTransactions.length}
        </Text>
        <Button mode="text" onPress={() => {
          setCategoryQuery('');
          setDateFilter('');
        }}>
          Reset Filter
        </Button>
      </View>

      <FlatList
        data={visibleTransactions}
        keyExtractor={item => item.id.toString()}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        renderItem={({ item }) => <TransactionListItem item={item} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Tidak ada transaksi yang cocok.</Text>
        }
        ListFooterComponent={
          hasMore ? (
            <Button mode="outlined" onPress={loadMore} style={styles.loadMoreButton}>
              Muat Lagi
            </Button>
          ) : null
        }
      />
    </View>
  );
};
