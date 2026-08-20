import {
  AirVent,
  Bath,
  Dumbbell,
  Gamepad2,
  HeartPulse,
  Home,
  Laptop2,
  Shirt,
  Smartphone,
  Sparkles,
  Watch,
  Zap
} from 'lucide-react';
import storeLogo from '../../images/logo.jpg';

export const storeName = 'Elistin';
export const storeLogoSrc = storeLogo;

export const customerAccounts = [
  { name: 'Ali Khan', email: 'customer@demo.com', password: '123456', role: 'Customer' },
  { name: 'Sara Retail', email: 'seller@demo.com', password: '123456', role: 'Seller' }
];

export const topLinks = ['Download App', `Sell on ${storeName}`, 'Help', 'Track Order'];

export const mainNav = [
  {
    label: 'Electronics',
    items: ['Mobiles', 'Laptops', 'TV & Audio', 'Cameras', 'Gaming']
  },
  {
    label: 'Fashion',
    items: ['Men', 'Women', 'Kids', 'Shoes', 'Accessories']
  },
  {
    label: 'Home & Living',
    items: ['Furniture', 'Kitchen', 'Decor', 'Lighting', 'Storage']
  },
  {
    label: 'Health & Beauty',
    items: ['Skin Care', 'Hair Care', 'Fitness', 'Fragrance', 'Personal Care']
  },
  {
    label: 'Sports',
    items: ['Gym', 'Outdoors', 'Cycling', 'Football', 'Running']
  }
];

export const heroSlides = [
  {
    id: 1,
    title: 'Big Summer Electronics Sale',
    description: 'Up to 40% off on phones, tablets and smart accessories.',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1400&q=80',
    cta: 'Shop Electronics',
    accent: 'From Rs 9,999'
  },
  {
    id: 2,
    title: 'Fashion That Feels Premium',
    description: 'Fresh arrivals for men, women and kids with easy returns.',
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=80',
    cta: 'Explore Fashion',
    accent: 'New season drop'
  },
  {
    id: 3,
    title: 'Home Deals You Cannot Miss',
    description: 'Modern home essentials with budget-friendly prices.',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=80',
    cta: 'See Home Deals',
    accent: 'Extra savings'
  }
];

export const promoBanners = [
  {
    title: 'Fast Delivery',
    subtitle: 'Receive in 2-3 days',
    image:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'Cash on Delivery',
    subtitle: 'Pay when it arrives',
    image:
      'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=900&q=80'
  }
];

