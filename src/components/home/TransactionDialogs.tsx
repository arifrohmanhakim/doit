import React, { useMemo } from 'react';
import {
  Button,
  Dialog,
  List,
  Portal,
  Searchbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { Category } from '../../types/category';
import { createHomeStyles } from './styles';

type TransactionDialogsProps = {
  activeType: 'IN' | 'OUT' | null;
  isCategoryDialogVisible: boolean;
  isCustomCategoryDialogVisible: boolean;
  isAmountDialogVisible: boolean;
  searchText: string;
  filteredCategories: Category[];
  customCategoryInput: string;
  selectedCategoryName: string;
  amountInput: string;
  expenseDateInput: string;
  expenseDescriptionInput: string;
  onDismissAll: () => void;
  onChangeSearch: (value: string) => void;
  onSelectCategory: (category: Category) => void;
  onOpenCustomCategory: () => void;
  onChangeCustomCategory: (value: string) => void;
  onSubmitCustomCategory: () => void;
  onChangeAmount: (value: string) => void;
  onChangeExpenseDate: (value: string) => void;
  onChangeExpenseDescription: (value: string) => void;
  onSubmitAmount: () => void;
};

export const TransactionDialogs = ({
  activeType,
  isCategoryDialogVisible,
  isCustomCategoryDialogVisible,
  isAmountDialogVisible,
  searchText,
  filteredCategories,
  customCategoryInput,
  selectedCategoryName,
  amountInput,
  expenseDateInput,
  expenseDescriptionInput,
  onDismissAll,
  onChangeSearch,
  onSelectCategory,
  onOpenCustomCategory,
  onChangeCustomCategory,
  onSubmitCustomCategory,
  onChangeAmount,
  onChangeExpenseDate,
  onChangeExpenseDescription,
  onSubmitAmount,
}: TransactionDialogsProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createHomeStyles(theme), [theme]);

  return (
    <Portal>
      <Dialog
        visible={isCategoryDialogVisible}
        onDismiss={onDismissAll}
        style={styles.dialog}>
        <Dialog.Title>Pilih Kategori Keluar</Dialog.Title>
        <Dialog.Content>
          <Searchbar
            placeholder="Cari kategori..."
            value={searchText}
            onChangeText={onChangeSearch}
            style={styles.searchbar}
          />
          {filteredCategories.map(item => (
            <List.Item
              key={item.id}
              title={item.name}
              onPress={() => onSelectCategory(item)}
            />
          ))}
          <List.Item title="Lainnya" onPress={onOpenCustomCategory} />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismissAll}>Batal</Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog
        visible={isCustomCategoryDialogVisible}
        onDismiss={onDismissAll}
        style={styles.dialog}>
        <Dialog.Title>Masukkan Kategori</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Nama kategori"
            mode="outlined"
            value={customCategoryInput}
            onChangeText={onChangeCustomCategory}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismissAll}>Batal</Button>
          <Button onPress={onSubmitCustomCategory}>Lanjut</Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog
        visible={isAmountDialogVisible}
        onDismiss={onDismissAll}
        style={styles.dialog}>
        <Dialog.Title>
          {activeType === 'IN'
            ? 'Masukkan Nominal Pemasukan'
            : 'Masukkan Nominal Pengeluaran'}
        </Dialog.Title>
        <Dialog.Content>
          {activeType === 'OUT' ? (
            <Text variant="bodyMedium" style={styles.selectedCategoryText}>
              Kategori: {selectedCategoryName}
            </Text>
          ) : null}
          <TextInput
            label="Nominal (Rp)"
            mode="outlined"
            keyboardType="numeric"
            value={amountInput}
            onChangeText={onChangeAmount}
            left={<TextInput.Icon icon="cash" />}
          />
          {activeType === 'OUT' ? (
            <TextInput
              label="Tanggal (YYYY-MM-DD HH:mm)"
              mode="outlined"
              value={expenseDateInput}
              onChangeText={onChangeExpenseDate}
              style={styles.expenseDateInput}
              left={<TextInput.Icon icon="calendar-clock" />}
            />
          ) : null}
          {activeType === 'OUT' ? (
            <TextInput
              label="Keterangan (contoh: jajan es kopi)"
              mode="outlined"
              value={expenseDescriptionInput}
              onChangeText={onChangeExpenseDescription}
              style={styles.expenseDateInput}
              left={<TextInput.Icon icon="text-box-outline" />}
            />
          ) : null}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismissAll}>Batal</Button>
          <Button onPress={onSubmitAmount}>Simpan</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
