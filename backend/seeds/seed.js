import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Location from '../models/Location.js';
import Partner from '../models/Partner.js';
import DailyMeal from '../models/DailyMeal.js';

const IMAGE_BASE = 'https://images.unsplash.com/photo-';

const products = [
  {
    name: 'Crispy Chicken Burger',
    description: 'Crispy chicken fillet, fresh lettuce, tomato and our signature creamy sauce in a toasted brioche bun.',
    price: 5500,
    originalPrice: 6500,
    image: `${IMAGE_BASE}1568901346375-23c9450c58cd?w=800`,
    category: 'Burgers',
    ingredients: ['Chicken fillet', 'Lettuce', 'Tomato', 'Brioche bun', 'Signature sauce'],
    allergens: ['Gluten', 'Eggs', 'Milk'],
    options: [
      { name: 'Size', required: true, choices: [{ label: 'Regular', price: 0 }, { label: 'Large', price: 1500 }] },
      { name: 'Sauce', required: false, choices: [{ label: 'BBQ', price: 0 }, { label: 'Spicy', price: 0 }, { label: 'Garlic', price: 0 }] },
    ],
    tags: ['burger', 'popular', 'spicy'],
    rating: 4.8,
    reviews: 124,
    available: true,
  },
  {
    name: 'Family Feast Combo',
    description: 'Feed the whole family with 8 crispy chicken pieces, 4 large fries, coleslaw and 4 soft drinks.',
    price: 18000,
    originalPrice: 21000,
    image: `${IMAGE_BASE}1562967914-608f82629710?w=800`,
    category: 'Combos',
    ingredients: ['8 chicken pieces', '4 large fries', 'Coleslaw', '4 soft drinks'],
    allergens: ['Gluten'],
    tags: ['combo', 'family', 'deal'],
    rating: 4.9,
    reviews: 89,
    available: true,
    isDeal: true,
  },
  {
    name: 'French Fries',
    description: 'Golden crispy fries, lightly salted and served with your choice of dipping sauce.',
    price: 2500,
    image: `${IMAGE_BASE}1541592106381-b31e9677c0e5?w=800`,
    category: 'Sides',
    ingredients: ['Potatoes', 'Salt', 'Vegetable oil'],
    allergens: [],
    tags: ['fries', 'sides', 'vegetarian'],
    rating: 4.5,
    reviews: 203,
    available: true,
    vegetarian: true,
  },
  {
    name: 'Soft Drink',
    description: 'Chilled carbonated soft drink of your choice. Perfect to complete any meal.',
    price: 1500,
    image: `${IMAGE_BASE}1622483767028-3f66f32aef97?w=800`,
    category: 'Drinks',
    ingredients: [],
    allergens: [],
    tags: ['drink', 'cold'],
    rating: 4.3,
    reviews: 156,
    available: true,
    vegetarian: true,
    options: [
      { name: 'Flavour', required: true, choices: [{ label: 'Cola', price: 0 }, { label: 'Fanta Orange', price: 0 }, { label: 'Sprite', price: 0 }] },
    ],
  },
  {
    name: 'Pepperoni Pizza',
    description: 'Classic pepperoni pizza with melted mozzarella on a hand-tossed crust and rich tomato base.',
    price: 8000,
    originalPrice: 9500,
    image: `${IMAGE_BASE}1593560708920-61dd98c46a4e?w=800`,
    category: 'Pizza',
    ingredients: ['Dough', 'Mozzarella', 'Pepperoni', 'Tomato sauce', 'Oregano'],
    allergens: ['Gluten', 'Milk'],
    tags: ['pizza', 'popular'],
    rating: 4.7,
    reviews: 145,
    available: true,
    options: [
      { name: 'Size', required: true, choices: [{ label: 'Medium', price: 0 }, { label: 'Large', price: 2000 }, { label: 'Family', price: 4000 }] },
    ],
  },
  {
    name: 'Chicken Wrap',
    description: 'Grilled chicken, crisp salad and tangy dressing wrapped in a soft tortilla.',
    price: 4500,
    image: `${IMAGE_BASE}1626074353765-517a681e40be?w=800`,
    category: 'Wraps',
    ingredients: ['Chicken', 'Tortilla', 'Lettuce', 'Dressing'],
    allergens: ['Gluten'],
    tags: ['wrap', 'chicken'],
    rating: 4.6,
    reviews: 78,
    available: true,
  },
  {
    name: 'Chocolate Brownie',
    description: 'Rich, fudgy chocolate brownie served warm with a scoop of vanilla ice cream.',
    price: 3000,
    image: `${IMAGE_BASE}1606313564200-e75d5e30476c?w=800`,
    category: 'Desserts',
    ingredients: ['Chocolate', 'Flour', 'Eggs', 'Butter', 'Vanilla ice cream'],
    allergens: ['Gluten', 'Eggs', 'Milk'],
    tags: ['dessert', 'sweet'],
    rating: 4.7,
    reviews: 67,
    available: true,
    vegetarian: true,
  },
  {
    name: 'Grilled Chicken Thighs',
    description: 'Two juicy grilled chicken thighs marinated in our house blend of African spices.',
    price: 6000,
    image: `${IMAGE_BASE}1604503468506-a8da13d82791?w=800`,
    category: 'Chicken',
    ingredients: ['Chicken thighs', 'House spices', 'Garlic', 'Lemon'],
    allergens: [],
    tags: ['chicken', 'grilled', 'popular'],
    rating: 4.8,
    reviews: 92,
    available: true,
    spicy: true,
  },
  {
    name: 'Chicken Popcorn',
    description: 'Bite-sized crispy chicken pieces, perfect for sharing or as a snack.',
    price: 3500,
    image: `${IMAGE_BASE}1604908176997-125f25cc6f3d?w=800`,
    category: 'Chicken',
    ingredients: ['Chicken breast', 'Spiced coating'],
    allergens: ['Gluten'],
    tags: ['chicken', 'snack', 'sharing'],
    rating: 4.6,
    reviews: 118,
    available: true,
  },
  {
    name: 'Cheese Sticks',
    description: 'Mozzarella cheese sticks with a golden crispy coating, served with marinara dip.',
    price: 2800,
    image: `${IMAGE_BASE}1626082927389-6cd097cdc6ec?w=800`,
    category: 'Sides',
    ingredients: ['Mozzarella', 'Breadcrumbs', 'Marinara dip'],
    allergens: ['Gluten', 'Milk'],
    tags: ['cheese', 'sides', 'snack'],
    rating: 4.4,
    reviews: 54,
    available: true,
    vegetarian: true,
  },
  {
    name: 'Veggie Burger',
    description: 'Plant-based patty with fresh vegetables and vegan sauce in a soft bun.',
    price: 5000,
    image: `${IMAGE_BASE}1550547660-d9450f859349?w=800`,
    category: 'Burgers',
    ingredients: ['Veggie patty', 'Lettuce', 'Tomato', 'Vegan sauce', 'Bun'],
    allergens: ['Gluten'],
    tags: ['burger', 'veggie', 'vegetarian'],
    rating: 4.3,
    reviews: 41,
    available: true,
    vegetarian: true,
  },
  {
    name: 'BBQ Chicken Pizza',
    description: 'Smoky BBQ chicken pizza topped with red onions and a sweet-and-savoury BBQ glaze.',
    price: 8500,
    image: `${IMAGE_BASE}1594007654729-407eedc4be65?w=800`,
    category: 'Pizza',
    ingredients: ['Dough', 'Chicken', 'Mozzarella', 'BBQ sauce', 'Red onion'],
    allergens: ['Gluten', 'Milk'],
    tags: ['pizza', 'bbq', 'chicken'],
    rating: 4.5,
    reviews: 36,
    available: true,
  },
  {
    name: 'Mama Breakfast Combo',
    description: 'Eggs, sausages, toast and a hot drink. The perfect way to start your day.',
    price: 7000,
    originalPrice: 8000,
    image: `${IMAGE_BASE}1533089860892-a7c6f0a88666?w=800`,
    category: 'Combos',
    ingredients: ['Eggs', 'Sausages', 'Toast', 'Coffee or tea'],
    allergens: ['Gluten', 'Eggs', 'Milk'],
    tags: ['breakfast', 'combo'],
    rating: 4.6,
    reviews: 58,
    available: true,
  },
  {
    name: 'Fruit Smoothie',
    description: 'Refreshing blend of seasonal tropical fruits, perfect on a warm day.',
    price: 3500,
    image: `${IMAGE_BASE}1505252585461-04db1eb84625?w=800`,
    category: 'Drinks',
    ingredients: ['Seasonal fruits', 'Yogurt', 'Honey'],
    allergens: ['Milk'],
    tags: ['drink', 'smoothie', 'healthy'],
    rating: 4.8,
    reviews: 47,
    available: true,
    vegetarian: true,
    options: [
      { name: 'Fruit', required: true, choices: [{ label: 'Mango', price: 0 }, { label: 'Mixed Berry', price: 500 }, { label: 'Pineapple', price: 0 }] },
    ],
  },
  {
    name: 'Hot Chicken Wings (6)',
    description: 'Six spicy buffalo wings tossed in our signature hot sauce with ranch dip.',
    price: 4800,
    image: `${IMAGE_BASE}1567620832903-9fc6debc209f?w=800`,
    category: 'Chicken',
    ingredients: ['Chicken wings', 'Hot sauce', 'Ranch dip'],
    allergens: [],
    tags: ['wings', 'spicy', 'sharing'],
    rating: 4.7,
    reviews: 88,
    available: true,
    spicy: true,
  },
  {
    name: 'Zinger Beef Burger',
    description: 'Juicy flame-grilled beef patty, melted cheese, pickles and special sauce.',
    price: 6500,
    image: `${IMAGE_BASE}1606755962773-d324e0a13086?w=800`,
    category: 'Burgers',
    ingredients: ['Beef patty', 'Cheese', 'Pickles', 'Special sauce', 'Bun'],
    allergens: ['Gluten', 'Milk'],
    tags: ['burger', 'beef'],
    rating: 4.8,
    reviews: 96,
    available: true,
    options: [
      { name: 'Size', required: true, choices: [{ label: 'Regular', price: 0 }, { label: 'Large', price: 1500 }] },
    ],
  },
  {
    name: 'Loaded Fries',
    description: 'Golden fries topped with cheese sauce, seasoned chicken and spring onions.',
    price: 5000,
    image: `${IMAGE_BASE}1585109649139-366815a0d713?w=800`,
    category: 'Sides',
    ingredients: ['Fries', 'Cheese sauce', 'Chicken', 'Spring onion'],
    allergens: ['Gluten', 'Milk'],
    tags: ['fries', 'loaded', 'sharing'],
    rating: 4.6,
    reviews: 63,
    available: true,
  },
  {
    name: 'Cheesecake Slice',
    description: 'Creamy vanilla cheesecake on a buttery biscuit base with berry compote.',
    price: 3200,
    image: `${IMAGE_BASE}1565958011703-44f9829ba187?w=800`,
    category: 'Desserts',
    ingredients: ['Cream cheese', 'Biscuit', 'Berry compote'],
    allergens: ['Gluten', 'Eggs', 'Milk'],
    tags: ['dessert', 'cheesecake'],
    rating: 4.7,
    reviews: 34,
    available: true,
    vegetarian: true,
  },
  {
    name: 'Weekend Grill Deal',
    description: 'Available Friday to Sunday. A full grill feast of chicken, ribs, fries and drinks.',
    price: 22000,
    originalPrice: 27000,
    image: `${IMAGE_BASE}1625943553852-781c6dd46faa?w=800`,
    category: 'Deals',
    ingredients: ['Chicken', 'Ribs', 'Fries', 'Drinks', 'Coleslaw'],
    allergens: ['Gluten'],
    tags: ['deal', 'weekend', 'grill', 'family'],
    rating: 4.9,
    reviews: 72,
    available: true,
    isDeal: true,
  },
  {
    name: 'Chicken & Chips Box',
    description: 'A generous box of crispy chicken pieces and golden chips — a crowd favourite.',
    price: 7500,
    image: `${IMAGE_BASE}1598515214211-89d3c73ae83b?w=800`,
    category: 'Combos',
    ingredients: ['Chicken pieces', 'Chips'],
    allergens: ['Gluten'],
    tags: ['combo', 'chicken', 'chips'],
    rating: 4.5,
    reviews: 51,
    available: true,
  },
];

