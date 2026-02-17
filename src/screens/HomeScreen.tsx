import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
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
import { ActionButtons } from '../components/home/ActionButtons';
import { RecentHistory } from '../components/home/RecentHistory';
import { SummaryCard } from '../components/home/SummaryCard';
import { homeStyles as styles } from '../components/home/styles';
import { TransactionDialogs } from '../components/home/TransactionDialogs';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
      history.reduce(
        (acc, curr) => (curr.type === 'IN' ? acc + curr.amount : acc),
        0,
      ),
    [history],
  );
  const totalOut = useMemo(
    () =>
      history.reduce(
        (acc, curr) => (curr.type === 'OUT' ? acc + curr.amount : acc),
        0,
      ),
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

  const handleOpenCustomCategory = () => {
    setIsCategoryDialogVisible(false);
    setCustomCategoryInput('');
    setIsCustomCategoryDialogVisible(true);
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
        <SummaryCard balance={balance} totalIn={totalIn} totalOut={totalOut} />
        <ActionButtons onPressIn={openInFlow} onPressOut={openOutFlow} />
        <RecentHistory
          groupedHistory={groupedHistory}
          canSeeAll={history.length > 10}
          onPressSeeAll={() => navigation.navigate('Transactions')}
        />
      </ScrollView>

      <TransactionDialogs
        activeType={activeType}
        isCategoryDialogVisible={isCategoryDialogVisible}
        isCustomCategoryDialogVisible={isCustomCategoryDialogVisible}
        isAmountDialogVisible={isAmountDialogVisible}
        searchText={searchText}
        filteredCategories={filteredCategories}
        customCategoryInput={customCategoryInput}
        selectedCategoryName={selectedCategoryName}
        amountInput={amountInput}
        onDismissAll={resetFlowState}
        onChangeSearch={setSearchText}
        onSelectCategory={handleSelectCategory}
        onOpenCustomCategory={handleOpenCustomCategory}
        onChangeCustomCategory={setCustomCategoryInput}
        onSubmitCustomCategory={handleSubmitCustomCategory}
        onChangeAmount={setAmountInput}
        onSubmitAmount={handleSubmitAmount}
      />
    </View>
  );
};
