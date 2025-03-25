const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware для обробки JSON та CORS
app.use(bodyParser.json());
app.use(cors());

// Шлях до файлу з замовленнями
const ordersFilePath = path.resolve(__dirname, 'orders.json');

// Функція для зчитування замовлень з файлу
function readOrders() {
  if (!fs.existsSync(ordersFilePath)) {
    fs.writeFileSync(ordersFilePath, '[]', 'utf-8');
  }
  try {
    const data = fs.readFileSync(ordersFilePath, 'utf-8');
    return data.trim() ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Помилка читання або парсингу файлу:', err);
    return [];
  }
}

// Функція для збереження замовлень у файл
function saveOrders(orders) {
  try {
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Помилка збереження файлу:', err);
  }
}

// Маршрут для кореневого запиту
app.get('/', (req, res) => {
  res.send('Сервер працює! Ласкаво просимо!');
});

// Маршрут для збереження замовлення
app.post('/api/orders', (req, res) => {
  console.log('Отримано запит на збереження замовлення:', req.body);

  const { name, address, notes, totalPrice, items } = req.body;

  if (!name || !address || !items || !totalPrice) {
    return res.status(400).json({ success: false, message: 'Не всі обов\'язкові поля заповнені!' });
  }

  const date = new Date().toISOString();
  const newOrder = { name, address, notes, totalPrice, items, date };

  try {
    const orders = readOrders();
    orders.push(newOrder);
    saveOrders(orders);
    res.json({ success: true, message: 'Замовлення збережено!' });
  } catch (err) {
    console.error('Помилка обробки замовлення:', err);
    res.status(500).json({ success: false, message: 'Помилка на сервері!' });
  }
});

// Маршрут для отримання всіх замовлень
app.get('/api/orders', (req, res) => {
  try {
    const orders = readOrders();
    res.json(orders);
  } catch (err) {
    console.error('Помилка отримання замовлень:', err);
    res.status(500).json({ success: false, message: 'Помилка на сервері!' });
  }
});

// Запуск сервера
app.listen(port, '0.0.0.0', () => {
  console.log(`Сервер запущено та доступний на http://<ваш-IP>:${port}`);
});
