/**
 * Основной JavaScript файл для сайта автозапчастей
 * Реализует основную функциональность: меню, слайдеры, модальные окна и т.д.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Инициализация всех компонентов после загрузки DOM
  initMobileMenu();
  initSmoothScrolling();
  initPartFilters();
  initTestimonialsSlider();
  initModalWindows();
  initCartFunctionality();
  initFormValidation();
});

/**
 * Инициализация мобильного меню
 */
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');
  const menuItems = document.querySelectorAll('.nav-menu a');

  if (!menuBtn || !navMenu) return;

  menuBtn.addEventListener('click', function() {
    this.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  });

  // Закрытие меню при клике на пункт
  menuItems.forEach(item => {
    item.addEventListener('click', function() {
      menuBtn.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.classList.remove('no-scroll');
    });
  });
}

/**
 * Плавная прокрутка для якорных ссылок
 */
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Фильтрация запчастей в каталоге
 */
function initPartFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const partItems = document.querySelectorAll('.part-item');

  if (!filterButtons.length || !partItems.length) return;

  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Удаляем активный класс у всех кнопок
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Добавляем активный класс текущей кнопке
      this.classList.add('active');
      
      const filterValue = this.getAttribute('data-filter');
      
      // Фильтрация товаров
      partItems.forEach(item => {
        if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/**
 * Инициализация слайдера отзывов
 */
function initTestimonialsSlider() {
  const slider = document.querySelector('.testimonials-slider');
  if (!slider) return;

  let currentIndex = 0;
  const testimonials = document.querySelectorAll('.testimonial');
  const totalTestimonials = testimonials.length;
  
  function showTestimonial(index) {
    testimonials.forEach((testimonial, i) => {
      testimonial.style.display = i === index ? 'block' : 'none';
    });
  }
  
  // Кнопки навигации
  const prevBtn = document.querySelector('.testimonial-prev');
  const nextBtn = document.querySelector('.testimonial-next');
  
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', function() {
      currentIndex = (currentIndex - 1 + totalTestimonials) % totalTestimonials;
      showTestimonial(currentIndex);
    });
    
    nextBtn.addEventListener('click', function() {
      currentIndex = (currentIndex + 1) % totalTestimonials;
      showTestimonial(currentIndex);
    });
  }
  
  // Автопрокрутка
  let slideInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % totalTestimonials;
    showTestimonial(currentIndex);
  }, 5000);
  
  // Пауза при наведении
  slider.addEventListener('mouseenter', () => {
    clearInterval(slideInterval);
  });
  
  slider.addEventListener('mouseleave', () => {
    slideInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % totalTestimonials;
      showTestimonial(currentIndex);
    }, 5000);
  });
  
  // Показать первый отзыв
  showTestimonial(currentIndex);
}

/**
 * Модальные окна для изображений товаров
 */
function initModalWindows() {
  const modal = document.querySelector('.modal');
  const modalImg = document.querySelector('.modal-img');
  const closeModal = document.querySelector('.close-modal');
  const partImages = document.querySelectorAll('.part-image img');

  if (!modal || !modalImg) return;

  partImages.forEach(img => {
    img.addEventListener('click', function() {
      modal.style.display = 'block';
      modalImg.src = this.src;
      modalImg.alt = this.alt;
      document.body.classList.add('no-scroll');
    });
  });

  if (closeModal) {
    closeModal.addEventListener('click', function() {
      modal.style.display = 'none';
      document.body.classList.remove('no-scroll');
    });
  }

  // Закрытие по клику вне изображения
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.classList.remove('no-scroll');
    }
  });
}

/**
 * Функциональность корзины
 */
function initCartFunctionality() {
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  const cartCount = document.querySelector('.cart-count');
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

  // Обновление счетчика корзины
  function updateCartCount() {
    if (cartCount) {
      cartCount.textContent = cartItems.length;
      cartCount.style.display = cartItems.length > 0 ? 'flex' : 'none';
    }
  }

  // Инициализация счетчика
  updateCartCount();

  // Добавление в корзину
  if (addToCartButtons.length) {
    addToCartButtons.forEach(button => {
      button.addEventListener('click', function() {
        const partItem = this.closest('.part-item');
        const partId = partItem.getAttribute('data-id');
        const partName = partItem.querySelector('h3').textContent;
        const partPrice = partItem.querySelector('.price').textContent;
        const partImage = partItem.querySelector('img').src;

        // Проверяем, есть ли уже такой товар в корзине
        const existingItem = cartItems.find(item => item.id === partId);

        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cartItems.push({
            id: partId,
            name: partName,
            price: partPrice,
            image: partImage,
            quantity: 1
          });
        }

        // Сохраняем в LocalStorage
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        updateCartCount();

        // Показываем уведомление
        showNotification(`"${partName}" добавлен в корзину`);
      });
    });
  }
}

/**
 * Валидация форм
 */
function initFormValidation() {
  const forms = document.querySelectorAll('form');

  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      let isValid = true;
      const inputs = this.querySelectorAll('input[required], textarea[required]');

      inputs.forEach(input => {
        if (!input.value.trim()) {
          input.classList.add('error');
          isValid = false;
        } else {
          input.classList.remove('error');
        }

        // Специальная валидация для email
        if (input.type === 'email' && input.value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input.value)) {
            input.classList.add('error');
            isValid = false;
          }
        }
      });

      if (!isValid) {
        e.preventDefault();
        showNotification('Пожалуйста, заполните все обязательные поля правильно', 'error');
      }
    });
  });
}

/**
 * Показать уведомление
 */
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

/**
 * Ленивая загрузка изображений
 */
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('img.lazy');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback для браузеров без поддержки IntersectionObserver
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.classList.remove('lazy');
    });
  }
// В product.html, в <script> в конце файла:
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id'); // Получаем ID из URL (например: product.html?id=1)

if (productId) {
  // Загружаем данные товара из базы или массива
  const product = getProductById(productId); // Эту функцию нужно создать
  displayProduct(product); // Отображаем товар на странице
}
// В main.js
const products = [
  {
    id: 1,
    name: "Моторное масло Castrol 5W-40",
    price: "2 450 ₽",
    images: ["engine-oil.jpg", "engine-oil-2.jpg"],
    description: "Синтетическое масло для двигателей...",
    specs: { brand: "Castrol", type: "Синтетическое" }
  },
  // Другие товары...
];

function getProductById(id) {
  return products.find(item => item.id == id);
}

}