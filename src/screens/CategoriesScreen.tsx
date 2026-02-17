import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Dialog,
  FAB,
  IconButton,
  List,
  Portal,
  Searchbar,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { AnimatedPressable } from '../components/AnimatedPressable';
import {
  createCategory,
  createTable,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../services/database';
import { Category } from '../types/category';

export const CategoriesScreen = () => {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          padding: 16,
          backgroundColor: theme.colors.background,
        },
        search: { marginBottom: 10 },
        item: {
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          marginBottom: 8,
          overflow: 'hidden',
        },
        actions: { flexDirection: 'row', alignItems: 'center' },
        dialogInput: { marginBottom: 10, backgroundColor: theme.colors.surface },
        fabWrap: { position: 'absolute', right: 16, bottom: 20, borderRadius: 16 },
        fab: {},
      }),
    [theme],
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#8f56e9');
  const [newCategoryIcon, setNewCategoryIcon] = useState('shape-outline');
  const [isCreateVisible, setIsCreateVisible] = useState(false);
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
    const name = newCategoryName.trim();
    if (!name) {
      return;
    }
    try {
      await createCategory(name, newCategoryColor, newCategoryIcon);
      setNewCategoryName('');
      setNewCategoryColor('#8f56e9');
      setNewCategoryIcon('shape-outline');
      setIsCreateVisible(false);
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

      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <AnimatedPressable onPress={() => openEdit(item)} containerStyle={styles.item}>
            <List.Item
              title={item.name}
              description={`${item.icon} • ${item.color}`}
              // eslint-disable-next-line react/no-unstable-nested-components
              left={() => {
                const avatarStyle = {
                  backgroundColor: item.color || theme.colors.primary,
                };
                return (
                  <Avatar.Icon
                    size={36}
                    icon={item.icon || 'shape-outline'}
                    style={avatarStyle}
                    color={theme.colors.onPrimary}
                  />
                );
              }}
              // eslint-disable-next-line react/no-unstable-nested-components
              right={() => (
                <View style={styles.actions}>
                  <IconButton icon="pencil" onPress={() => openEdit(item)} />
                  <IconButton
                    icon="delete"
                    iconColor={theme.colors.error}
                    onPress={() => handleDelete(item)}
                  />
                </View>
              )}
            />
          </AnimatedPressable>
        )}
      />

      <Portal>
        <Dialog
          visible={isCreateVisible}
          onDismiss={() => setIsCreateVisible(false)}
        >
          <Dialog.Title>Tambah Kategori</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              label="Nama kategori"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              style={styles.dialogInput}
            />
            <TextInput
              mode="outlined"
              label="Warna (HEX)"
              placeholder="#8f56e9"
              value={newCategoryColor}
              onChangeText={setNewCategoryColor}
              style={styles.dialogInput}
            />
            <TextInput
              mode="outlined"
              label="Icon"
              placeholder="shape-outline"
              value={newCategoryIcon}
              onChangeText={setNewCategoryIcon}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsCreateVisible(false)}>Batal</Button>
            <Button onPress={handleAdd}>Simpan</Button>
          </Dialog.Actions>
        </Dialog>

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

      <AnimatedPressable
        onPress={() => setIsCreateVisible(true)}
        containerStyle={styles.fabWrap}
      >
        <FAB icon="plus" label="Tambah Kategori" style={styles.fab} />
      </AnimatedPressable>
    </View>
  );
};
