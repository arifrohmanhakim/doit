import SQLite, { SQLiteDatabase, ResultSet } from 'react-native-sqlite-storage';
import dayjs from 'dayjs';
import { Transaction, TransactionType } from '../types/transaction';
import { Category } from '../types/category';

SQLite.enablePromise(true);

const DEFAULT_CATEGORIES = [
  'Bensin',
  'Jajan',
  'Makan',
  'Transport',
  'Tagihan',
  'Belanja',
  'Uang Masuk',
];

const getDBConnection = async (): Promise<SQLiteDatabase> => {
  return SQLite.openDatabase({ name: 'keuangan.db', location: 'default' });
};

export const createTable = async (): Promise<void> => {
  const db = await getDBConnection();
  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE COLLATE NOCASE,
      created_at TEXT NOT NULL
    );`,
  );

  for (const categoryName of DEFAULT_CATEGORIES) {
    await db.executeSql(
      'INSERT OR IGNORE INTO categories (name, created_at) VALUES (?, ?)',
      [categoryName, dayjs().toISOString()],
    );
  }

  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT,
      category_id INTEGER,
      amount INTEGER,
      date TEXT,
      type TEXT NOT NULL DEFAULT 'OUT'
    );`,
  );

  const info = await db.executeSql('PRAGMA table_info(transactions)');
  const hasTypeColumn = Array.from({ length: info[0].rows.length }).some(
    (_, index) => {
      const row = info[0].rows.item(index) as { name: string };
      return row.name === 'type';
    },
  );

  if (!hasTypeColumn) {
    await db.executeSql(
      "ALTER TABLE transactions ADD COLUMN type TEXT NOT NULL DEFAULT 'OUT'",
    );
  }

  const hasCategoryIdColumn = Array.from({ length: info[0].rows.length }).some(
    (_, index) => {
      const row = info[0].rows.item(index) as { name: string };
      return row.name === 'category_id';
    },
  );

  if (!hasCategoryIdColumn) {
    await db.executeSql('ALTER TABLE transactions ADD COLUMN category_id INTEGER');
  }

  await db.executeSql(
    `INSERT OR IGNORE INTO categories (name, created_at)
     SELECT DISTINCT TRIM(category), ?
     FROM transactions
     WHERE category IS NOT NULL AND TRIM(category) <> ''`,
    [dayjs().toISOString()],
  );

  await db.executeSql(
    `UPDATE transactions
     SET category_id = (
       SELECT c.id
       FROM categories c
       WHERE LOWER(c.name) = LOWER(TRIM(transactions.category))
       LIMIT 1
     )
     WHERE category_id IS NULL AND category IS NOT NULL AND TRIM(category) <> ''`,
  );

  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS wallet_balance (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      amount INTEGER NOT NULL DEFAULT 0
    );`,
  );

  await db.executeSql(
    'INSERT OR IGNORE INTO wallet_balance (id, amount) VALUES (1, 0)',
  );
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const db = await getDBConnection();
  const results = await db.executeSql(
    `SELECT
      t.id,
      COALESCE(t.category_id, 0) AS categoryId,
      COALESCE(c.name, t.category, 'Tanpa Kategori') AS category,
      t.amount,
      t.date,
      COALESCE(t.type, 'OUT') AS type
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    ORDER BY t.id DESC`,
  );
  const transactions: Transaction[] = [];

  results.forEach((result: ResultSet) => {
    for (let i = 0; i < result.rows.length; i += 1) {
      transactions.push(result.rows.item(i) as Transaction);
    }
  });

  return transactions;
};

export const saveTransaction = async (
  categoryId: number,
  amount: number,
  type: TransactionType = 'OUT',
  dateIso?: string,
): Promise<void> => {
  const db = await getDBConnection();
  const date = dateIso ?? dayjs().toISOString();

  await db.executeSql(
    'INSERT INTO transactions (category_id, amount, date, type) VALUES (?, ?, ?, ?)',
    [categoryId, amount, date, type],
  );
};

export const deleteTransaction = async (id: number): Promise<void> => {
  const db = await getDBConnection();
  await db.executeSql('DELETE FROM transactions WHERE id = ?', [id]);
};

export const getBalance = async (): Promise<number> => {
  const db = await getDBConnection();
  const results = await db.executeSql(
    'SELECT amount FROM wallet_balance WHERE id = 1',
  );

  if (results[0].rows.length === 0) {
    return 0;
  }

  const row = results[0].rows.item(0) as { amount: number };
  return row.amount ?? 0;
};

export const addBalance = async (amount: number): Promise<void> => {
  const db = await getDBConnection();
  await db.executeSql(
    'UPDATE wallet_balance SET amount = amount + ? WHERE id = 1',
    [amount],
  );
};

export const getCategories = async (): Promise<Category[]> => {
  const db = await getDBConnection();
  const results = await db.executeSql(
    'SELECT id, name FROM categories ORDER BY name ASC',
  );
  const categories: Category[] = [];

  results.forEach((result: ResultSet) => {
    for (let i = 0; i < result.rows.length; i += 1) {
      categories.push(result.rows.item(i) as Category);
    }
  });

  return categories;
};

export const createCategory = async (name: string): Promise<number> => {
  const db = await getDBConnection();
  const trimmed = name.trim();

  await db.executeSql(
    'INSERT OR IGNORE INTO categories (name, created_at) VALUES (?, ?)',
    [trimmed, dayjs().toISOString()],
  );

  const result = await db.executeSql(
    'SELECT id FROM categories WHERE LOWER(name) = LOWER(?) LIMIT 1',
    [trimmed],
  );

  if (result[0].rows.length === 0) {
    throw new Error('Failed to create category');
  }

  const row = result[0].rows.item(0) as { id: number };
  return row.id;
};

export const updateCategory = async (
  id: number,
  name: string,
): Promise<void> => {
  const db = await getDBConnection();
  const trimmed = name.trim();
  await db.executeSql('UPDATE categories SET name = ? WHERE id = ?', [
    trimmed,
    id,
  ]);
};

export const deleteCategory = async (id: number): Promise<void> => {
  const db = await getDBConnection();
  const usage = await db.executeSql(
    'SELECT COUNT(1) AS total FROM transactions WHERE category_id = ?',
    [id],
  );
  const row = usage[0].rows.item(0) as { total: number };

  if (row.total > 0) {
    throw new Error('Kategori masih dipakai transaksi');
  }

  await db.executeSql('DELETE FROM categories WHERE id = ?', [id]);
};
