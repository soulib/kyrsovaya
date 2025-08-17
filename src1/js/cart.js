/**
 * cart.js - Функционал корзины для сайта автозапчастей
 * Реализует добавление/удаление товаров, пересчет суммы, сохранение в LocalStorage
 */

document.addEventListener('DOMContentLoaded', function() {
  // Инициализация корзины при загрузке страницы
  initCart();
  
  // Обработчики событий
  setupCartEventListeners();
});

// Инициализация корзины
function initCart() {
  let cartItems = getCartItems();
  updateCartUI(cartItems);
  updateCartCounter(cartItems.length);
}

// Получение товаров из LocalStorage
function getCartItems() {
  const cartItemsJSON = localStorage.getItem('cartItems');
  return cartItemsJSON ? JSON.parse(cartItemsJSON) : [];
}

// Сохранение товаров в LocalStorage
function saveCartItems(items) {
  localStorage.setItem('cartItems', JSON.stringify(items));
}

// Обновление счетчика в шапке сайта
function updateCartCounter(count) {
  const cartCounter = document.querySelector('.cart-count');
  if (cartCounter) {
    cartCounter.textContent = count;
    cartCounter.style.display = count > 0 ? 'flex' : 'none';
  }
}

// Обновление интерфейса корзины
function updateCartUI(items) {
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartTotalElement = document.querySelector('.cart-total');
  const cartEmptyMessage = document.querySelector('.cart-empty');
  const cartCheckoutBtn = document.querySelector('.cart-checkout-btn');

  if (!cartItemsContainer) return;

  if (items.length === 0) {
    cartItemsContainer.innerHTML = '';
    if (cartEmptyMessage) cartEmptyMessage.style.display = 'block';
    if (cartCheckoutBtn) cartCheckoutBtn.style.display = 'none';
    if (cartTotalElement) cartTotalElement.style.display = 'none';
    return;
  }

  if (cartEmptyMessage) cartEmptyMessage.style.display = 'none';
  if (cartCheckoutBtn) cartCheckoutBtn.style.display = 'block';
  if (cartTotalElement) cartTotalElement.style.display = 'block';

  // Очистка контейнера
  cartItemsContainer.innerHTML = '';

  let totalPrice = 0;

  // Добавление товаров в корзину
  items.forEach((item, index) => {
    const price = parseFloat(item.price.replace(/\s/g, '').replace(/[^\d.]/g, ''));
    const itemTotal = price * item.quantity;
    totalPrice += itemTotal;

    const cartItemElement = document.createElement('div');
    cartItemElement.className = 'cart-item';
    cartItemElement.innerHTML = `
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
      </div>
      <div class="cart-item-info">
        <h4 class="cart-item-title">${item.name}</h4>
        <p class="cart-item-price">${item.price} x ${item.quantity} = ${itemTotal.toFixed(2)} ₽</p>
        <div class="cart-item-controls">
          <button class="btn btn-small cart-item-decrease" data-index="${index}">-</button>
          <span class="cart-item-quantity">${item.quantity}</span>
          <button class="btn btn-small cart-item-increase" data-index="${index}">+</button>
          <button class="btn btn-small btn-danger cart-item-remove" data-index="${index}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    cartItemsContainer.appendChild(cartItemElement);
  });

  // Обновление общей суммы
  if (cartTotalElement) {
    cartTotalElement.innerHTML = `
      <div class="cart-total-row">
        <span>Итого:</span>
        <span class="cart-total-price">${totalPrice.toFixed(2)} ₽</span>
      </div>
    `;
  }
}

// Настройка обработчиков событий
function setupCartEventListeners() {
  // Обработчик для кнопок "Добавить в корзину"
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
      const button = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
      const partItem = button.closest('.part-item');
      addToCart(partItem);
      e.preventDefault();
    }
  });

  // Обработчики для корзины (уменьшение/увеличение/удаление)
  document.querySelector('.cart-items')?.addEventListener('click', function(e) {
    const target = e.target.closest('button');
    if (!target) return;

    const index = parseInt(target.getAttribute('data-index'));
    let cartItems = getCartItems();

    if (target.classList.contains('cart-item-increase')) {
      cartItems[index].quantity += 1;
    } else if (target.classList.contains('cart-item-decrease')) {
      if (cartItems[index].quantity > 1) {
        cartItems[index].quantity -= 1;
      } else {
        cartItems.splice(index, 1);
      }
    } else if (target.classList.contains('cart-item-remove')) {
      cartItems.splice(index, 1);
    }

    saveCartItems(cartItems);
    updateCartUI(cartItems);
    updateCartCounter(cartItems.length);
  });

  // Очистка корзины
  document.querySelector('.cart-clear-btn')?.addEventListener('click', function() {
    if (confirm('Вы действительно хотите очистить корзину?')) {
      localStorage.removeItem('cartItems');
      initCart();
    }
  });

  // Оформление заказа
  document.querySelector('.cart-checkout-btn')?.addEventListener('click', function() {
    const cartItems = getCartItems();
    if (cartItems.length === 0) {
      alert('Корзина пуста!');
      return;
    }
    window.location.href = 'checkout.html';
  });
}

// Добавление товара в корзину
function addToCart(partItem) {
  const partId = partItem.getAttribute('data-id');
  const partName = partItem.querySelector('h3').textContent;
  const partPrice = partItem.querySelector('.price').textContent;
  const partImage = partItem.querySelector('img').src;
  const partCategory = partItem.getAttribute('data-category');

  let cartItems = getCartItems();

  // Проверяем, есть ли уже такой товар в корзине
  const existingItemIndex = cartItems.findIndex(item => item.id === partId);

  if (existingItemIndex >= 0) {
    // Увеличиваем количество, если товар уже есть
    cartItems[existingItemIndex].quantity += 1;
  } else {
    // Добавляем новый товар
    cartItems.push({
      id: partId,
      name: partName,
      price: partPrice,
      image: partImage,
      category: partCategory,
      quantity: 1
    });
  }

  saveCartItems(cartItems);
  updateCartUI(cartItems);
  updateCartCounter(cartItems.length);

  // Показываем уведомление
  showNotification(`"${partName}" добавлен в корзину`);
}

// Показать уведомление
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Экспорт функций для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getCartItems,
    saveCartItems,
    updateCartUI,
    addToCart
  };
}