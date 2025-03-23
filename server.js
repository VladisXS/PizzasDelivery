const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware для обробки JSON та CORS
app.use(bodyParser.json());
app.use(cors({
  origin: '*', // Дозволяє всі домени (для тестування). Заміни на конкретний домен у продакшені.
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Шлях до файлу з замовленнями
const ordersFilePath = path.join(__dirname, 'orders.json');

// Функція для зчитування замовлень з файлу
function readOrders() {
  if (!fs.existsSync(ordersFilePath)) {
    fs.writeFileSync(ordersFilePath, '[]'); // Створюємо порожній файл, якщо його немає
  }
  try {
    const data = fs.readFileSync(ordersFilePath, 'utf-8');
    if (!data.trim()) {
      return []; // Повертаємо пустий масив, якщо файл порожній
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Помилка читання або парсингу файлу:', err);
    return []; // Повертаємо пустий масив у разі помилки
  }
}

// Функція для збереження замовлень у файл
function saveOrders(orders) {
  try {
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
    console.log('Файл успішно збережено:', ordersFilePath);
  } catch (err) {
    console.error('Помилка збереження файлу:', err);
  }
}

// Маршрут для збереження замовлення
app.post('/api/orders', (req, res) => {
  console.log('Отримано запит на збереження замовлення:', req.body);
  console.log('User-Agent:', req.headers['user-agent']);

  const { name, address, notes, totalPrice, items } = req.body;

  // Перевірка наявності обов'язкових полів
  if (!name || !address || !items || !totalPrice) {
    return res.status(400).json({ success: false, message: 'Не всі обов\'язкові поля заповнені!' });
  }

  const date = new Date().toISOString(); // Використовуємо стандартний формат дати

  const newOrder = {
    name,
    address,
    notes,
    totalPrice,
    items,
    date,
  };

  const orders = readOrders();
  orders.push(newOrder);
  saveOrders(orders);

  // Відключаємо кешування для уникнення проблем
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  res.json({ success: true, message: 'Замовлення збережено!' });
});

// Маршрут для отримання всіх замовлень
app.get('/api/orders', (req, res) => {
  const orders = readOrders();

  // Відключаємо кешування для уникнення проблем
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  res.json(orders);
});

// Обробка помилок
app.use((err, req, res, next) => {
  console.error('Помилка сервера:', err.stack);
  res.status(500).json({ success: false, message: 'Щось пішло не так на сервері!' });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущено на http://localhost:${port}`);
});
