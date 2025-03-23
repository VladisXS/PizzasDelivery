let currentLanguage = 'uk';
let order = [];
let totalPrice = 0;
let orderHistory = [];

const exchangeRate = 40; // 1 EUR = 40 UAH

const pizzas = [
    { id: 1, name: 'Маргарита', nameEn: 'Margherita', category: 'vegetarian', price: 120, rating: 4.5, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80' },
    { id: 2, name: 'Пепероні', nameEn: 'Pepperoni', category: 'meat', price: 150, rating: 4.7, image: 'https://images.unsplash.com/photo-1593504049359-74330189a345?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80' },
    { id: 3, name: 'Гавайська', nameEn: 'Hawaiian', category: 'meat', price: 130, rating: 4.2, image: 'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80' },
    { id: 4, name: '4 сири', nameEn: '4 Cheeses', category: 'vegetarian', price: 140, rating: 4.8, image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80' }
];

const translations = {
    'uk': {
        'headerTitle': '🍕 Доставка піци',
        'menu': 'Меню',
        'about': 'Про нас',
        'contact': 'Контакти',
        'history': 'Історія замовлень',
        'menuTitle': 'Наше меню',
        'order': 'Ваше замовлення',
        'total': 'Загальна сума',
        'place_order': 'Заказати',
        'delivery_message': 'Дякуємо! Ваша піца буде готова та доставлена за 30-35 хвилин.',
        'name_placeholder': 'Ваше ім\'я',
        'address_placeholder': 'Адреса доставки',
        'notes_placeholder': 'Додаткові побажання (не обов\'язково)',
        'order_button': 'Замовити',
        'orderFormTitle': 'Оформлення замовлення',
        'aboutTitle': 'Про нас',
        'aboutText': 'Ми - піцерія, яка готує найсмачнішу піцу з натуральних інгредієнтів. Наша місія - дарувати вам радість і задоволення від кожного шматочка!',
        'contactTitle': 'Контакти',
        'addressText': '🏠 Адреса: вул. Піцерійна, 1, м. Київ',
        'historyTitle': 'Історія замовлень',
        'footerText': '© 2023 Доставка піци. Усі права захищені.',
        'clear_order': 'Очистити замовлення',
        'remove': 'Видалити',
        'search_placeholder': 'Пошук піци...',
        'price': 'Ціна',
        'rating': 'Рейтинг'
    },
    'en': {
        'headerTitle': '🍕 Pizza Delivery',
        'menu': 'Menu',
        'about': 'About Us',
        'contact': 'Contact',
        'history': 'Order History',
        'menuTitle': 'Our Menu',
        'order': 'Your Order',
        'total': 'Total',
        'place_order': 'Order',
        'delivery_message': 'Thank you! Your pizza will be ready and delivered in 30-35 minutes.',
        'name_placeholder': 'Your Name',
        'address_placeholder': 'Delivery Address',
        'notes_placeholder': 'Additional Notes (optional)',
        'order_button': 'Place Order',
        'orderFormTitle': 'Place Order',
        'aboutTitle': 'About Us',
        'aboutText': 'We are a pizzeria that prepares the most delicious pizza from natural ingredients. Our mission is to give you joy and pleasure with every bite!',
        'contactTitle': 'Contact',
        'addressText': '🏠 Address: Pizza Street, 1, Kyiv',
        'historyTitle': 'Order History',
        'footerText': '© 2023 Pizza Delivery. All rights reserved.',
        'clear_order': 'Clear Order',
        'remove': 'Remove',
        'search_placeholder': 'Search pizza...',
        'price': 'Price',
        'rating': 'Rating'
    }
};

function toggleLanguageDropdown() {
    const dropdown = document.getElementById('language-dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function toggleFilterDropdown() {
    const dropdown = document.getElementById('filter-dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function changeLanguage(lang) {
    currentLanguage = lang;
    updateLanguage();
    renderPizzas(pizzas);
    updateOrderList();
}

function updateLanguage() {
    document.getElementById('headerTitle').textContent = translations[currentLanguage]['headerTitle'];
    document.getElementById('menuLink').textContent = translations[currentLanguage]['menu'];
    document.getElementById('aboutLink').textContent = translations[currentLanguage]['about'];
    document.getElementById('contactLink').textContent = translations[currentLanguage]['contact'];
    document.getElementById('historyLink').textContent = translations[currentLanguage]['history'];
    document.getElementById('menuTitle').textContent = translations[currentLanguage]['menuTitle'];
    document.getElementById('orderTitle').textContent = translations[currentLanguage]['order'];
    document.getElementById('totalText').innerHTML = `${translations[currentLanguage]['total']}: <span id="totalPrice">0</span>`;
    document.getElementById('orderButton').textContent = translations[currentLanguage]['place_order'];
    document.getElementById('deliveryMessage').textContent = translations[currentLanguage]['delivery_message'];
    document.getElementById('name').placeholder = translations[currentLanguage]['name_placeholder'];
    document.getElementById('address').placeholder = translations[currentLanguage]['address_placeholder'];
    document.getElementById('notes').placeholder = translations[currentLanguage]['notes_placeholder'];
    document.getElementById('placeOrderButton').textContent = translations[currentLanguage]['order_button'];
    document.getElementById('orderFormTitle').textContent = translations[currentLanguage]['orderFormTitle'];
    document.getElementById('aboutTitle').textContent = translations[currentLanguage]['aboutTitle'];
    document.getElementById('aboutText').textContent = translations[currentLanguage]['aboutText'];
    document.getElementById('contactTitle').textContent = translations[currentLanguage]['contactTitle'];
    document.getElementById('addressText').textContent = translations[currentLanguage]['addressText'];
    document.getElementById('historyTitle').textContent = translations[currentLanguage]['historyTitle'];
    document.getElementById('footerText').textContent = translations[currentLanguage]['footerText'];
    document.getElementById('clearOrderButton').textContent = translations[currentLanguage]['clear_order'];
    document.getElementById('searchInput').placeholder = translations[currentLanguage]['search_placeholder'];

    const priceElements = document.querySelectorAll('.menu-item p:nth-child(2)');
    const ratingElements = document.querySelectorAll('.menu-item p:nth-child(3)');
    priceElements.forEach(el => el.textContent = `${translations[currentLanguage]['price']}: `);
    ratingElements.forEach(el => el.textContent = `${translations[currentLanguage]['rating']}: `);
}

function filterPizzas(category) {
    const filteredPizzas = category === 'all' ? pizzas : pizzas.filter(pizza => pizza.category === category);
    renderPizzas(filteredPizzas);
}

function searchPizzas() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredPizzas = pizzas.filter(pizza => {
        const pizzaName = currentLanguage === 'uk' ? pizza.name.toLowerCase() : pizza.nameEn.toLowerCase();
        return pizzaName.includes(searchTerm);
    });
    renderPizzas(filteredPizzas);
}

function renderPizzas(pizzas) {
    const pizzaList = document.getElementById('pizzaList');
    pizzaList.innerHTML = '';
    pizzas.forEach(pizza => {
        const pizzaName = currentLanguage === 'uk' ? pizza.name : pizza.nameEn;
        const price = currentLanguage === 'uk' ? `${pizza.price} грн` : `€${(pizza.price / exchangeRate).toFixed(2)}`;
        pizzaList.innerHTML += `
            <div class="menu-item" onclick="addPizzaToOrder(${pizza.id}, ${pizza.price})">
                <img src="${pizza.image}" alt="${pizzaName}">
                <div>
                    <h3>${pizzaName}</h3>
                    <p>${translations[currentLanguage]['price']}: ${price}</p>
                    <p>${translations[currentLanguage]['rating']}: ${pizza.rating}</p>
                    <div class="rating">
                        <span onclick="ratePizza(this, 1, event)">★</span>
                        <span onclick="ratePizza(this, 2, event)">★</span>
                        <span onclick="ratePizza(this, 3, event)">★</span>
                        <span onclick="ratePizza(this, 4, event)">★</span>
                        <span onclick="ratePizza(this, 5, event)">★</span>
                    </div>
                </div>
            </div>
        `;
    });
}

function addPizzaToOrder(pizzaId, price) {
    const pizza = pizzas.find(p => p.id === pizzaId);
    const existingPizza = order.find(item => item.id === pizzaId);
    if (existingPizza) {
        existingPizza.quantity += 1;
    } else {
        order.push({ id: pizzaId, price: price, quantity: 1 });
    }
    totalPrice += price;
    updateOrderList();
    document.getElementById('orderButton').style.display = 'block';
}

function removeOnePizzaFromOrder(index) {
    const pizza = order[index];
    if (pizza.quantity > 1) {
        pizza.quantity -= 1;
        totalPrice -= pizza.price;
    } else {
        order.splice(index, 1);
        totalPrice -= pizza.price;
    }
    updateOrderList();
    if (order.length === 0) {
        document.getElementById('orderButton').style.display = 'none';
    }
}

function removePizzaFromOrder(index) {
    if (confirm(currentLanguage === 'uk' ? 'Ви впевнені, що хочете видалити цю піцу з замовлення?' : 'Are you sure you want to remove this pizza from the order?')) {
        const removedPizza = order[index];
        totalPrice -= removedPizza.price * removedPizza.quantity;
        order.splice(index, 1);
        updateOrderList();
        if (order.length === 0) {
            document.getElementById('orderButton').style.display = 'none';
        }
    }
}

function clearOrder() {
    if (confirm(currentLanguage === 'uk' ? 'Ви впевнені, що хочете очистити замовлення?' : 'Are you sure you want to clear the order?')) {
        order = [];
        totalPrice = 0;
        updateOrderList();
        document.getElementById('orderButton').style.display = 'none';
        document.getElementById('clearOrderButton').style.display = 'none';
    }
}

function updateOrderList() {
    const orderItems = document.getElementById('orderItems');
    const totalPriceElement = document.getElementById('totalPrice');
    const clearOrderButton = document.getElementById('clearOrderButton');
    orderItems.innerHTML = '';
    order.forEach((item, index) => {
        const pizza = pizzas.find(p => p.id === item.id);
        const pizzaName = currentLanguage === 'uk' ? pizza.name : pizza.nameEn;
        const price = currentLanguage === 'uk' ? item.price * item.quantity : (item.price / exchangeRate) * item.quantity;
        const currencySymbol = currentLanguage === 'uk' ? 'грн' : '€';
        const formattedPrice = currentLanguage === 'uk' ? `${price} ${currencySymbol}` : `${price.toFixed(2)} ${currencySymbol}`;
        const li = document.createElement('li');
        li.innerHTML = `
            ${pizzaName} x${item.quantity} - ${formattedPrice}
            <div class="button-group">
                <button onclick="removeOnePizzaFromOrder(${index})">-1</button>
                <button onclick="removePizzaFromOrder(${index})">${translations[currentLanguage]['remove']}</button>
            </div>
        `;
        orderItems.appendChild(li);
    });

    const total = currentLanguage === 'uk' ? totalPrice : totalPrice / exchangeRate;
    const totalCurrencySymbol = currentLanguage === 'uk' ? 'грн' : '€';
    totalPriceElement.textContent = currentLanguage === 'uk' ? `${total} ${totalCurrencySymbol}` : `${total.toFixed(2)} ${totalCurrencySymbol}`;
    clearOrderButton.style.display = order.length > 0 ? 'block' : 'none';
}

function showOrderForm() {
    document.getElementById('orderForm').style.display = 'block';
}

async function placeOrder() {
    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const notes = document.getElementById('notes').value;

    if (name && address && order.length > 0) {
        const orderSummary = {
            name: name,
            address: address,
            notes: notes || (currentLanguage === 'uk' ? "Немає додаткових побажань" : "No additional notes"),
            totalPrice: totalPrice,
            items: order,
        };

        try {
            const response = await fetch('http://localhost:3000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderSummary),
            });

            if (response.ok) {
                document.getElementById('deliveryMessage').style.display = 'block';
                order = [];
                totalPrice = 0;
                updateOrderList();
                document.getElementById('orderForm').style.display = 'none';
                document.getElementById('orderButton').style.display = 'none';
                document.getElementById('clearOrderButton').style.display = 'none';
            } else {
                alert('Помилка при збереженні замовлення.');
            }
        } catch (error) {
            console.error('Помилка:', error);
            alert('Помилка при збереженні замовлення.');
        }
    } else {
        alert(currentLanguage === 'uk' ? 'Будь ласка, заповніть обов\'язкові поля та додайте піцу до замовлення.' : 'Please fill in the required fields and add pizza to the order.');
    }
}

function updateOrderHistory() {
    const historyItems = document.getElementById('historyItems');
    historyItems.innerHTML = '';
    orderHistory.forEach((order, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${currentLanguage === 'uk' ? 'Замовлення' : 'Order'} #${index + 1}</strong><br>
            ${currentLanguage === 'uk' ? 'Ім\'я' : 'Name'}: ${order.name}<br>
            ${currentLanguage === 'uk' ? 'Адреса' : 'Address'}: ${order.address}<br>
            ${currentLanguage === 'uk' ? 'Побажання' : 'Notes'}: ${order.notes}<br>
            ${currentLanguage === 'uk' ? 'Замовлення' : 'Order'}: ${order.order.map(item => `${item.name} x${item.quantity} - ${item.price * item.quantity} ${currentLanguage === 'uk' ? 'грн' : '€'}`).join(', ')}<br>
            ${currentLanguage === 'uk' ? 'Загальна сума' : 'Total'}: ${order.totalPrice} ${currentLanguage === 'uk' ? 'грн' : '€'}<br>
            ${currentLanguage === 'uk' ? 'Дата' : 'Date'}: ${order.date}
        `;
        historyItems.appendChild(li);
    });
}

function ratePizza(element, rating, event) {
    event.stopPropagation();
    const stars = element.parentElement.querySelectorAll('span');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    alert(currentLanguage === 'uk' ? `Ви оцінили піцу на ${rating} зірок!` : `You rated the pizza ${rating} stars!`);
}

updateOrderHistory();
renderPizzas(pizzas);
