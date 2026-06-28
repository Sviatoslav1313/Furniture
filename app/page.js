'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PRODUCTS } from '@/lib/products';

const validatePhone = (phone) => {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return /^\+?\d{7,15}$/.test(cleaned);
};

function MainShop() {
  // --- STATE ---
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  // Budget Planner State
  const [plannerRoom, setPlannerRoom] = useState('living');
  const [budgetLimit, setBudgetLimit] = useState(50000);
  const [generatedPackage, setGeneratedPackage] = useState([]);
  const [plannerOpen, setPlannerOpen] = useState(false); // Controls empty state / results card

  // Material Studio State
  const [activeMaterial, setActiveMaterial] = useState('oak');

  // Quiz State
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState({ room: null, color: null, vibe: null });

  // Custom Modals
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [minDateTime, setMinDateTime] = useState('');
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Toast State
  const [toasts, setToasts] = useState([]);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' or 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const searchParams = useSearchParams();

  // Sync min date-time when visit modal opens
  useEffect(() => {
    if (visitModalOpen) {
      const tzoffset = (new Date()).getTimezoneOffset() * 60000;
      const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
      setMinDateTime(localISOTime);
    }
  }, [visitModalOpen]);

  // --- TOAST HELPER ---
  const showToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  };

  // --- INITIAL LOAD & SYNC ---
  useEffect(() => {
    // Load Cart from localStorage
    const savedCart = localStorage.getItem('krona_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error(e);
      }
    }

    // Load Theme
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    } else {
      setIsDarkMode(false);
      document.body.classList.remove('dark-mode');
    }

    // Check Current User Session
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/user');
        const data = await res.json();
        if (data.authenticated) {
          setCurrentUser(data.user);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchUser();

    // Check query params for verification confirmation
    const verified = searchParams.get('verified');
    const error = searchParams.get('error');
    if (verified === 'true') {
      showToast('Електронну пошту успішно підтверджено! Тепер ви можете увійти.');
      setAuthTab('login');
      setAuthModalOpen(true);
    } else if (verified === 'false') {
      if (error === 'invalid_token') {
        showToast('Помилка підтвердження: недійсний або застарілий токен.');
      } else {
        showToast('Помилка підтвердження електронної пошти.');
      }
    }
  }, [searchParams]);

  // Sync Cart to localStorage
  useEffect(() => {
    localStorage.setItem('krona_cart', JSON.stringify(cart));
  }, [cart]);

  // Scroll Reveal Observer
  useEffect(() => {
    const revealItems = document.querySelectorAll('.reveal-item');
    const observerOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [activeCategory, searchQuery]);

  // --- THEME TOGGLE ---
  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
      showToast('Увімкнено темну тему');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
      showToast('Увімкнено світлу тему');
    }
  };

  // --- HEADER SCROLL STYLING ---
  useEffect(() => {
    const handleScroll = () => {
      const header = document.getElementById('main-header');
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- CART OPERATIONS ---
  const addToCart = (product, quantity = 1, color = null) => {
    const selectedCol = color || (product.colors && product.colors[0]) || '#111111';
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (item) => item.product.id === product.id && item.color === selectedCol
      );
      if (existingIdx > -1) {
        return prevCart.map((item, idx) => 
          idx === existingIdx 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { product, quantity, color: selectedCol }];
      }
    });
    showToast(`Додано в кошик: ${product.name}`);
  };

  const updateCartQty = (index, delta) => {
    setCart((prevCart) =>
      prevCart.map((item, idx) => {
        if (idx === index) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty > 0 ? newQty : item.quantity };
        }
        return item;
      })
    );
  };

  const removeCartItem = (index) => {
    const removedName = cart[index].product.name;
    setCart((prevCart) => prevCart.filter((_, idx) => idx !== index));
    showToast(`Вилучено з кошика: ${removedName}`);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const formatPrice = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₴';
  };

  // --- DETAIL MODAL HELPER ---
  const openProductModal = (product) => {
    setActiveProduct(product);
    setSelectedColor(product.colors[0]);
  };

  // --- ROOM BUDGET PLANNER ---
  const handleGeneratePlanner = () => {
    let remainingBudget = budgetLimit;
    const pkg = [];
    let categoryPriority = [];

    if (plannerRoom === 'living') {
      categoryPriority = ['sofa', 'table', 'chair', 'cabinet', 'lamp'];
    } else if (plannerRoom === 'bedroom') {
      categoryPriority = ['bed', 'cabinet', 'chair', 'lamp'];
    } else {
      categoryPriority = ['bed', 'sofa', 'table', 'cabinet', 'chair', 'lamp'];
    }

    categoryPriority.forEach((cat) => {
      const matches = PRODUCTS.filter((p) => p.category === cat).sort(
        (a, b) => b.rating - a.rating
      );

      for (const item of matches) {
        if (pkg.some((pkgItem) => pkgItem.product.id === item.id)) continue;
        if (item.price <= remainingBudget) {
          pkg.push({ product: item, checked: true });
          remainingBudget -= item.price;
          break;
        }
      }
    });

    if (pkg.length === 0) {
      showToast('Будь ласка, збільшіть ліміт бюджету, щоб підібрати хоча б один виріб.');
      return;
    }

    setGeneratedPackage(pkg);
    setPlannerOpen(true);
    showToast('Комплект меблів успішно згенеровано!');

    setTimeout(() => {
      document.getElementById('planner-results-card')?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, 150);
  };

  const handlePlannerCheckboxChange = (index, val) => {
    setGeneratedPackage((prev) => {
      const newPkg = [...prev];
      newPkg[index].checked = val;
      return newPkg;
    });
  };

  const plannerTotalSpent = generatedPackage.reduce(
    (sum, item) => (item.checked ? sum + item.product.price : sum),
    0
  );
  const plannerRemaining = budgetLimit - plannerTotalSpent;
  const plannerSpentPct = Math.min(100, Math.round((plannerTotalSpent / budgetLimit) * 100));

  const handleAddPlannerPackageToCart = () => {
    const checkedItems = generatedPackage.filter((item) => item.checked);
    if (checkedItems.length === 0) {
      showToast('Будь ласка, оберіть хоча б один виріб у комплекті!');
      return;
    }
    checkedItems.forEach((item) => {
      addToCart(item.product, 1);
    });
    showToast('Весь комплект успішно додано до кошика!');
    setCartOpen(true);
  };

  // --- MATERIAL STUDIO ---
  const MATERIALS = {
    oak: {
      title: 'Світлий Дуб',
      desc: "Натуральна деревина з виразним текстурним малюнком. Проходить обробку олією-воском для збереження природного вигляду та довговічності. Найбільш міцний та зносостійкий матеріал для столів та стільців.",
      image: 'assets/images/texture_oak.png',
      productIds: [2, 3],
    },
    walnut: {
      title: 'Американський Горіх',
      desc: "Преміальна благородна деревина темно-коричневого кольору. Вирізняється унікальними візерунками волокон та високою стабільністю. Надає інтер'єру особливої статусності та вишуканості.",
      image: 'assets/images/texture_walnut.png',
      productIds: [6],
    },
    boucle: {
      title: 'Фактурне Букле',
      desc: "Суперм'яка зносостійка тканина з об'ємними петельками. Забезпечує неперевершений тактильний затишок, стійка до бруду та легко чиститься. Ідеальний вибір для сучасних дизайнерських диванів та ліжок.",
      image: 'assets/images/texture_boucle.png',
      productIds: [1, 4],
    },
  };

  // --- STYLE QUIZ ---
  const handleQuizOptionClick = (field, val) => {
    setQuizAnswers((prev) => ({ ...prev, [field]: val }));
    setTimeout(() => {
      setQuizStep((prev) => prev + 1);
    }, 250);
  };

  const getQuizRecommendedProduct = () => {
    if (quizAnswers.room === 'bed') {
      return PRODUCTS.find((p) => p.category === 'bed') || PRODUCTS[3];
    } else if (quizAnswers.room === 'table') {
      if (quizAnswers.color === 'dark') {
        return PRODUCTS.find((p) => p.id === 6) || PRODUCTS[5];
      } else {
        return PRODUCTS.find((p) => p.category === 'table') || PRODUCTS[2];
      }
    } else {
      if (quizAnswers.color === 'dark') {
        return PRODUCTS.find((p) => p.id === 5) || PRODUCTS[4];
      } else {
        return PRODUCTS.find((p) => p.category === 'sofa') || PRODUCTS[0];
      }
    }
  };

  const handleCopyQuizPromo = () => {
    navigator.clipboard.writeText('KRONA_STYLE_10').then(() => {
      showToast('Промокод KRONA_STYLE_10 скопійовано!');
    });
  };
  // --- REVIEWS LIGHTBOX ---

  const REVIEWS_DATA = [
    {
      img: 'assets/images/review_1.png',
      author: 'Ольга, м. Київ',
      quote: "Диван Nord Soft ідеально підійшов під нашу світлу вітальню. Текстура букле неймовірно приємна на дотик!",
    },
    {
      img: 'assets/images/review_2.png',
      author: 'Дмитро, м. Львів',
      quote: "Ліжко Beige Comfort стало центром нашої спальні. Якість збірки на вищому рівні, каркас дуже надійний.",
    },
    {
      img: 'assets/images/review_3.png',
      author: 'Ірина, м. Одеса',
      quote: "Горіхова текстура комоду Walnut Horizon виглядає розкішно. Шухляди зачиняються беззвучно і плавно.",
    },
  ];

  // --- VISIT BOOKING SUBMIT ---
  const handleVisitSubmit = (e) => {
    e.preventDefault();
    if (!validatePhone(bookingPhone)) {
      showToast('Помилка: Введіть коректний номер телефону (наприклад: +380991234567 або міжнародний формат)');
      return;
    }
    const selectedDate = new Date(bookingTime);
    const now = new Date();
    if (selectedDate < now) {
      showToast('Помилка: Обрана дата та час вже минули. Будь ласка, оберіть майбутній час.');
      return;
    }
    setVisitModalOpen(false);
    setBookingName('');
    setBookingPhone('');
    setBookingTime('');
    showToast(`Дякуємо, ${bookingName}! Ваш візит успішно заплановано. Менеджер зв'яжеться з вами.`);
  };

  // --- CHECKOUT SUBMIT ---
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Помилка: Ви повинні увійти в акаунт для оформлення замовлення.');
      return;
    }
    if (!validatePhone(checkoutPhone)) {
      showToast('Помилка: Введіть коректний номер телефону (наприклад: +380991234567 або міжнародний формат)');
      return;
    }

    const orderItems = cart.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      color: item.color || item.product.colors[0]
    }));

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: checkoutName,
          customerPhone: checkoutPhone,
          customerAddress: checkoutAddress,
          customerEmail: currentUser.email,
          items: orderItems,
          total: cartTotal,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        showToast(`Помилка: ${data.error || 'Не вдалося надіслати замовлення'}`);
        return;
      }

      setCart([]);
      setCheckoutModalOpen(false);
      setCheckoutName('');
      setCheckoutPhone('');
      setCheckoutAddress('');
      showToast(`Дякуємо за покупку, ${checkoutName}! Замовлення успішно оформлено та надіслано.`);
    } catch (error) {
      console.error('Checkout error:', error);
      showToast('Помилка зв\'язку з сервером. Спробуйте пізніше.');
    }
  };

  // --- NEWSLETTER SUBMIT ---
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const val = input ? input.value : '';
    if (input) input.value = '';
    showToast(`Дякуємо! Ваш Email (${val}) успішно додано до розсилки.`);
  };

  // --- AUTHENTICATION SUBMIT HANDLERS ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);

    if (authTab === 'register') {
      if (authPassword !== authConfirmPassword) {
        setAuthError('Паролі не співпадають');
        setAuthLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, password: authPassword }),
        });
        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || 'Помилка реєстрації');
        } else {
          setAuthSuccess(data.message);
          setAuthEmail('');
          setAuthPassword('');
          setAuthConfirmPassword('');
        }
      } catch (err) {
        setAuthError('Не вдалося з’єднатися з сервером');
      }
    } else {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, password: authPassword }),
        });
        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || 'Невірна пошта або пароль');
        } else {
          setCurrentUser(data.user);
          setAuthModalOpen(false);
          setAuthEmail('');
          setAuthPassword('');
          showToast('Ви успішно увійшли в систему!');
        }
      } catch (err) {
        setAuthError('Не вдалося з’єднатися з сервером');
      }
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setCurrentUser(null);
        showToast('Ви вийшли з системи');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getProductCountString = (count) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) {
      return `${count} товар`;
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return `${count} товари`;
    } else {
      return `${count} товарів`;
    }
  };

  const countLivingRoom = PRODUCTS.filter(p => p.category === 'sofa' || p.category === 'lamp').length;
  const countBedroom = PRODUCTS.filter(p => p.category === 'bed').length;
  const countDiningArea = PRODUCTS.filter(p => p.category === 'chair' || p.category === 'table').length;
  const countOffice = PRODUCTS.filter(p => p.category === 'cabinet').length;

  return (
    <>
      {/* Header Navigation */}
      <header id="main-header">
        <div className="container header-container">
          <a href="#" className="logo">
            KRONA<span className="logo-dot"></span>
          </a>
          
          <nav className="nav-menu">
            <a href="#catalog" className="nav-link">Каталог</a>
            <a href="#categories" className="nav-link">Категорії</a>
            <a href="#material-studio" className="nav-link">Матеріали</a>
            <a href="#benefits" className="nav-link">Переваги</a>
            <a href="#showroom" className="nav-link">Шоурум</a>
          </nav>
          
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="action-btn" onClick={toggleTheme} aria-label="Змінити тему">
              <i className={isDarkMode ? "fa-solid fa-sun" : "fa-regular fa-moon"}></i>
            </button>

            {/* Auth Indicator Button */}
            {currentUser ? (
              <div className="user-logged-in-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="user-email-display" style={{ fontSize: '0.85rem', color: 'var(--color-text-dark)', fontWeight: '600' }}>
                  {currentUser.email}
                </span>
                <button className="action-btn" onClick={handleLogout} title="Вийти з системи" aria-label="Вийти">
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </div>
            ) : (
              <button className="action-btn" onClick={() => { setAuthModalOpen(true); setAuthError(''); setAuthSuccess(''); }} title="Увійти" aria-label="Увійти">
                <i className="fa-regular fa-user"></i>
              </button>
            )}

            <button className="action-btn" onClick={() => setIsSearchOpen(!isSearchOpen)} aria-label="Пошук">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
            <button className="action-btn" onClick={() => setCartOpen(true)} aria-label="Кошик">
              <i className="fa-solid fa-bag-shopping"></i>
              <span className="cart-count">{cartItemCount}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Inline Search Bar */}
      {isSearchOpen && (
        <div className="search-bar-inline" style={{ background: 'var(--color-bg-light)', borderBottom: '1px solid var(--color-border)', padding: '15px 0' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
            <input 
              type="text" 
              placeholder="Шукати меблі за назвою..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '600px',
                padding: '12px 20px',
                border: '1px solid var(--color-border)',
                borderRadius: '25px',
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <img src="assets/images/hero.png" alt="Сучасна вітальня від KRONA" />
        </div>
        <div className="container">
          <div className="hero-content">
            <h5 className="hero-subtitle">Ексклюзивна колекція 2026</h5>
            <h1 className="hero-title">Сучасний дизайн для вашого <strong>комфорту</strong></h1>
            <p className="hero-desc">Студія меблів KRONA створює ергономічні, мінімалістичні меблі з масиву натурального дуба та ясеня. Дотик природи у кожному виробі.</p>
            <div className="hero-actions">
              <a href="#catalog" className="btn btn-primary">Переглянути каталог</a>
              <a href="#showroom" className="btn btn-secondary">Про шоурум</a>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <span>Прокрутіть</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section bg-alt" id="categories">
        <div className="container">
          <h2 className="section-title reveal-item">Популярні категорії</h2>
          <p className="section-subtitle reveal-item">Створіть гармонійний інтер'єр у кожній кімнаті вашої оселі.</p>
          
          <div className="category-grid">
            <div className="category-card reveal-item" onClick={() => { setActiveCategory('sofa'); document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' }); }}>
              <img className="category-img" src="assets/images/sofa.png" alt="Вітальня меблі" />
              <div className="category-overlay">
                <h3 className="category-name">Вітальня</h3>
                <span className="category-count">{getProductCountString(countLivingRoom)}</span>
              </div>
            </div>
            <div className="category-card reveal-item" onClick={() => { setActiveCategory('bed'); document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' }); }}>
              <img className="category-img" src="assets/images/bed.png" alt="Спальня меблі" />
              <div className="category-overlay">
                <h3 className="category-name">Спальня</h3>
                <span className="category-count">{getProductCountString(countBedroom)}</span>
              </div>
            </div>
            <div className="category-card reveal-item" onClick={() => { setActiveCategory('table'); document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' }); }}>
              <img className="category-img" src="assets/images/table.png" alt="Їдальня меблі" />
              <div className="category-overlay">
                <h3 className="category-name">Обідня зона</h3>
                <span className="category-count">{getProductCountString(countDiningArea)}</span>
              </div>
            </div>
            <div className="category-card reveal-item" onClick={() => { setActiveCategory('cabinet'); document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' }); }}>
              <img className="category-img" src="assets/images/cabinet.png" alt="Кабінет меблі" />
              <div className="category-overlay">
                <h3 className="category-name">Офіс та кабінет</h3>
                <span className="category-count">{getProductCountString(countOffice)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section className="section" id="catalog">
        <div className="container">
          <h2 className="section-title reveal-item">Наш каталог</h2>
          <p className="section-subtitle reveal-item">Кожен виріб виготовляється під замовлення з можливістю вибору відтінку дерева та тканини.</p>
          
          <div className="catalog-filters reveal-item">
            {['all', 'sofa', 'chair', 'table', 'bed', 'cabinet'].map((cat) => (
              <button 
                key={cat} 
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'all' ? 'Всі товари' : cat === 'sofa' ? 'Дивани' : cat === 'chair' ? 'Стільці' : cat === 'table' ? 'Столи' : cat === 'bed' ? 'Ліжка' : 'Комоди'}
              </button>
            ))}
          </div>
          
          <div className="product-grid" id="product-list">
            {PRODUCTS
              .filter((p) => activeCategory === 'all' || p.category === activeCategory)
              .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((product) => (
                <div key={product.id} className="product-card reveal-item">
                  <div className="product-img-wrapper" onClick={() => openProductModal(product)}>
                    {product.badge && <span className="product-badge">{product.badge}</span>}
                    <img className="product-card-img" src={product.image} alt={product.name} />
                    <div className="product-actions">
                      <button className="product-action-btn quick-view-btn" title="Швидкий перегляд" onClick={(e) => { e.stopPropagation(); openProductModal(product); }}>
                        <i className="fa-regular fa-eye"></i>
                      </button>
                      <button className="product-action-btn add-to-cart-btn" title="Додати в кошик" onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}>
                        <i className="fa-solid fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div className="product-info">
                    <span className="product-cat">
                      {product.category === 'sofa' ? 'Дивани' : product.category === 'chair' ? 'Стільці' : product.category === 'table' ? 'Столи' : product.category === 'bed' ? 'Ліжка' : product.category === 'lamp' ? 'Освітлення' : 'Комоди'}
                    </span>
                    <h3 className="product-name" onClick={() => openProductModal(product)} style={{ cursor: 'pointer' }}>{product.name}</h3>
                    <div className="product-bottom">
                      <span className="product-price">{formatPrice(product.price)}</span>
                      <div className="product-rating">
                        <i className="fa-solid fa-star"></i>
                        <span>{product.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Room & Budget Planner */}
      <section className="section budget-planner-section reveal-item" id="budget-planner">
        <div className="container">
          <h2 className="section-title">Планувальник бюджету</h2>
          <p className="section-subtitle">Оберіть кімнату та встановіть ваш бюджет. Наш алгоритм підбере оптимальний комплект меблів.</p>
          
          <div className="planner-layout">
            <div className="planner-inputs-card">
              <h3 className="planner-card-title">Параметри комплекту</h3>
              
              <div style={{ marginBottom: '24px' }}>
                <label className="planner-label">Оберіть кімнату:</label>
                <div className="planner-room-selector">
                  {[
                    { id: 'living', icon: 'fa-couch', label: 'Вітальня' },
                    { id: 'bedroom', icon: 'fa-bed', label: 'Спальня' },
                    { id: 'full', icon: 'fa-house', label: 'Вся оселя' }
                  ].map((room) => (
                    <button 
                      key={room.id}
                      className={`planner-room-btn ${plannerRoom === room.id ? 'active' : ''}`}
                      onClick={() => setPlannerRoom(room.id)}
                    >
                      <i className={`fa-solid ${room.icon}`}></i> <span>{room.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label className="planner-label" style={{ marginBottom: 0 }}>Ваш бюджетний ліміт:</label>
                  <span className="planner-budget-display">{formatPrice(budgetLimit)}</span>
                </div>
                <input 
                  type="range" 
                  min="15000" 
                  max="150000" 
                  step="5000" 
                  value={budgetLimit} 
                  onChange={(e) => setBudgetLimit(parseInt(e.target.value))}
                  className="planner-slider"
                />
                <div className="slider-marks">
                  <span>15k ₴</span>
                  <span>50k ₴</span>
                  <span>100k ₴</span>
                  <span>150k ₴</span>
                </div>
              </div>
              
              <button className="btn btn-primary" onClick={handleGeneratePlanner} style={{ width: '100%', padding: '14px' }}>Згенерувати комплект</button>
            </div>

            {plannerOpen ? (
              <div className="planner-results-card" id="planner-results-card">
                <div className="planner-results-header">
                  <h3 className="planner-card-title" style={{ marginBottom: 0 }}>Підібраний комплект</h3>
                  <span 
                    className="planner-match-badge"
                    style={plannerRemaining < 0 ? { backgroundColor: 'rgba(186, 45, 45, 0.1)', color: 'var(--color-danger)' } : {}}
                  >
                    {plannerRemaining < 0 ? (
                      <><i className="fa-solid fa-triangle-exclamation"></i> Бюджет перевищено</>
                    ) : (
                      <><i className="fa-solid fa-circle-check"></i> В межах бюджету</>
                    )}
                  </span>
                </div>
                
                <div className="planner-progress-wrapper">
                  <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Разом витрачено:</span>
                    <span>{formatPrice(plannerTotalSpent)}</span>
                  </div>
                  <div className="planner-progress-bar">
                    <div 
                      className="planner-progress-fill" 
                      style={{ 
                        width: `${plannerSpentPct}%`, 
                        backgroundColor: plannerRemaining < 0 ? 'var(--color-danger)' : 'var(--color-primary)' 
                      }}
                    ></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                    <span>Витрачено: <strong style={{ color: plannerRemaining < 0 ? 'var(--color-danger)' : 'var(--color-primary)' }}>{plannerSpentPct}%</strong></span>
                    <span>{plannerRemaining >= 0 ? 'Залишилось' : 'Перевищення'}: <strong style={{ color: plannerRemaining < 0 ? 'var(--color-danger)' : '' }}>{formatPrice(Math.abs(plannerRemaining))}</strong></span>
                  </div>
                </div>
                
                <div className="planner-items-list">
                  {generatedPackage.map((pkgItem, index) => (
                    <div key={pkgItem.product.id} className="planner-item-card">
                      <input 
                        type="checkbox" 
                        className="planner-item-checkbox" 
                        checked={pkgItem.checked}
                        onChange={(e) => handlePlannerCheckboxChange(index, e.target.checked)}
                      />
                      <img src={pkgItem.product.image} alt={pkgItem.product.name} className="planner-item-img" />
                      <div className="planner-item-info">
                        <h4 className="planner-item-name">{pkgItem.product.name}</h4>
                        <span className="planner-item-price">{formatPrice(pkgItem.product.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="planner-actions" style={{ marginTop: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Разом за комплект:</span>
                    <strong style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-dark)' }}>{formatPrice(plannerTotalSpent)}</strong>
                  </div>
                  <button className="btn btn-primary" onClick={handleAddPlannerPackageToCart}>
                    <i className="fa-solid fa-cart-shopping"></i> Додати комплект у кошик
                  </button>
                </div>
              </div>
            ) : (
              <div className="planner-teaser-card">
                <div className="teaser-icon"><i className="fa-solid fa-sliders"></i></div>
                <h3>Очікування параметрів</h3>
                <p>Налаштуйте бюджетний ліміт та натисніть кнопку "Згенерувати комплект", щоб побачити добірку дизайнерських меблів.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Material Studio */}
      <section className="section material-studio reveal-item" id="material-studio">
        <div className="container">
          <h2 className="section-title">Студія матеріалів</h2>
          <p className="section-subtitle">Оберіть текстуру, щоб дізнатися про її властивості та переглянути сумісні меблі.</p>
          
          <div className="material-layout">
            <div className="material-preview">
              <div 
                className="material-texture-display" 
                style={{ backgroundImage: `url('${MATERIALS[activeMaterial].image}')` }}
              ></div>
              <div className="material-details-card">
                <h3 className="material-title">{MATERIALS[activeMaterial].title}</h3>
                <p className="material-description">{MATERIALS[activeMaterial].desc}</p>
              </div>
            </div>
            
            <div className="material-controls">
              <div className="material-selectors">
                {Object.entries(MATERIALS).map(([key, data]) => (
                  <button 
                    key={key}
                    className={`material-btn ${activeMaterial === key ? 'active' : ''}`}
                    onClick={() => setActiveMaterial(key)}
                  >
                    <span className="material-preview-dot" style={{ backgroundImage: `url('${data.image}')` }}></span>
                    {data.title}
                  </button>
                ))}
              </div>
              
              <div className="material-products">
                <h4 className="material-products-title">Використовується в товарах:</h4>
                <div className="material-products-grid">
                  {MATERIALS[activeMaterial].productIds.map((id) => {
                    const product = PRODUCTS.find((p) => p.id === id);
                    if (!product) return null;
                    return (
                      <div 
                        key={id} 
                        className="material-product-thumb" 
                        onClick={() => openProductModal(product)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img src={product.image} alt={product.name} />
                        <div className="material-product-thumb-name" title={product.name}>{product.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section bg-alt" id="benefits">
        <div className="container">
          <h2 className="section-title reveal-item">Чому обирають нас</h2>
          <p className="section-subtitle reveal-item">Ми цінуємо довговічність, екологічність та естетику простору.</p>
          
          <div className="features-grid">
            <div className="feature-card reveal-item">
              <div className="feature-icon"><i className="fa-solid fa-tree"></i></div>
              <h3 className="feature-title">Екологічні матеріали</h3>
              <p className="feature-desc">Використовуємо лише сертифіковану деревину та натуральні олії для покриття.</p>
            </div>
            <div className="feature-card reveal-item">
              <div className="feature-icon"><i className="fa-solid fa-couch"></i></div>
              <h3 className="feature-title">Унікальний дизайн</h3>
              <p className="feature-desc">Мінімалістичні форми, що впишуться у будь-який сучасний інтер'єр.</p>
            </div>
            <div className="feature-card reveal-item">
              <div className="feature-icon"><i className="fa-solid fa-truck-fast"></i></div>
              <h3 className="feature-title">Швидка доставка</h3>
              <p className="feature-desc">Безкоштовна доставка та професійне складання по всій Україні.</p>
            </div>
            <div className="feature-card reveal-item">
              <div className="feature-icon"><i className="fa-solid fa-shield-halved"></i></div>
              <h3 className="feature-title">5 років гарантії</h3>
              <p className="feature-desc">Впевнені в якості наших меблів, тому надаємо тривалу офіційну гарантію.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Photo Gallery */}
      <section className="section reviews-gallery-section bg-alt" id="reviews">
        <div className="container">
          <h2 className="section-title reveal-item">Атмосфера KRONA у ваших оселях</h2>
          <p className="section-subtitle reveal-item">Реальні фотографії від наших задоволених покупців. Натисніть на фото для перегляду деталей.</p>
          
          <div className="reviews-grid">
            {REVIEWS_DATA.map((review, index) => (
              <div 
                key={index}
                className="review-card reveal-item"
                onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}
              >
                <div className="review-img-wrapper">
                  <img src={review.img} alt={review.author} className="review-img" />
                  <div className="review-overlay">
                    <div className="review-text-content">
                      <h4 className="review-author">{review.author}</h4>
                      <p className="review-quote">"{review.quote}"</p>
                      <button 
                        className="btn btn-secondary btn-sm review-shop-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const prodId = index === 0 ? 1 : index === 1 ? 4 : 6;
                          const prod = PRODUCTS.find(p => p.id === prodId);
                          if (prod) openProductModal(prod);
                        }}
                      >
                        <i className="fa-solid fa-eye"></i> {index === 0 ? 'Диван Nord Soft' : index === 1 ? 'Ліжко Beige Comfort' : 'Комод Walnut Horizon'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showroom visit promo */}
      <section className="promo-banner" id="showroom">
        <div className="promo-bg">
          <img src="assets/images/hero.png" alt="Шоурум KRONA" />
        </div>
        <div className="container">
          <div className="promo-content">
            <span className="promo-tag">Завітайте до нас</span>
            <h2 className="promo-title">Відвідайте наш фірмовий шоурум</h2>
            <p className="promo-desc">Відчуйте якість текстур та комфорт меблів наживо за адресою: м. Київ, вул. Дизайнерська, 12. Чекаємо на вас щодня з 10:00 до 20:00.</p>
            <button className="btn btn-primary" onClick={() => setVisitModalOpen(true)}>Записатися на візит</button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="container">
          <h2 className="section-title reveal-item">Будьмо на зв'язку</h2>
          <p className="section-subtitle reveal-item">Підпишіться на новини та отримуйте ексклюзивні пропозиції та знижки.</p>
          <form className="newsletter-form reveal-item" onSubmit={handleNewsletterSubmit}>
            <input type="email" className="newsletter-input" placeholder="Ваш Email" required />
            <button type="submit" className="btn btn-primary">Підписатися</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col-about">
              <a href="#" className="logo">
                KRONA<span className="logo-dot"></span>
              </a>
              <p className="footer-about-text">Студія меблів, яка поєднує сучасний мінімалізм та тепло натуральних матеріалів для створення затишку у вашому домі.</p>

            </div>
            <div>
              <h4 className="footer-col-title">Інформація</h4>
              <ul className="footer-links">
                <li><a href="#catalog">Каталог</a></li>
                <li><a href="#categories">Категорії</a></li>
                <li><a href="#benefits">Переваги</a></li>
                <li><a href="#showroom">Шоурум</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-col-title">Підтримка</h4>
              <ul className="footer-links">
                <li><a href="#">Доставка та оплата</a></li>
                <li><a href="#">Повернення товару</a></li>
                <li><a href="#">Гарантійне обслуговування</a></li>
                <li><a href="#">Часті питання (FAQ)</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-col-title">Контакти</h4>
              <div className="footer-contact-item">
                <span className="footer-contact-icon"><i className="fa-solid fa-phone"></i></span>
                <span>+380 93 123 45 67</span>
              </div>
              <div className="footer-contact-item">
                <span className="footer-contact-icon"><i className="fa-solid fa-envelope"></i></span>
                <span>info@krona-furniture.com</span>
              </div>
              <div className="footer-contact-item">
                <span className="footer-contact-icon"><i className="fa-solid fa-location-dot"></i></span>
                <span>м. Київ, вул. Дизайнерська, 12</span>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2026 KRONA — Студія сучасних меблів. Всі права захищені.</p>
            <p>
              Розробка сайту — 
              <a href="https://www.sitenest.work/" target="_blank" className="sitenest-footer-link" rel="noopener noreferrer">
                SiteNest
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Quiz Trigger */}
      <button className="floating-quiz-btn" onClick={() => { setQuizStep(1); setQuizOpen(true); }} aria-label="Підібрати стиль меблів">
        <i className="fa-solid fa-wand-magic-sparkles"></i>
        <span>Тест: Підібрати меблі</span>
      </button>

      {/* --- MODALS & DRAWERS --- */}

      {/* Cart Drawer */}
      <div className={`cart-drawer-overlay ${cartOpen ? 'active' : ''}`} onClick={() => setCartOpen(false)}></div>
      <div className={`cart-drawer ${cartOpen ? 'active' : ''}`}>
        <div className="cart-header">
          <h3 className="cart-title">Ваш кошик</h3>
          <button className="cart-close-btn" onClick={() => setCartOpen(false)} aria-label="Закрити">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <div className="cart-items-container">
          {cart.length === 0 ? (
            <p className="cart-empty-msg">Ваш кошик порожній</p>
          ) : (
            cart.map((item, index) => (
              <div key={`${item.product.id}-${item.color}`} className="cart-item">
                <div className="cart-item-img">
                  <img src={item.product.image} alt={item.product.name} />
                </div>
                <div className="cart-item-info">
                  <div>
                    <h4 className="cart-item-name">{item.product.name}</h4>
                    <div className="cart-item-meta">
                      Колір: <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color, verticalAlign: 'middle', border: '1px solid #ddd', marginLeft: '4px' }}></span>
                    </div>
                  </div>
                  <div className="cart-item-bottom">
                    <div className="qty-selector">
                      <button className="qty-btn minus" onClick={() => updateCartQty(index, -1)}>-</button>
                      <span className="qty-val">{item.quantity}</span>
                      <button className="qty-btn plus" onClick={() => updateCartQty(index, 1)}>+</button>
                    </div>
                    <span className="cart-item-price">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeCartItem(index)}>Видалити</button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="cart-footer">
          <div className="cart-summary-line">
            <span className="cart-total-label">Всього до сплати:</span>
            <span className="cart-total-price">{formatPrice(cartTotal)}</span>
          </div>
          <button 
            className="btn btn-primary cart-checkout-btn" 
            onClick={() => {
              if (cart.length === 0) {
                showToast('Ваш кошик порожній. Додайте товари для замовлення.');
                return;
              }
              if (!currentUser) {
                showToast('Будь ласка, увійдіть в акаунт або зареєструйтеся, щоб оформити замовлення.');
                setCartOpen(false);
                setAuthTab('login');
                setAuthModalOpen(true);
                return;
              }
              setCartOpen(false);
              setCheckoutModalOpen(true);
            }}
          >
            Оформити замовлення
          </button>
        </div>
      </div>

      {/* Product Details Modal */}
      {activeProduct && (
        <div className="modal-overlay active" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setActiveProduct(null); }}>
          <div className="modal-container">
            <button className="modal-close-btn" onClick={() => setActiveProduct(null)} aria-label="Закрити">
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="modal-gallery">
              <div className="modal-img-container">
                <img src={activeProduct.colorImages?.[selectedColor] || activeProduct.image} alt={activeProduct.name} />
              </div>
            </div>
            
            <div className="modal-details">
              <span className="modal-cat">
                {activeProduct.category === 'sofa' ? 'Дивани' : activeProduct.category === 'chair' ? 'Стільці' : activeProduct.category === 'table' ? 'Столи' : activeProduct.category === 'bed' ? 'Ліжка' : activeProduct.category === 'lamp' ? 'Освітлення' : 'Комоди'}
              </span>
              <h2 className="modal-name">{activeProduct.name}</h2>
              <div className="modal-rating-container">
                <div className="modal-rating">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const fullStars = Math.floor(activeProduct.rating);
                    const hasHalf = activeProduct.rating % 1 !== 0;
                    if (i < fullStars) return <i key={i} className="fa-solid fa-star"></i>;
                    if (i === fullStars && hasHalf) return <i key={i} className="fa-solid fa-star-half-stroke"></i>;
                    return <i key={i} className="fa-regular fa-star"></i>;
                  })}
                </div>
                <span className="modal-reviews">{activeProduct.rating} ({activeProduct.reviews} відгуків)</span>
              </div>
              
              <div className="modal-price">{formatPrice(activeProduct.price)}</div>
              <p className="modal-desc">{activeProduct.description}</p>
              
              <h4 className="modal-option-title">Колір оббивки / покриття</h4>
              <div className="modal-color-options">
                {activeProduct.colors.map((color) => (
                  <span 
                    key={color}
                    className={`color-pill ${selectedColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  ></span>
                ))}
              </div>
              
              <div className="modal-specs">
                {Object.entries(activeProduct.specs).map(([key, val]) => (
                  <div key={key} className="spec-line">
                    <span className="spec-label">{key}:</span>
                    <span className="spec-value">{val}</span>
                  </div>
                ))}
              </div>
              
              <button 
                className="btn btn-primary modal-buy-btn"
                onClick={() => {
                  addToCart(activeProduct, 1, selectedColor);
                  setActiveProduct(null);
                  setTimeout(() => setCartOpen(true), 400);
                }}
              >
                Додати в кошик
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Style Quiz Modal */}
      {quizOpen && (
        <div className="quiz-modal-overlay active" onClick={(e) => { if (e.target.classList.contains('quiz-modal-overlay')) setQuizOpen(false); }}>
          <div className="quiz-modal-container">
            <button className="quiz-close-btn" onClick={() => setQuizOpen(false)} aria-label="Закрити">
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="quiz-progress-bar">
              <div className="quiz-progress-line" style={{ width: `${((quizStep - 1) / 3) * 100}%` }}></div>
            </div>
            
            <div className="quiz-steps-container">
              {quizStep === 1 && (
                <div className="quiz-step active">
                  <h3 className="quiz-step-title">Для якої кімнати ви шукаєте меблі?</h3>
                  <div className="quiz-options">
                    <button className="quiz-option" onClick={() => handleQuizOptionClick('room', 'sofa')}>
                      <div className="option-icon"><i className="fa-solid fa-couch"></i></div>
                      <span>Вітальня</span>
                    </button>
                    <button className="quiz-option" onClick={() => handleQuizOptionClick('room', 'bed')}>
                      <div className="option-icon"><i className="fa-solid fa-bed"></i></div>
                      <span>Спальня</span>
                    </button>
                    <button className="quiz-option" onClick={() => handleQuizOptionClick('room', 'table')}>
                      <div className="option-icon"><i className="fa-solid fa-chair"></i></div>
                      <span>Обідня зона / Кухня</span>
                    </button>
                  </div>
                </div>
              )}
              
              {quizStep === 2 && (
                <div className="quiz-step active">
                  <h3 className="quiz-step-title">Яка колірна палітра вам більше до душі?</h3>
                  <div className="quiz-options">
                    <button className="quiz-option" onClick={() => handleQuizOptionClick('color', 'light')}>
                      <div className="option-color-preview" style={{ backgroundColor: '#F4F1EA' }}></div>
                      <span>Світлі природні тони (крем, дуб)</span>
                    </button>
                    <button className="quiz-option" onClick={() => handleQuizOptionClick('color', 'dark')}>
                      <div className="option-color-preview" style={{ backgroundColor: '#111111' }}></div>
                      <span>Контрастні темні акценти (чорний, горіх)</span>
                    </button>
                    <button className="quiz-option" onClick={() => handleQuizOptionClick('color', 'colored')}>
                      <div className="option-color-preview" style={{ background: 'linear-gradient(135deg, #3E4A3D, #7A7A75)' }}></div>
                      <span>Глибокі відтінки (оливковий, сірий)</span>
                    </button>
                  </div>
                </div>
              )}
              
              {quizStep === 3 && (
                <div className="quiz-step active">
                  <h3 className="quiz-step-title">Яка атмосфера має панувати в кімнаті?</h3>
                  <div className="quiz-options">
                    <button className="quiz-option" onClick={() => handleQuizOptionClick('vibe', 'cozy')}>
                      <div className="option-icon"><i className="fa-solid fa-fire"></i></div>
                      <span>Максимальний затишок (Hygge)</span>
                    </button>
                    <button className="quiz-option" onClick={() => handleQuizOptionClick('vibe', 'minimal')}>
                      <div className="option-icon"><i className="fa-solid fa-compass-drafting"></i></div>
                      <span>Чистий мінімалізм</span>
                    </button>
                    <button className="quiz-option" onClick={() => handleQuizOptionClick('vibe', 'luxury')}>
                      <div className="option-icon"><i className="fa-solid fa-gem"></i></div>
                      <span>Сучасний шик (Modern Luxury)</span>
                    </button>
                  </div>
                </div>
              )}
              
              {quizStep > 3 && (() => {
                const rec = getQuizRecommendedProduct();
                return (
                  <div className="quiz-step active">
                    <h3 className="quiz-step-title">Рекомендовано для вас</h3>
                    <div className="quiz-result-card">
                      <img src={rec.image} alt={rec.name} className="quiz-result-img" />
                      <div className="quiz-result-info">
                        <span className="quiz-result-cat">{rec.category === 'sofa' ? 'Вітальня' : rec.category === 'bed' ? 'Спальня' : 'Обідня зона'}</span>
                        <h4 className="quiz-result-name">{rec.name}</h4>
                        <div className="quiz-result-price">{formatPrice(rec.price)}</div>
                        
                        <div className="quiz-promo-box">
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Промокод на знижку 10%:</div>
                            <span className="quiz-promo-code">KRONA_STYLE_10</span>
                          </div>
                          <button className="quiz-promo-copy-btn" onClick={handleCopyQuizPromo} title="Копіювати">
                            <i className="fa-regular fa-copy"></i> Копіювати
                          </button>
                        </div>
                        
                        <div className="quiz-result-actions">
                          <button className="btn btn-primary" onClick={() => { addToCart(rec, 1); setQuizOpen(false); setTimeout(() => setCartOpen(true), 400); }}>Додати до кошика</button>
                          <button className="btn btn-secondary" onClick={() => { setQuizStep(1); setQuizAnswers({ room: null, color: null, vibe: null }); }}>Пройти знову</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="quiz-footer-actions">
              {quizStep > 1 && quizStep <= 3 && (
                <button className="btn btn-secondary" onClick={() => setQuizStep(quizStep - 1)}>Назад</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Showroom Visit Booking Modal */}
      {visitModalOpen && (
        <div className="modal-overlay active" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setVisitModalOpen(false); }}>
          <div className="modal-container" style={{ maxWidth: '450px' }}>
            <button className="modal-close-btn" onClick={() => setVisitModalOpen(false)} aria-label="Закрити">
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="modal-details" style={{ width: '100%', padding: '30px' }}>
              <h3 className="modal-name" style={{ marginBottom: '8px' }}>Запис на візит до шоуруму</h3>
              <p className="modal-desc" style={{ marginBottom: '20px' }}>Залиште ваші контакти, і ми забронюємо для вас персонального дизайнера-консультанта.</p>
              <form onSubmit={handleVisitSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text)' }}>Ваше ім'я</label>
                  <input type="text" required value={bookingName} onChange={(e) => setBookingName(e.target.value)} className="newsletter-input" placeholder="Іван Петренко" style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '12px' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text)' }}>Номер телефону</label>
                  <input type="tel" required value={bookingPhone} onChange={(e) => setBookingPhone(e.target.value)} className="newsletter-input" placeholder="+380 99 123 45 67" style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '12px' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text)' }}>Бажана дата та час</label>
                  <input type="datetime-local" required value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} min={minDateTime} className="newsletter-input" style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '12px', fontFamily: 'inherit' }} />
                </div>
                <button type="submit" class="btn btn-primary" style={{ width: '100%', padding: '14px' }}>Підтвердити запис</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutModalOpen && (
        <div className="modal-overlay active" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setCheckoutModalOpen(false); }}>
          <div className="modal-container" style={{ maxWidth: '450px' }}>
            <button className="modal-close-btn" onClick={() => setCheckoutModalOpen(false)} aria-label="Закрити">
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="modal-details" style={{ width: '100%', padding: '30px' }}>
              <h3 className="modal-name" style={{ marginBottom: '8px' }}>Оформлення замовлення</h3>
              <p className="modal-desc" style={{ marginBottom: '20px' }}>Введіть ваші дані для підтвердження замовлення та розрахунку доставки.</p>
              <form onSubmit={handleCheckoutSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text)' }}>Ваше ім'я</label>
                  <input type="text" required value={checkoutName} onChange={(e) => setCheckoutName(e.target.value)} className="newsletter-input" placeholder="Олена Ковальчук" style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '12px' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text)' }}>Номер телефону</label>
                  <input type="tel" required value={checkoutPhone} onChange={(e) => setCheckoutPhone(e.target.value)} className="newsletter-input" placeholder="+380 50 123 45 67" style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '12px' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text)' }}>Місто та відділення Нової Пошти</label>
                  <input type="text" required value={checkoutAddress} onChange={(e) => setCheckoutAddress(e.target.value)} className="newsletter-input" placeholder="Київ, відділення №15" style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '12px' }} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>Надіслати замовлення</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Lightbox Overlay */}
      {lightboxOpen && (
        <div className="modal-overlay active" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setLightboxOpen(false); }} style={{ zIndex: 400, backgroundColor: 'rgba(11, 11, 11, 0.95)' }}>
          <button className="modal-close-btn" onClick={() => setLightboxOpen(false)} style={{ color: '#fff', top: '30px', right: '30px' }} aria-label="Закрити">
            <i className="fa-solid fa-xmark"></i>
          </button>
          
          <button 
            className="lightbox-nav-btn prev" 
            onClick={() => setLightboxIndex((prev) => (prev - 1 + REVIEWS_DATA.length) % REVIEWS_DATA.length)}
            aria-label="Попереднє фото" 
            style={{ position: 'absolute', left: '30px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#fff', fontSize: '2.5rem', cursor: 'pointer', opacity: 0.7, zIndex: 410 }}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          
          <div className="lightbox-content" style={{ maxWidth: '90vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <img src={REVIEWS_DATA[lightboxIndex].img} alt="Перегляд відгуку" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '4px', objectFit: 'contain', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }} />
            <div style={{ color: '#fff', marginTop: '20px', textAlign: 'center', maxWidth: '600px', fontSize: '0.95rem', lineHeight: 1.5, fontFamily: 'var(--font-heading)' }}>
              <strong>{REVIEWS_DATA[lightboxIndex].author}</strong><br />{REVIEWS_DATA[lightboxIndex].quote}
            </div>
          </div>
          
          <button 
            className="lightbox-nav-btn next" 
            onClick={() => setLightboxIndex((prev) => (prev + 1) % REVIEWS_DATA.length)}
            aria-label="Наступне фото" 
            style={{ position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#fff', fontSize: '2.5rem', cursor: 'pointer', opacity: 0.7, zIndex: 410 }}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* --- AUTHENTICATION MODAL --- */}
      {authModalOpen && (
        <div className="modal-overlay active" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setAuthModalOpen(false); }} style={{ zIndex: 500 }}>
          <div className="auth-modal-card">
            <button className="modal-close-btn" onClick={() => setAuthModalOpen(false)} aria-label="Закрити">
              <i className="fa-solid fa-xmark"></i>
            </button>
            
            {/* Modal Tabs */}
            <div className="auth-tabs">
              <button 
                className={`auth-tab-btn ${authTab === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthTab('login'); setAuthError(''); setAuthSuccess(''); }}
              >
                Увійти
              </button>
              <button 
                className={`auth-tab-btn ${authTab === 'register' ? 'active' : ''}`}
                onClick={() => { setAuthTab('register'); setAuthError(''); setAuthSuccess(''); }}
              >
                Реєстрація
              </button>
            </div>
            
            <form onSubmit={handleAuthSubmit}>
              {authError && (
                <div className="auth-alert auth-alert-error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{authError}</span>
                </div>
              )}
              
              {authSuccess && (
                <div className="auth-alert auth-alert-success">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>{authSuccess}</span>
                </div>
              )}
              
              <div className="auth-form-group">
                <label className="auth-label">Електронна пошта</label>
                <input 
                  type="email" 
                  required 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="auth-input" 
                  placeholder="example@krona.com" 
                />
              </div>
              
              <div className="auth-form-group">
                <label className="auth-label">Пароль</label>
                <input 
                  type="password" 
                  required 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="auth-input" 
                  placeholder="••••••••" 
                />
              </div>
              
              {authTab === 'register' && (
                <div className="auth-form-group">
                  <label className="auth-label">Підтвердження паролю</label>
                  <input 
                    type="password" 
                    required 
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    className="auth-input" 
                    placeholder="••••••••" 
                  />
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={authLoading}
                className="btn btn-primary auth-submit-btn" 
              >
                {authLoading ? 'Завантаження...' : authTab === 'login' ? 'Увійти' : 'Зареєструватися'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <i className="fa-solid fa-circle-check" style={{ color: 'var(--color-accent)' }}></i>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>Завантаження...</div>}>
      <MainShop />
    </Suspense>
  );
}
