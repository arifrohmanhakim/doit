import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import {
  Avatar,
  Button,
  Card,
  Dialog,
  Divider,
  List,
  Portal,
  Searchbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  addBalance,
  createCategory,
  createTable,
  getBalance,
  getCategories,
  getTransactions,
  saveTransaction,
} from '../services/database';
import { Category } from '../types/category';
import { Transaction } from '../types/transaction';
import { parseTransactionDate } from '../utils/date';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

export const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeType, setActiveType] = useState<'IN' | 'OUT' | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [isCategoryDialogVisible, setIsCategoryDialogVisible] = useState(false);
  const [isCustomCategoryDialogVisible, setIsCustomCategoryDialogVisible] =
    useState(false);
  const [isAmountDialogVisible, setIsAmountDialogVisible] = useState(false);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [balance, setBalance] = useState(0);

  const totalIn = useMemo(
    () =>
      history.reduce((acc, curr) => (curr.type === 'IN' ? acc + curr.amount : acc), 0),
    [history],
  );
  const totalOut = useMemo(
    () =>
      history.reduce((acc, curr) => (curr.type === 'OUT' ? acc + curr.amount : acc), 0),
    [history],
  );
  const latestTransactions = useMemo(() => history.slice(0, 10), [history]);

  const groupedHistory = useMemo(() => {
    const today: Transaction[] = [];
    const yesterday: Transaction[] = [];
    const thisWeek: Transaction[] = [];
    const older: Transaction[] = [];

    const now = dayjs();

    latestTransactions.forEach(item => {
      const date = parseTransactionDate(item.date);
      if (!date.isValid()) {
        older.push(item);
        return;
      }
      if (date.isSame(now, 'day')) {
        today.push(item);
      } else if (date.isSame(now.subtract(1, 'day'), 'day')) {
        yesterday.push(item);
      } else if (date.isSame(now, 'week')) {
        thisWeek.push(item);
      } else {
        older.push(item);
      }
    });

    return [
      { title: 'HARI INI', data: today },
      { title: 'KEMARIN', data: yesterday },
      { title: 'MINGGU INI', data: thisWeek },
      { title: 'LAINNYA', data: older },
    ].filter(group => group.data.length > 0);
  }, [latestTransactions]);

  const loadData = useCallback(async () => {
    await createTable();
    const [data, categoryData, currentBalance] = await Promise.all([
      getTransactions(),
      getCategories(),
      getBalance(),
    ]);
    setHistory(data);
    setCategories(categoryData);
    setBalance(currentBalance);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetFlowState = () => {
    setActiveType(null);
    setAmountInput('');
    setSearchText('');
    setCustomCategoryInput('');
    setSelectedCategoryId(null);
    setSelectedCategoryName('');
    setIsCategoryDialogVisible(false);
    setIsCustomCategoryDialogVisible(false);
    setIsAmountDialogVisible(false);
  };

  const openInFlow = () => {
    setActiveType('IN');
    setSelectedCategoryName('Uang Masuk');
    setSelectedCategoryId(null);
    setIsAmountDialogVisible(true);
  };

  const openOutFlow = () => {
    setActiveType('OUT');
    setSelectedCategoryName('');
    setSelectedCategoryId(null);
    setIsCategoryDialogVisible(true);
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategoryId(category.id);
    setSelectedCategoryName(category.name);
    setIsCategoryDialogVisible(false);
    setIsAmountDialogVisible(true);
  };

  const handleSubmitCustomCategory = async () => {
    const trimmedCategory = customCategoryInput.trim();
    if (!trimmedCategory) {
      return;
    }
    const categoryId = await createCategory(trimmedCategory);
    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(trimmedCategory);
    setIsCustomCategoryDialogVisible(false);
    setIsAmountDialogVisible(true);
    const data = await getCategories();
    setCategories(data);
  };

  const handleSubmitAmount = async () => {
    const parsedAmount = Number.parseInt(amountInput, 10);
    if (!activeType || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    if (activeType === 'IN') {
      const incomeCategoryId = await createCategory('Uang Masuk');
      await addBalance(parsedAmount);
      await saveTransaction(incomeCategoryId, parsedAmount, 'IN');
    } else {
      if (!selectedCategoryId) {
        return;
      }
      if (parsedAmount > balance) {
        Alert.alert('Saldo kurang', 'Nominal pengeluaran melebihi saldo.');
        return;
      }
      await addBalance(-parsedAmount);
      await saveTransaction(selectedCategoryId, parsedAmount, 'OUT');
    }

    resetFlowState();
    await loadData();
  };

  const filteredCategories = useMemo(
    () =>
      categories.filter(item => {
        const query = searchText.trim().toLowerCase();
        return item.name !== 'Uang Masuk' && item.name.toLowerCase().includes(query);
      }),
    [categories, searchText],
  );

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
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

        <View style={styles.actionRow}>
          <Button
            mode="contained"
            icon="plus-circle"
            style={styles.incomeButton}
            contentStyle={styles.bigButtonContent}
            labelStyle={styles.bigButtonLabel}
            onPress={openInFlow}>
            Pemasukan
          </Button>
          <Button
            mode="outlined"
            icon="minus-circle"
            style={styles.expenseButton}
            contentStyle={styles.bigButtonContent}
            labelStyle={styles.expenseButtonLabel}
            onPress={openOutFlow}>
            Pengeluaran
          </Button>
        </View>

        <View style={styles.historyHeader}>
          <Text variant="headlineMedium" style={styles.historyTitle}>
            Riwayat Terakhir
          </Text>
          {history.length > 10 ? (
            <Button mode="text" onPress={() => navigation.navigate('Transactions')}>
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
                          {date.isValid() ? date.format('HH:mm') : '--:--'} • {item.type === 'IN' ? 'Pemasukan' : 'Pengeluaran'}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.transactionAmount,
                        item.type === 'IN' ? styles.amountIn : styles.amountOut,
                      ]}>
                      {item.type === 'IN' ? '+' : '-'} Rp {item.amount.toLocaleString('id-ID')}
                    </Text>
                  </Card.Content>
                </Card>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <Portal>
        <Dialog
          visible={isCategoryDialogVisible}
          onDismiss={resetFlowState}
          style={styles.dialog}>
          <Dialog.Title>Pilih Kategori Keluar</Dialog.Title>
          <Dialog.Content>
            <Searchbar
              placeholder="Cari kategori..."
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchbar}
            />
            {filteredCategories.map(item => (
              <List.Item
                key={item.id}
                title={item.name}
                onPress={() => handleSelectCategory(item)}
              />
            ))}
            <List.Item
              title="Lainnya"
              onPress={() => {
                setIsCategoryDialogVisible(false);
                setCustomCategoryInput('');
                setIsCustomCategoryDialogVisible(true);
              }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={resetFlowState}>Batal</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={isCustomCategoryDialogVisible}
          onDismiss={resetFlowState}
          style={styles.dialog}>
          <Dialog.Title>Masukkan Kategori</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nama kategori"
              mode="outlined"
              value={customCategoryInput}
              onChangeText={setCustomCategoryInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={resetFlowState}>Batal</Button>
            <Button onPress={handleSubmitCustomCategory}>Lanjut</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={isAmountDialogVisible}
          onDismiss={resetFlowState}
          style={styles.dialog}>
          <Dialog.Title>
            {activeType === 'IN' ? 'Masukkan Nominal Pemasukan' : 'Masukkan Nominal Pengeluaran'}
          </Dialog.Title>
          <Dialog.Content>
            {activeType === 'OUT' ? (
              <Text style={styles.selectedCategoryText}>
                Kategori: {selectedCategoryName}
              </Text>
            ) : null}
            <TextInput
              label="Nominal (Rp)"
              mode="outlined"
              keyboardType="numeric"
              value={amountInput}
              onChangeText={setAmountInput}
              left={<TextInput.Icon icon="cash" />}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={resetFlowState}>Batal</Button>
            <Button onPress={handleSubmitAmount}>Simpan</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f6f8fb' },
  container: { padding: 16, paddingBottom: 24 },
  summaryCard: {
    borderRadius: 28,
    backgroundColor: '#f1f3f6',
    marginBottom: 14,
  },
  summaryLabel: { color: '#65778f', marginBottom: 8 },
  balanceText: { fontWeight: '700', color: '#09122d', marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  summaryItemLabel: { color: '#8f9cb1', fontSize: 12, fontWeight: '700' },
  summaryIn: { color: '#0da837', fontWeight: '700', fontSize: 20 },
  summaryOut: { color: '#ef3d5b', fontWeight: '700', fontSize: 20 },
  incomeAvatar: { backgroundColor: '#d9f7ea' },
  expenseAvatar: { backgroundColor: '#ffe5ea' },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  incomeButton: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: '#0da837',
    shadowColor: '#0da837',
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  expenseButton: {
    flex: 1,
    borderRadius: 28,
    borderColor: '#e4e8ee',
    backgroundColor: '#ffffff',
  },
  bigButtonContent: { height: 64 },
  bigButtonLabel: { fontSize: 16, fontWeight: '700' },
  expenseButtonLabel: { fontSize: 16, fontWeight: '700', color: '#ef3d5b' },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTitle: { color: '#09122d', fontWeight: '700' },
  groupBlock: { marginBottom: 14 },
  groupTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  groupTitle: { color: '#8f9cb1', fontSize: 14, fontWeight: '700', marginRight: 8 },
  groupDivider: { flex: 1, backgroundColor: '#dde3ec' },
  transactionCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  leftInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  transactionTextWrap: { flexShrink: 1 },
  transactionTitle: { fontSize: 16, color: '#111729', fontWeight: '700' },
  transactionMeta: { fontSize: 13, color: '#8f9cb1', marginTop: 2 },
  transactionAmount: { fontSize: 16, fontWeight: '700' },
  amountIn: { color: '#0f9f65' },
  amountOut: { color: '#111729' },
  dialog: { backgroundColor: '#fff' },
  searchbar: { marginBottom: 8 },
  selectedCategoryText: { marginBottom: 10, color: '#455a64' },
});
