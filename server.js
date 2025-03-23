const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware для обробки JSON, CORS та логування запитів
app.use(bodyParser.json());
app.use(cors({
  origin: '*',  // Дозволяє запити з будь-якого домену (для розробки)
  methods: ['GET', 'POST']
}));

// Middleware для логування всіх запитів
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} від ${req.ip}`);
  next();
});

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
  } catch (err) {
    console.error('Помилка збереження файлу:', err);
  }
}

// Маршрут для збереження замовлення
app.post('/api/orders', (req, res) => {
  console.log('Отримано запит на збереження замовлення:', req.body);

  const { name, address, notes, totalPrice, items } = req.body;

  // Перевірка наявності обов'язкових полів
  if (!name || !address || !items || !totalPrice) {
    console.log('Помилка: не всі обов\'язкові поля заповнені', { name, address, items, totalPrice });
    return res.status(400).json({ success: false, message: 'Не всі обов\'язкові поля заповнені!' });
  }

  const date = new Date().toLocaleString();

  const newOrder = {
    name,
    address,
    notes,
    totalPrice,
    items,
    date,
  };

  try {
    const orders = readOrders();
    orders.push(newOrder);
    saveOrders(orders);
    console.log('Замовлення успішно збережено:', newOrder);
    res.json({ success: true, message: 'Замовлення збережено!' });
  } catch (error) {
    console.error('Помилка при збереженні замовлення:', error);
    res.status(500).json({ success: false, message: 'Помилка сервера при збереженні замовлення' });
  }
});

// Маршрут для отримання всіх замовлень
app.get('/api/orders', (req, res) => {
  try {
    const orders = readOrders();
    console.log(`Відправлено ${orders.length} замовлень клієнту`);
    res.json(orders);
  } catch (error) {
    console.error('Помилка при отриманні замовлень:', error);
    res.status(500).json({ success: false, message: 'Помилка сервера при отриманні замовлень' });
  }
});

// Статичний маршрут для тестування
app.get('/', (req, res) => {
  res.send('Сервер піцерії працює! Використовуйте /api/orders для отримання замовлень.');
});

// Запуск сервера
app.listen(port, '0.0.0.0', () => {
  const interfaces = require('os').networkInterfaces();
  const addresses = [];

  for (const k in interfaces) {
    for (const k2 in interfaces[k]) {
      const address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        addresses.push(address.address);
      }
    }
  }

  console.log(`Сервер запущено на порту ${port}`);
  console.log(`Локальний доступ: http://localhost:${port}`);
  if (addresses.length > 0) {
    console.log('Доступ по мережі:');
    addresses.forEach(addr => {
      console.log(`  http://${addr}:${port}`);
    });
    console.log('Використовуйте ці адреси для підключення з телефону');
  }
});
