import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import {
  Button,
  Dialog,
  IconButton,
  List,
  Portal,
  Searchbar,
  TextInput,
} from 'react-native-paper';
import {
  createCategory,
  createTable,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../services/database';
import { Category } from '../types/category';

export const CategoriesScreen = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [isEditVisible, setIsEditVisible] = useState(false);

  const loadData = useCallback(async () => {
    await createTable();
    const data = await getCategories();
    setCategories(data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(
    () =>
      categories.filter(item =>
        item.name.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [categories, search],
  );

  const handleAdd = async () => {
    const name = newCategory.trim();
    if (!name) {
      return;
    }
    try {
      await createCategory(name);
      setNewCategory('');
      await loadData();
    } catch {
      Alert.alert('Gagal', 'Nama kategori sudah dipakai');
    }
  };

  const openEdit = (item: Category) => {
    setEditId(item.id);
    setEditName(item.name);
    setIsEditVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editId || !editName.trim()) {
      return;
    }
    try {
      await updateCategory(editId, editName);
      setIsEditVisible(false);
      setEditId(null);
      setEditName('');
      await loadData();
    } catch {
      Alert.alert('Gagal', 'Nama kategori sudah dipakai');
    }
  };

  const handleDelete = (item: Category) => {
    Alert.alert('Hapus Kategori', `Hapus kategori "${item.name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCategory(item.id);
            await loadData();
          } catch (error) {
            Alert.alert(
              'Gagal Hapus',
              error instanceof Error
                ? error.message
                : 'Kategori tidak bisa dihapus',
            );
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Cari kategori..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      <View style={styles.addRow}>
        <TextInput
          mode="outlined"
          label="Kategori baru"
          value={newCategory}
          onChangeText={setNewCategory}
          style={styles.input}
        />
        <Button mode="contained" onPress={handleAdd}>
          Tambah
        </Button>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            // eslint-disable-next-line react/no-unstable-nested-components
            right={() => (
              <View style={styles.actions}>
                <IconButton icon="pencil" onPress={() => openEdit(item)} />
                <IconButton
                  icon="delete"
                  iconColor="#b71c1c"
                  onPress={() => handleDelete(item)}
                />
              </View>
            )}
            style={styles.item}
          />
        )}
      />

      <Portal>
        <Dialog visible={isEditVisible} onDismiss={() => setIsEditVisible(false)}>
          <Dialog.Title>Edit Kategori</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              label="Nama kategori"
              value={editName}
              onChangeText={setEditName}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsEditVisible(false)}>Batal</Button>
            <Button onPress={handleSaveEdit}>Simpan</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f6f6f6' },
  search: { marginBottom: 10 },
  addRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  input: { flex: 1, marginRight: 8, backgroundColor: 'white' },
  item: { backgroundColor: 'white', borderRadius: 8, marginBottom: 8 },
  actions: { flexDirection: 'row', alignItems: 'center' },
});