const categories = [
  { name: 'Chicken', description: 'Crispy, grilled and flame-fried favourites.', sortOrder: 1 },
  { name: 'Burgers', description: 'Juicy burgers made fresh to order.', sortOrder: 2 },
  { name: 'Pizza', description: 'Hand-tossed pizzas with rich toppings.', sortOrder: 3 },
  { name: 'Wraps', description: 'Fresh wraps loaded with flavour.', sortOrder: 4 },
  { name: 'Sides', description: 'Perfect sides and sharing plates.', sortOrder: 5 },
  { name: 'Drinks', description: 'Cold drinks and refreshing smoothies.', sortOrder: 6 },
  { name: 'Desserts', description: 'Sweet treats to end your meal.', sortOrder: 7 },
  { name: 'Combos', description: 'Best-value meal combinations.', sortOrder: 8 },
  { name: 'Deals', description: 'Limited-time offers and promotions.', sortOrder: 9 },
];

const locations = [
  {
    name: 'Rebero branch (HQ)',
    address: 'KK 30 Ave, Kicukiro, Kigali',
    phone: '+250 795 760 000',
    openingHours: '08:00 - 22:00',
    latitude: -1.9441,
    longitude: 30.0619,
    deliveryAvailable: true,
    pickupAvailable: true,
  },
  {
    name: 'Kimironko Branch',
    address: 'KG 10 Ave, Kimironko, Kigali',
    phone: '+250 795 760 000',
    openingHours: '09:00 - 21:00',
    latitude: -1.9364,
    longitude: 30.1287,
    deliveryAvailable: true,
    pickupAvailable: true,
  },
  {
    name: 'Kicukiro Branch',
    address: 'KK 15 Rd, Kicukiro, Kigali',
    phone: '+250 795 760 000',
    openingHours: '08:30 - 22:00',
    latitude: -1.9809,
    longitude: 30.1161,
    deliveryAvailable: true,
    pickupAvailable: true,
  },
];

