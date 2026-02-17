import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
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
import { TransactionListItem } from '../components/TransactionListItem';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  addBalance,
  createCategory,
  createTable,
  deleteTransaction,
  getBalance,
  getCategories,
  getTransactions,
  saveTransaction,
} from '../services/database';
import { Category } from '../types/category';
import { Transaction } from '../types/transaction';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen = () => {
  const navigation = useNavigation<HomeNavigationProp>();
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

  const total = useMemo(
    () =>
      history.reduce(
        (acc, curr) => (curr.type === 'OUT' ? acc + curr.amount : acc),
        0,
      ),
    [history],
  );
  const remainingMoney = useMemo(() => balance - total, [balance, total]);
  const latestTransactions = useMemo(() => history.slice(0, 10), [history]);

  const loadData = useCallback(async () => {
    try {
      await createTable();
      const [data, categoryData, currentBalance] = await Promise.all([
        getTransactions(),
        getCategories(),
        getBalance(),
      ]);
      setHistory(data);
      setCategories(categoryData);
      setBalance(currentBalance);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    loadData();
    return unsubscribe;
  }, [loadData, navigation]);

  const handleDelete = (id: number) => {
    Alert.alert('Hapus Catatan', 'Yakin ingin menghapus?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        onPress: async () => {
          const transaction = history.find(item => item.id === id);
          if (transaction?.type === 'IN') {
            await addBalance(-transaction.amount);
          }
          await deleteTransaction(id);
          await loadData();
        },
      },
    ]);
  };

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
    setSelectedCategoryId(null);
    setSelectedCategoryName('Uang Masuk');
    setAmountInput('');
    setIsAmountDialogVisible(true);
  };

  const openOutFlow = () => {
    setActiveType('OUT');
    setSelectedCategoryId(null);
    setSelectedCategoryName('');
    setSearchText('');
    setIsCategoryDialogVisible(true);
  };

  const handleSelectCategory = (category: Category) => {
    setIsCategoryDialogVisible(false);
    setSelectedCategoryId(category.id);
    setSelectedCategoryName(category.name);
    setAmountInput('');
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
    setAmountInput('');
    setIsAmountDialogVisible(true);
    const latestCategories = await getCategories();
    setCategories(latestCategories);
  };

  const handleSubmitAmount = async () => {
    const parsedAmount = Number.parseInt(amountInput, 10);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0 || !activeType) {
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
      await saveTransaction(selectedCategoryId, parsedAmount, 'OUT');
    }

    resetFlowState();
    await loadData();
  };

  const filteredCategories = useMemo(
    () =>
      categories.filter(category =>
        category.name !== 'Uang Masuk' &&
        category.name.toLowerCase().includes(searchText.trim().toLowerCase()),
      ),
    [categories, searchText],
  );

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Saldo Saat Ini</Text>
          <Text variant="headlineMedium" style={styles.balanceText}>
            Rp {balance.toLocaleString('id-ID')}
          </Text>
          <Text variant="titleMedium">Total Pengeluaran</Text>
          <Text variant="headlineSmall" style={styles.totalText}>
            Rp {total.toLocaleString('id-ID')}
          </Text>
          <Text variant="titleMedium">Sisa Uang</Text>
          <Text
            variant="headlineSmall"
            style={[
              styles.remainingText,
              remainingMoney < 0 && styles.remainingMinusText,
            ]}>
            Rp {remainingMoney.toLocaleString('id-ID')}
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.buttonRow}>
        <Button
          mode="contained"
          icon="plus-circle"
          onPress={openInFlow}
          style={styles.flexBtn}
          buttonColor="green">
          Masuk
        </Button>
        <View style={styles.gap} />
        <Button
          mode="contained-tonal"
          icon="minus-circle"
          onPress={openOutFlow}
          style={styles.flexBtn}
          buttonColor="red"
          textColor="white">
          Keluar
        </Button>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.headerRow}>
        <Text variant="titleMedium">Riwayat Transaksi (10 Terakhir)</Text>
      </View>
      <View style={styles.toolsRow}>
        <Button mode="outlined" onPress={() => navigation.navigate('Categories')}>
          Kelola Kategori
        </Button>
        {history.length > 10 ? (
          <Button mode="text" onPress={() => navigation.navigate('Transactions')}>
            Lihat Semua
          </Button>
        ) : <View />}
      </View>

      <FlatList
        data={latestTransactions}
        keyExtractor={item => item.id.toString()}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        renderItem={({ item }) => (
          <TransactionListItem item={item} onDelete={handleDelete} />
        )}
      />

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
            <FlatList
              data={[...filteredCategories, { id: -1, name: 'Lainnya' }]}
              keyExtractor={item => item.id.toString()}
              style={styles.categoryList}
              renderItem={({ item }) => (
                <List.Item
                  title={item.name}
                  onPress={() => {
                    if (item.id === -1) {
                      setIsCategoryDialogVisible(false);
                      setCustomCategoryInput('');
                      setIsCustomCategoryDialogVisible(true);
                      return;
                    }
                    handleSelectCategory(item);
                  }}
                />
              )}
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
            {activeType === 'IN'
              ? 'Masukkan Nominal Masuk'
              : 'Masukkan Nominal Keluar'}
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
  container: { flex: 1, padding: 20, backgroundColor: '#f6f6f6' },
  card: { marginBottom: 20, backgroundColor: '#fff0f0' },
  balanceText: { fontWeight: 'bold', color: '#1b5e20', marginBottom: 12 },
  totalText: { fontWeight: 'bold', color: '#b71c1c' },
  remainingText: { fontWeight: 'bold', color: '#0d47a1' },
  remainingMinusText: { color: '#d32f2f' },
  searchbar: { marginBottom: 8 },
  categoryList: { maxHeight: 240 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  flexBtn: { flex: 1 },
  gap: { width: 10 },
  divider: { marginVertical: 15 },
  headerRow: {
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolsRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dialog: { backgroundColor: '#fff' },
  selectedCategoryText: { marginBottom: 10, color: '#455a64' },
});