export const categories = [
  { label: 'Shirts', icon: Shirt, image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=400&q=80' },
  { label: 'Mobiles', icon: Smartphone, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80' },
  { label: 'Fashion', icon: Shirt, image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=400&q=80' },
  { label: 'Home', icon: Home, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80' },
  { label: 'Beauty', icon: Sparkles, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80' },
  { label: 'Gaming', icon: Gamepad2, image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80' },
  { label: 'Fitness', icon: Dumbbell, image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80' },
  { label: 'Watches', icon: Watch, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=400&q=80' },
  { label: 'Appliances', icon: AirVent, image: 'https://images.unsplash.com/photo-1581579186989-6a6c9f1db2d0?auto=format&fit=crop&w=400&q=80' },
  { label: 'Health', icon: HeartPulse, image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=80' },
  { label: 'Audio', icon: Zap, image: 'https://images.unsplash.com/photo-1518441315998-5a0d2b2c9e3d?auto=format&fit=crop&w=400&q=80' },
  { label: 'Laptops', icon: Laptop2, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80' },
  { label: 'Decor', icon: Bath, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80' }
];

const makeProduct = (id, title, price, originalPrice, rating, badge, image, category) => ({
  id,
  title,
  price,
  originalPrice,
  rating,
  badge,
  image,
  category,
  sold: `${120 + id * 17}+ sold`
});

export const flashSaleProducts = [
  /* Demo catalog intentionally starts empty. */
/*
  makeProduct(1, 'Bluetooth Earbuds Pro Max', 3499, 5499, 4.8, '38% OFF', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=80', 'Electronics'),
  makeProduct(2, 'Minimal Smart Watch', 5999, 8999, 4.7, '33% OFF', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80', 'Electronics'),
  makeProduct(3, 'Cotton Oversized Tee', 1499, 2199, 4.6, '32% OFF', 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80', 'Fashion'),
  makeProduct(4, 'Home Desk Lamp', 2499, 3299, 4.5, '24% OFF', 'https://images.unsplash.com/photo-1517991104123-1d56a6e1a3af?auto=format&fit=crop&w=900&q=80', 'Home'),
  makeProduct(5, 'PS5 Game Controller', 13999, 16999, 4.9, '18% OFF', 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=900&q=80', 'Gaming'),
  makeProduct(6, 'Face Care Combo', 1799, 2499, 4.7, '28% OFF', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80', 'Beauty')
*/
];

export const productSections = [
  /* Demo catalog intentionally starts empty. */
/*
  {
    title: 'Featured Products',
    description: 'Customer favorites with strong ratings.',
    products: [
      makeProduct(7, 'Travel Backpack', 3999, 5599, 4.8, 'Best', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80', 'Accessories'),
      makeProduct(8, 'Android Smartphone', 28999, 34999, 4.7, 'Hot', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80', 'Electronics'),
      makeProduct(9, 'Leather Sneakers', 5499, 6999, 4.6, '12% OFF', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', 'Fashion'),
      makeProduct(10, 'Desk Organizer Set', 1299, 1699, 4.5, '23% OFF', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80', 'Home'),
      makeProduct(11, 'Wireless Speaker', 4499, 6499, 4.8, '31% OFF', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80', 'Audio')
    ]
  },
  {
    title: 'Best Sellers',
    description: 'Most ordered items this week.',
    products: [
      makeProduct(12, 'Running Shoes', 6999, 8999, 4.7, '22% OFF', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', 'Sports'),
      makeProduct(13, 'Fragrance Gift Box', 2499, 3499, 4.6, '28% OFF', 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80', 'Beauty'),
      makeProduct(14, 'Smart LED TV', 79999, 99999, 4.9, '20% OFF', 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=80', 'Electronics'),
      makeProduct(15, 'Office Chair', 11999, 14999, 4.5, '20% OFF', 'https://images.unsplash.com/photo-1505843490701-5f1c1f7fd0b7?auto=format&fit=crop&w=900&q=80', 'Home'),
      makeProduct(16, 'Skincare Starter Kit', 1599, 2299, 4.8, '30% OFF', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80', 'Beauty')
    ]
  },
  {
    title: 'New Arrivals',
    description: 'Fresh products added to the store.',
    products: [
      makeProduct(17, 'Digital Camera', 45999, 54999, 4.7, '16% OFF', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80', 'Electronics'),
      makeProduct(18, 'Kids Hoodie', 1799, 2399, 4.6, '25% OFF', 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80', 'Fashion'),
      makeProduct(19, 'Wall Art Set', 1999, 2899, 4.5, '31% OFF', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80', 'Home'),
      makeProduct(20, 'Fitness Mat', 2499, 3299, 4.7, '24% OFF', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80', 'Fitness'),
      makeProduct(21, 'Bluetooth Keyboard', 4299, 5599, 4.6, '23% OFF', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80', 'Electronics')
    ]
  }
*/
];

export const paymentMethods = ['JazzCash', 'Easypaisa', 'Visa', 'Mastercard', 'COD'];

export const footerSections = [
  {
    title: 'About',
    intro:
      'Shop the latest products with clean pricing, trusted delivery and mobile-friendly checkout.',
    links: ['About Us', 'Careers', 'Privacy Policy', 'Terms & Conditions']
  },
  {
    title: 'Customer Service',
    links: ['Contact Us', 'Returns', 'FAQs', 'Track Order']
  },
  {
    title: 'Payment Methods',
    links: ['JazzCash', 'Easypaisa', 'Visa', 'Mastercard', 'Cash on Delivery']
  },
  {
    title: 'Social & Newsletter',
    links: ['Facebook', 'Instagram', 'TikTok', 'Subscribe to updates']
  }
];
