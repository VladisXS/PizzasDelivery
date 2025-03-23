const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const https = require('https');
const http = require('http');

const app = express();
const port = 3000;
const httpsPort = 3443; // Порт для HTTPS

// Покращене налаштування CORS для вирішення проблем з мобільними пристроями
app.use(cors({
  origin: '*', // Дозволити запити з будь-якого джерела
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Розширені middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Middleware для логування всіх запитів
app.use((req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'] || req.ip;
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} від ${clientIp}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  if (req.method === 'POST' && req.body) {
    console.log('Body:', JSON.stringify(req.body, null, 2).substring(0, 200) + '...');
  }
  
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
    return true;
  } catch (err) {
    console.error('Помилка збереження файлу:', err);
    return false;
  }
}

// Маршрут для перевірки з'єднання
app.get('/api/ping', (req, res) => {
  res.json({ success: true, message: 'Сервер працює', time: new Date().toISOString() });
});

// Маршрут для збереження замовлення
app.post('/api/orders', (req, res) => {
  console.log('Отримано запит на збереження замовлення');

  // Перевірка, чи є тіло запиту
  if (!req.body || Object.keys(req.body).length === 0) {
    console.error('Помилка: тіло запиту порожнє');
    return res.status(400).json({ success: false, message: 'Порожнє тіло запиту' });
  }

  const { name, address, notes, totalPrice, items } = req.body;

  // Перевірка наявності обов'язкових полів
  if (!name || !address || !items || !totalPrice) {
    console.error('Помилка: не всі обов\'язкові поля заповнені', { 
      name: !!name, 
      address: !!address, 
      items: !!items, 
      totalPrice: !!totalPrice 
    });
    return res.status(400).json({ success: false, message: 'Не всі обов\'язкові поля заповнені!' });
  }

  const date = new Date().toLocaleString();

  const newOrder = {
    name,
    address,
    notes: notes || '',
    totalPrice,
    items,
    date,
    deviceInfo: req.headers['user-agent'] || 'Невідомий пристрій'
  };

  try {
    const orders = readOrders();
    orders.push(newOrder);
    const isSaved = saveOrders(orders);
    
    if (isSaved) {
      console.log('Замовлення успішно збережено');
      res.json({ success: true, message: 'Замовлення збережено!', orderDate: date });
    } else {
      console.error('Не вдалося зберегти замовлення в файл');
      res.status(500).json({ success: false, message: 'Помилка при збереженні замовлення' });
    }
  } catch (error) {
    console.error('Помилка при обробці замовлення:', error);
    res.status(500).json({ success: false, message: 'Внутрішня помилка сервера', error: error.message });
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

// Статичний маршрут для головної сторінки
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Pizza Logger Server</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
          .url-box { background: #e9f7e9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>Сервер Pizza Logger працює!</h1>
        <div class="url-box">
          <h3>Ваші URL для підключення:</h3>
          <p>Локальний: <code>http://localhost:${port}/api/orders</code></p>
          <p>HTTPS: <code>https://localhost:${httpsPort}/api/orders</code> (якщо налаштовано)</p>
          <p>Внутрішній IP: <span id="ip-list">Завантаження...</span></p>
        </div>
        <h3>Вказівки для клієнтської частини:</h3>
        <p>Змініть URL API в клієнтському коді на одну з адрес, вказаних вище.</p>
        <pre>
// Знайдіть цей код у ваших JavaScript файлах:
fetch('https://ваш-старий-url/api/orders', {...})

// І змініть його на:
fetch('http://IP-АДРЕСА:${port}/api/orders', {...})
        </pre>
        <script>
          // Відображення IP-адрес на сторінці
          fetch('/api/ip')
            .then(res => res.json())
            .then(data => {
              const ipList = document.getElementById('ip-list');
              ipList.innerHTML = data.addresses.map(ip => 
                `<code>http://${ip}:${port}/api/orders</code>`).join('<br>');
            })
            .catch(err => {
              document.getElementById('ip-list').textContent = 'Помилка отримання IP';
              console.error(err);
            });
        </script>
      </body>
    </html>
  `);
});

// Маршрут для отримання IP-адрес
app.get('/api/ip', (req, res) => {
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
  
  res.json({ addresses });
});

// Запуск HTTP сервера
const httpServer = http.createServer(app);
httpServer.listen(port, '0.0.0.0', () => {
  console.log(`HTTP сервер запущено на порту ${port}`);
  console.log(`Локальний доступ: http://localhost:${port}`);
  
  // Виведення локальних IP-адрес
  const interfaces = require('os').networkInterfaces();
  console.log('Доступ по мережі:');
  for (const k in interfaces) {
    for (const k2 in interfaces[k]) {
      const address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        console.log(`  http://${address.address}:${port}`);
      }
    }
  }
  
  console.log('\nДля підключення з телефону:');
  console.log('1. Переконайтесь, що телефон підключений до тієї ж Wi-Fi мережі');
  console.log('2. Змініть API URL у клієнтському коді на одну з адрес вище');
  console.log('3. Відкрийте http://localhost:3000 для перевірки статусу сервера');
});

// Спроба запустити HTTPS сервер (якщо є сертифікати)
try {
  // Шлях до сертифікатів (створіть їх, якщо плануєте використовувати HTTPS)
  const privateKeyPath = path.join(__dirname, 'key.pem');
  const certificatePath = path.join(__dirname, 'cert.pem');
  
  if (fs.existsSync(privateKeyPath) && fs.existsSync(certificatePath)) {
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    const certificate = fs.readFileSync(certificatePath, 'utf8');
    const credentials = { key: privateKey, cert: certificate };
    
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(httpsPort, '0.0.0.0', () => {
      console.log(`HTTPS сервер запущено на порту ${httpsPort}`);
      console.log(`Безпечний доступ: https://localhost:${httpsPort}`);
    });
  }
} catch (err) {
  console.log('HTTPS сервер не запущено (сертифікати не знайдено або виникла помилка)');
}