const partners = [
  {
    name: 'ByKenDesigns',
    logo: `${IMAGE_BASE}1511795409834-ef04a5c8d44e?w=400`,
    tagline: 'The tech company behind this platform',
    website: '#',
    sortOrder: 1,
    active: true,
  },
  {
    name: 'NDAJE Green',
    logo: `${IMAGE_BASE}1447933601403-0244e00850c2?w=400`,
    tagline: 'eCommerce platform',
    website: 'https://ndaje.com/',
    sortOrder: 2,
    active: true,
  },
  {
    name: 'Vuba Vuba',
    logo: `${IMAGE_BASE}1500937386664-56d1dfef3854?w=400`,
    tagline: 'Food delivery partner',
    website: '#',
    sortOrder: 3,
    active: true,
  },
];

const seed = async () => {
  await mongoose.connect(config.mongoUri);
  console.log('Connected to MongoDB, seeding...');

  await Promise.all([
    Product.deleteMany(),
    Category.deleteMany(),
    Order.deleteMany(),
    Location.deleteMany(),
    Partner.deleteMany(),
    DailyMeal.deleteMany(),
  ]);

  const adminPassword = await bcrypt.hash('admin123', 10);
  await User.deleteMany();
  await User.create({
    name: 'Admin User',
    email: 'admin@flameandfork.rw',
    phone: '0788123456',
    password: adminPassword,
    role: 'admin',
  });
  await User.create({
    name: 'Demo Customer',
    email: 'customer@flameandfork.rw',
    phone: '0788987654',
    password: await bcrypt.hash('customer123', 10),
    role: 'customer',
  });

  await Category.insertMany(categories);
  await Product.insertMany(products);
  await Location.insertMany(locations);
  await Partner.insertMany(partners);

  const houseSpecial = await Product.findOne({ name: 'Zinger Beef Burger' });
  if (houseSpecial) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await DailyMeal.findOne({ date: today });
    if (!existing) {
      await DailyMeal.create({
        date: today,
        productId: houseSpecial._id,
        note: "Chef's pick of the day",
      });
    }
  }

  console.log('Seed complete!');
  console.log('Admin login: admin@flameandfork.rw / admin123');
  console.log('Customer login: customer@flameandfork.rw / customer123');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
