export const PRODUCTS = [
  {
    id: 1,
    name: "Диван \"Nordic Minimalist\"",
    category: "sofa",
    price: 32500,
    rating: 4.9,
    reviews: 24,
    image: "assets/images/sofa.png",
    badge: "Бестселер",
    description: "Витончений тримісний диван у скандинавському стилі. Ергономічне сидіння, міцний каркас з масиву ясеня та преміальна зносостійка тканина, що легко чиститься. Ідеальний центр вашої вітальні.",
    specs: {
      "Матеріал каркасу": "Масив ясеня",
      "Оббивка": "Шеніл преміум-класу",
      "Розміри (ШхВхГ)": "220 х 85 х 95 см",
      "Гарантія": "60 місяців"
    },
    colors: ["#7A7A75", "#3E4A3D", "#B59870"],
    colorImages: {
      "#7A7A75": "assets/images/sofa.png",
      "#3E4A3D": "assets/images/sofa_green.png",
      "#B59870": "assets/images/sofa_beige.png"
    }
  },
  {
    id: 2,
    name: "Стілець \"Oak Silhouette\"",
    category: "chair",
    price: 4800,
    rating: 4.8,
    reviews: 18,
    image: "assets/images/chair.png",
    badge: "Новинка",
    description: "Дизайнерський обідній стілець, виготовлений повністю з натурального дуба. Вигнута спинка забезпечує бездоганну підтримку постави, а витончені лінії підкреслюють сучасний стиль інтер'єру.",
    specs: {
      "Матеріал": "100% масив дуба",
      "Покриття": "Натуральна олія-віск",
      "Розміри (ШхВхГ)": "48 х 82 х 50 см",
      "Гарантія": "36 місяців"
    },
    colors: ["#C5A880", "#111111", "#F5F5F0"],
    colorImages: {
      "#C5A880": "assets/images/chair.png",
      "#111111": "assets/images/chair_black.png",
      "#F5F5F0": "assets/images/chair_white.png"
    }
  },
  {
    id: 3,
    name: "Стіл \"Hygge Oak\"",
    category: "table",
    price: 18900,
    rating: 4.7,
    reviews: 14,
    image: "assets/images/table.png",
    badge: null,
    description: "Мінімалістичний обідній стіл з текстурного дуба. Надійна стійка конструкція та велика стільниця з вираженим природним малюнком дерева. Збирає навколо всю родину для затишних вечорів.",
    specs: {
      "Матеріал стільниці": "Масив дуба",
      "Ніжки": "Метал з порошковим покриттям",
      "Розміри (ШхВхГ)": "180 х 75 х 90 см",
      "Гарантія": "60 місяців"
    },
    colors: ["#C5A880", "#111111"],
    colorImages: {
      "#C5A880": "assets/images/table.png",
      "#111111": "assets/images/table_black.png"
    }
  },
  {
    id: 4,
    name: "Ліжко \"Beige Comfort\"",
    category: "bed",
    price: 26400,
    rating: 4.9,
    reviews: 31,
    image: "assets/images/bed.png",
    badge: null,
    description: "Преміальне двоспальне ліжко з м'яким узголів'ям. Оббите приємною на дотик натуральною лляною тканиною теплого бежевого кольору. Посилена ортопедична основа з буковими ламелями.",
    specs: {
      "Основа ліжка": "Металевий каркас, букові ламелі",
      "Оббивка": "Натуральний льон",
      "Спальне місце": "180 х 200 см",
      "Гарантія": "60 місяців"
    },
    colors: ["#F5F5F0", "#7A7A75", "#3E4A3D"],
    colorImages: {
      "#F5F5F0": "assets/images/bed.png",
      "#7A7A75": "assets/images/bed_gray.png",
      "#3E4A3D": "assets/images/bed_green.png"
    }
  },
  {
    id: 5,
    name: "Лампа \"Linear Shadow\"",
    category: "lamp",
    price: 3200,
    rating: 4.6,
    reviews: 9,
    image: "assets/images/lamp.png",
    badge: null,
    description: "Стильний підлоговий торшер у стилі хай-тек. Тонкий вишуканий металевий профіль та м'яке розсіяне світло створюють ідеальну атмосферу для відпочинку або читання книг у вечірній час.",
    specs: {
      "Матеріал": "Анодований алюміній, сталь",
      "Тип джерела": "Вбудований LED (тепле світло)",
      "Висота": "160 см",
      "Гарантія": "24 місяці"
    },
    colors: ["#111111", "#C5A880"],
    colorImages: {
      "#111111": "assets/images/lamp.png",
      "#C5A880": "assets/images/lamp_wood.png"
    }
  },
  {
    id: 6,
    name: "Комод \"Walnut Horizon\"",
    category: "cabinet",
    price: 15600,
    rating: 4.8,
    reviews: 16,
    image: "assets/images/cabinet.png",
    badge: null,
    description: "Сучасний функціональний комод з благородного волоського горіха. Чотири місткі шухляди з плавними доводчиками прихованого монтажу. Тонкі стійкі ніжки з чорного металу.",
    specs: {
      "Корпус та фасади": "МДФ, шпон горіха",
      "Ніжки": "Сталь чорного кольору",
      "Розміри (ШхВхГ)": "120 х 80 х 45 см",
      "Гарантія": "48 місяців"
    },
    colors: ["#8B5A2B", "#111111"],
    colorImages: {
      "#8B5A2B": "assets/images/cabinet.png",
      "#111111": "assets/images/cabinet_black.png"
    }
  },
  {
    id: 7,
    name: "Крісло \"Nordic Lounge\"",
    category: "chair",
    price: 12800,
    rating: 4.8,
    reviews: 14,
    image: "assets/images/armchair.png",
    badge: "Популярне",
    description: "М'яке ергономічне крісло для відпочинку з глибокою посадкою. Оббивка з фактурного шенілу або затишного букле. Стійкі ніжки з масиву ясеня та м'які підлокітники для максимального затишку.",
    specs: {
      "Оббивка": "Шеніл / Букле преміум-класу",
      "Каркас": "Масив ясеня",
      "Розміри (ШхВхГ)": "85 х 78 х 80 см",
      "Гарантія": "36 місяців"
    },
    colors: ["#7A7A75", "#3E4A3D", "#F5F5F0"],
    colorImages: {
      "#7A7A75": "assets/images/armchair.png",
      "#3E4A3D": "assets/images/armchair_green.png",
      "#F5F5F0": "assets/images/armchair_beige.png"
    }
  },
  {
    id: 8,
    name: "Журнальний стіл \"Minimalist Slice\"",
    category: "table",
    price: 7600,
    rating: 4.9,
    reviews: 22,
    image: "assets/images/coffee_table.png",
    badge: "Преміум",
    description: "Стильний журнальний стіл круглої форми. Стільниця з натурального шпону волоського горіха або дуба. Металеві геометричні ніжки з порошковим покриттям створюють витончений сучасний силует.",
    specs: {
      "Матеріал стільниці": "Шпон горіха / дуба",
      "Ніжки": "Сталь чорного кольору",
      "Розміри (Діаметр х В)": "80 х 42 см",
      "Гарантія": "24 місяці"
    },
    colors: ["#8B5A2B", "#C5A880", "#111111"],
    colorImages: {
      "#8B5A2B": "assets/images/coffee_table.png",
      "#C5A880": "assets/images/coffee_table_oak.png",
      "#111111": "assets/images/coffee_table_black.png"
    }
  },
  {
    id: 9,
    name: "Консоль-тумба \"Linear Slate\"",
    category: "cabinet",
    price: 19800,
    rating: 4.7,
    reviews: 11,
    image: "assets/images/console.png",
    badge: null,
    description: "Універсальна низька консоль під телевізор або для передпокою. Три місткі секції з системою відкривання push-to-open. Вишукана текстура дерева або глибокі матові фарби на вибір.",
    specs: {
      "Матеріал": "МДФ, шпон горіха / емаль",
      "Ніжки": "Чорний матовий метал",
      "Розміри (ШхВхГ)": "160 х 50 х 40 см",
      "Гарантія": "48 місяців"
    },
    colors: ["#8B5A2B", "#3E4A3D", "#111111"],
    colorImages: {
      "#8B5A2B": "assets/images/console.png",
      "#3E4A3D": "assets/images/console_green.png",
      "#111111": "assets/images/console_black.png"
    }
  },
  {
    id: 10,
    name: "Диван \"Modulo Lounge\"",
    category: "sofa",
    price: 43200,
    rating: 4.9,
    reviews: 17,
    image: "assets/images/sofa_modulo.png",
    badge: "Новинка",
    description: "Модульний кутовий диван з низьким профілем. Завдяки модульній системі ви можете легко конфігурувати форму дивана під геометрію вашої кімнати. Сучасна оббивка букле.",
    specs: {
      "Тип": "Модульний диван",
      "Оббивка": "Фактурне букле",
      "Наповнення": "Високоеластичний пінополіуретан",
      "Гарантія": "60 місяців"
    },
    colors: ["#F5F5F0", "#7A7A75"],
    colorImages: {
      "#F5F5F0": "assets/images/sofa_modulo.png",
      "#7A7A75": "assets/images/sofa_modulo.png"
    }
  },
  {
    id: 11,
    name: "Стілець \"Minimalist Wire\"",
    category: "chair",
    price: 3600,
    rating: 4.7,
    reviews: 12,
    image: "assets/images/chair_wire.png",
    badge: null,
    description: "Легкий та міцний стілець з металевим каркасом. Анатомічне сидіння з міцного формованого пластику та тонкі металеві ніжки. Ідеально підходить для сучасних кухонь та обідніх зон.",
    specs: {
      "Каркас": "Сталевий дріт",
      "Сидіння": "Зносостійкий поліпропілен",
      "Розміри (ШхВ)": "45 х 80 см",
      "Гарантія": "24 місяці"
    },
    colors: ["#111111", "#F5F5F0"],
    colorImages: {
      "#111111": "assets/images/chair_wire.png",
      "#F5F5F0": "assets/images/chair_wire.png"
    }
  },
  {
    id: 12,
    name: "Стіл \"Sleek Concrete\"",
    category: "table",
    price: 21500,
    rating: 4.8,
    reviews: 9,
    image: "assets/images/table_concrete.png",
    badge: "Лофт",
    description: "Ексклюзивний обідній стіл у стилі лофт. Стільниця та масивні ніжки виготовлені з високоміцного архітектурного бетону з водовідштовхувальним захисним покриттям.",
    specs: {
      "Матеріал": "Архітектурний бетон",
      "Покриття": "Гідрофобний захисний лак",
      "Розміри (ШхВхГ)": "160 х 75 х 80 см",
      "Гарантія": "36 місяців"
    },
    colors: ["#7A7A75"],
    colorImages: {
      "#7A7A75": "assets/images/table_concrete.png"
    }
  },
  {
    id: 13,
    name: "Ліжко \"Zen Platform\"",
    category: "bed",
    price: 29800,
    rating: 5.0,
    reviews: 8,
    image: "assets/images/bed_zen.png",
    badge: "Еко",
    description: "Мінімалістичне низьке ліжко у східному стилі. Повністю дерев'яна конструкція з масиву світлого дуба без зайвих деталей. Створює відчуття простору та чистоти в спальні.",
    specs: {
      "Матеріал": "Масив світлого дуба",
      "Покриття": "Натуральний віск",
      "Спальне місце": "180 х 200 см",
      "Гарантія": "60 місяців"
    },
    colors: ["#C5A880"],
    colorImages: {
      "#C5A880": "assets/images/bed_zen.png"
    }
  },
  {
    id: 14,
    name: "Приліжкова тумба \"Nordic Cuboid\"",
    category: "cabinet",
    price: 5400,
    rating: 4.8,
    reviews: 15,
    image: "assets/images/nightstand.png",
    badge: null,
    description: "Компактна підвісна тумбочка з одним висувним ящиком. Завдяки прихованому кріпленню створює ефект левітації в просторі біля ліжка.",
    specs: {
      "Матеріал": "МДФ, натуральний шпон ясеня",
      "Фурнітура": "Blum з плавним закриванням",
      "Розміри (ШхВхГ)": "45 х 20 х 35 см",
      "Гарантія": "36 місяців"
    },
    colors: ["#C5A880", "#111111"],
    colorImages: {
      "#C5A880": "assets/images/nightstand.png",
      "#111111": "assets/images/nightstand.png"
    }
  },
  {
    id: 15,
    name: "Стелаж \"Ladder Frame\"",
    category: "cabinet",
    price: 9200,
    rating: 4.6,
    reviews: 19,
    image: "assets/images/shelf.png",
    badge: "Органайзер",
    description: "Відкритий стелаж у стилі драбини для книг, квітів та предметів декору. Міцні металеві стійки та дерев'яні полиці різної глибини.",
    specs: {
      "Матеріал полиць": "Шпонований дуб",
      "Стійки": "Сталевий профіль, порошкове фарбування",
      "Розміри (ШхВхГ)": "80 х 180 х 40 см",
      "Гарантія": "24 місяці"
    },
    colors: ["#111111", "#C5A880"],
    colorImages: {
      "#111111": "assets/images/shelf.png",
      "#C5A880": "assets/images/shelf.png"
    }
  }
];
