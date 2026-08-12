// Comprehensive Mock Data for Multi-Vendor E-Commerce Admin Dashboard

export const initialCategories = [
  {
    id: 'cat-1',
    name: 'Electronics & Tech',
    slug: 'electronics',
    parent: null,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    productCount: 142,
    status: 'Active',
    subcategories: ['Audio & Headphones', 'Smartphones & Accessories', 'Laptops & Computers', 'Wearable Tech']
  },
  {
    id: 'cat-2',
    name: 'Fashion & Apparel',
    slug: 'fashion',
    parent: null,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80',
    productCount: 230,
    status: 'Active',
    subcategories: ["Men's Wear", "Women's Wear", 'Footwear', 'Watches & Jewelry']
  },
  {
    id: 'cat-3',
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    parent: null,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&q=80',
    productCount: 98,
    status: 'Active',
    subcategories: ['Furniture', 'Cookware', 'Home Decor', 'Smart Appliances']
  },
  {
    id: 'cat-4',
    name: 'Beauty & Wellness',
    slug: 'beauty-wellness',
    parent: null,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80',
    productCount: 76,
    status: 'Active',
    subcategories: ['Skincare', 'Haircare', 'Fitness Equipment', 'Supplements']
  },
  {
    id: 'cat-5',
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    parent: null,
    image: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=400&q=80',
    productCount: 64,
    status: 'Active',
    subcategories: ['Cycling', 'Camping & Hiking', 'Gym Accessories', 'Yoga & Pilates']
  }
];

export const initialSellers = [
  {
    id: 'v-101',
    sellerName: 'Marcus Vance',
    storeName: 'Apexium Tech Store',
    email: 'marcus@apexiumtech.com',
    phone: '+1 (555) 234-5678',
    productsCount: 48,
    ordersCount: 1240,
    revenue: 145800.00,
    commissionRate: 10, // 10%
    verificationStatus: 'Verified',
    ratings: 4.9,
    status: 'Active',
    joinedDate: '2025-01-15',
    payoutMethod: 'Bank Transfer (CHASE ****8821)'
  },
  {
    id: 'v-102',
    sellerName: 'Elena Rostova',
    storeName: 'UrbanStyle Apparel',
    email: 'elena@urbanstyle.io',
    phone: '+1 (555) 876-5432',
    productsCount: 85,
    ordersCount: 890,
    revenue: 92400.00,
    commissionRate: 12,
    verificationStatus: 'Verified',
    ratings: 4.7,
    status: 'Active',
    joinedDate: '2025-02-01',
    payoutMethod: 'Stripe Direct'
  },
  {
    id: 'v-103',
    sellerName: 'Kaito Tanaka',
    storeName: 'Luxe Living Interiors',
    email: 'kaito@luxeliving.jp',
    phone: '+1 (555) 345-6789',
    productsCount: 32,
    ordersCount: 310,
    revenue: 68500.00,
    commissionRate: 15,
    verificationStatus: 'Verified',
    ratings: 4.8,
    status: 'Active',
    joinedDate: '2025-03-10',
    payoutMethod: 'PayPal Pro'
  },
  {
    id: 'v-104',
    sellerName: 'Sarah Jenkins',
    storeName: 'GreenFit Activewear',
    email: 'sarah@greenfit.com',
    phone: '+1 (555) 987-1234',
    productsCount: 19,
    ordersCount: 145,
    revenue: 18200.00,
    commissionRate: 10,
    verificationStatus: 'Pending',
    ratings: 4.5,
    status: 'Active',
    joinedDate: '2026-06-18',
    payoutMethod: 'Bank Transfer (BOA ****4119)'
  },
  {
    id: 'v-105',
    sellerName: 'David Miller',
    storeName: 'Gourmet Kitchenware',
    email: 'david@gourmetkitchen.com',
    phone: '+1 (555) 432-1098',
    productsCount: 26,
    ordersCount: 88,
    revenue: 12400.00,
    commissionRate: 12,
    verificationStatus: 'Suspended',
    ratings: 3.8,
    status: 'Suspended',
    joinedDate: '2025-11-04',
    payoutMethod: 'Payoneer'
  }
];

export const initialProducts = [
  {
    id: 'p-1',
    name: 'ApexStudio Noise-Canceling Wireless Headphones',
    sku: 'APX-HEAD-01',
    category: 'Electronics & Tech',
    subcategory: 'Audio & Headphones',
    seller: 'Apexium Tech Store',
    sellerId: 'v-101',
    price: 249.99,
    discount: 15,
    stock: 45,
    minStock: 10,
    status: 'Active',
    dateAdded: '2026-02-10',
    brand: 'Apexium',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    description: 'Premium active noise-canceling headphones with 40h battery life and spatial audio capability.',
    variants: [{ color: 'Space Black', stock: 25 }, { color: 'Silver Gray', stock: 20 }]
  },
  {
    id: 'p-2',
    name: 'UltraSlim OLED Smartwatch Series 5',
    sku: 'APX-WATCH-05',
    category: 'Electronics & Tech',
    subcategory: 'Wearable Tech',
    seller: 'Apexium Tech Store',
    sellerId: 'v-101',
    price: 199.50,
    discount: 10,
    stock: 8,
    minStock: 15,
    status: 'Active',
    dateAdded: '2026-03-01',
    brand: 'Apexium',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    description: 'Sleek ECG heart monitor smartwatch with always-on AMOLED touchscreen.',
    variants: [{ color: 'Midnight', stock: 5 }, { color: 'Rose Gold', stock: 3 }]
  },
  {
    id: 'p-3',
    name: 'Organic Cotton Oversized Hoodie',
    sku: 'URB-HOOD-99',
    category: 'Fashion & Apparel',
    subcategory: "Men's Wear",
    seller: 'UrbanStyle Apparel',
    sellerId: 'v-102',
    price: 69.99,
    discount: 0,
    stock: 120,
    minStock: 20,
    status: 'Active',
    dateAdded: '2026-01-20',
    brand: 'UrbanStyle',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80',
    description: '100% heavyweight organic cotton hoodie with plush fleece lining.',
    variants: [{ size: 'M', stock: 50 }, { size: 'L', stock: 40 }, { size: 'XL', stock: 30 }]
  },
  {
    id: 'p-4',
    name: 'Handcrafted Ceramic Espresso Set (4 Pcs)',
    sku: 'LUX-CER-04',
    category: 'Home & Kitchen',
    subcategory: 'Cookware',
    seller: 'Luxe Living Interiors',
    sellerId: 'v-103',
    price: 89.00,
    discount: 5,
    stock: 2,
    minStock: 10,
    status: 'Active',
    dateAdded: '2026-04-12',
    brand: 'LuxeLiving',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
    description: 'Artisanal stoneware espresso cups with bamboo saucers.',
    variants: [{ color: 'Terracotta', stock: 1 }, { color: 'Sage Green', stock: 1 }]
  },
  {
    id: 'p-5',
    name: 'Pro Yoga Mat with Alignment Lines',
    sku: 'GRN-YOGA-01',
    category: 'Sports & Outdoors',
    subcategory: 'Yoga & Pilates',
    seller: 'GreenFit Activewear',
    sellerId: 'v-104',
    price: 49.99,
    discount: 20,
    stock: 0,
    minStock: 15,
    status: 'Out of Stock',
    dateAdded: '2026-05-02',
    brand: 'GreenFit',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80',
    description: 'Non-slip eco-friendly rubber yoga mat with laser engraved positioning grid.',
    variants: [{ color: 'Plum Purple', stock: 0 }]
  },
  {
    id: 'p-6',
    name: 'Botanical Hydrating Facial Serum 50ml',
    sku: 'BEA-SERUM-50',
    category: 'Beauty & Wellness',
    subcategory: 'Skincare',
    seller: 'UrbanStyle Apparel',
    sellerId: 'v-102',
    price: 38.00,
    discount: 0,
    stock: 75,
    minStock: 10,
    status: 'Active',
    dateAdded: '2026-05-15',
    brand: 'Naturals',
    image: 'https://images.unsplash.com/photo-1608248597261-e4d9904944d1?w=600&q=80',
    description: 'Hyaluronic acid and rosehip serum for deep moisture locking.',
    variants: [{ size: '50ml', stock: 75 }]
  },
  {
    id: 'p-7',
    name: 'Ergonomic Mesh Office Chair Pro',
    sku: 'LUX-CHAIR-88',
    category: 'Home & Kitchen',
    subcategory: 'Furniture',
    seller: 'Luxe Living Interiors',
    sellerId: 'v-103',
    price: 320.00,
    discount: 10,
    stock: 14,
    minStock: 5,
    status: 'Active',
    dateAdded: '2026-03-22',
    brand: 'ErgoMax',
    image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=600&q=80',
    description: 'High-back mesh executive office chair with lumbar support and 3D armrests.',
    variants: [{ color: 'Slate Gray', stock: 14 }]
  },
  {
    id: 'p-8',
    name: 'Stainless Steel Damascus Chef Knife 8"',
    sku: 'GOUR-KNIFE-08',
    category: 'Home & Kitchen',
    subcategory: 'Cookware',
    seller: 'Gourmet Kitchenware',
    sellerId: 'v-105',
    price: 119.99,
    discount: 0,
    stock: 5,
    minStock: 8,
    status: 'Draft',
    dateAdded: '2026-06-01',
    brand: 'ChefCraft',
    image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&q=80',
    description: '67-layer Japanese Damascus steel blade with pakkawood handle.',
    variants: [{ size: '8 inch', stock: 5 }]
  }
];

export const initialOrders = [
  {
    id: 'ORD-98421',
    customerName: 'Aisha Malik',
    customerEmail: 'aisha.m@gmail.com',
    customerPhone: '+1 (555) 321-7890',
    products: [
      { id: 'p-1', name: 'ApexStudio Noise-Canceling Wireless Headphones', qty: 1, price: 212.49, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80' }
    ],
    sellerName: 'Apexium Tech Store',
    sellerId: 'v-101',
    totalAmount: 212.49,
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    orderDate: '2026-08-10',
    shippingAddress: '742 Evergreen Terrace, Springfield, OR 97477',
    paymentMethod: 'Credit Card (Visa ****4321)',
    deliveryCourier: 'FedEx Express (Tracking #FX-889021)',
    timeline: [
      { title: 'Order Placed', time: '2026-08-10 09:15 AM', done: true },
      { title: 'Payment Confirmed', time: '2026-08-10 09:16 AM', done: true },
      { title: 'Shipped via FedEx', time: '2026-08-10 02:30 PM', done: true },
      { title: 'Delivered to Customer', time: '2026-08-11 11:20 AM', done: true }
    ]
  },
  {
    id: 'ORD-98422',
    customerName: 'Jordan Reed',
    customerEmail: 'jordan.reed@outlook.com',
    customerPhone: '+1 (555) 654-9870',
    products: [
      { id: 'p-3', name: 'Organic Cotton Oversized Hoodie', qty: 2, price: 69.99, image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=200&q=80' },
      { id: 'p-6', name: 'Botanical Hydrating Facial Serum 50ml', qty: 1, price: 38.00, image: 'https://images.unsplash.com/photo-1608248597261-e4d9904944d1?w=200&q=80' }
    ],
    sellerName: 'UrbanStyle Apparel',
    sellerId: 'v-102',
    totalAmount: 177.98,
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
    orderDate: '2026-08-10',
    shippingAddress: '102 Ocean Drive, Apt 4B, Miami, FL 33139',
    paymentMethod: 'PayPal',
    deliveryCourier: 'DHL Express (Tracking #DHL-554109)',
    timeline: [
      { title: 'Order Placed', time: '2026-08-10 11:00 AM', done: true },
      { title: 'Payment Confirmed', time: '2026-08-10 11:02 AM', done: true },
      { title: 'Processing at Warehouse', time: '2026-08-10 04:00 PM', done: true },
      { title: 'Handed to Courier', time: '2026-08-11 08:30 AM', done: true }
    ]
  },
  {
    id: 'ORD-98423',
    customerName: 'Sophia Chen',
    customerEmail: 'sophia.c@techcorp.io',
    customerPhone: '+1 (555) 789-0123',
    products: [
      { id: 'p-7', name: 'Ergonomic Mesh Office Chair Pro', qty: 1, price: 288.00, image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=200&q=80' }
    ],
    sellerName: 'Luxe Living Interiors',
    sellerId: 'v-103',
    totalAmount: 288.00,
    paymentStatus: 'Paid',
    orderStatus: 'Processing',
    orderDate: '2026-08-09',
    shippingAddress: '450 Mission Street, Suite 1200, San Francisco, CA 94105',
    paymentMethod: 'Apple Pay',
    deliveryCourier: 'BlueDart Freight (Pending Dispatch)',
    timeline: [
      { title: 'Order Placed', time: '2026-08-09 03:45 PM', done: true },
      { title: 'Payment Confirmed', time: '2026-08-09 03:46 PM', done: true },
      { title: 'In Production / Packaging', time: '2026-08-10 09:00 AM', done: true },
      { title: 'Awaiting Courier Pick Up', time: 'Pending', done: false }
    ]
  },
  {
    id: 'ORD-98424',
    customerName: 'Liam O\'Connor',
    customerEmail: 'liam.oc@yahoo.com',
    customerPhone: '+1 (555) 456-7890',
    products: [
      { id: 'p-2', name: 'UltraSlim OLED Smartwatch Series 5', qty: 1, price: 179.55, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80' }
    ],
    sellerName: 'Apexium Tech Store',
    sellerId: 'v-101',
    totalAmount: 179.55,
    paymentStatus: 'Pending',
    orderStatus: 'Pending',
    orderDate: '2026-08-11',
    shippingAddress: '88 Michigan Ave, Chicago, IL 60611',
    paymentMethod: 'Bank Wire Transfer',
    deliveryCourier: 'Unassigned',
    timeline: [
      { title: 'Order Placed', time: '2026-08-11 07:12 AM', done: true },
      { title: 'Payment Verification', time: 'Pending Wire Receipt', done: false }
    ]
  },
  {
    id: 'ORD-98425',
    customerName: 'Emily Taylor',
    customerEmail: 'emily.t@gmail.com',
    customerPhone: '+1 (555) 890-1234',
    products: [
      { id: 'p-4', name: 'Handcrafted Ceramic Espresso Set (4 Pcs)', qty: 1, price: 84.55, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&q=80' }
    ],
    sellerName: 'Luxe Living Interiors',
    sellerId: 'v-103',
    totalAmount: 84.55,
    paymentStatus: 'Refunded',
    orderStatus: 'Returned',
    orderDate: '2026-08-05',
    shippingAddress: '12 West Street, Austin, TX 78701',
    paymentMethod: 'Credit Card (MasterCard ****9901)',
    deliveryCourier: 'FedEx Ground Return',
    timeline: [
      { title: 'Order Placed', time: '2026-08-05 02:00 PM', done: true },
      { title: 'Delivered', time: '2026-08-07 10:00 AM', done: true },
      { title: 'Return Requested (Chipped Ceramic)', time: '2026-08-08 01:15 PM', done: true },
      { title: 'Refund Completed', time: '2026-08-09 04:30 PM', done: true }
    ]
  }
];

export const initialReturns = [
  {
    id: 'RET-401',
    orderId: 'ORD-98425',
    customerName: 'Emily Taylor',
    customerEmail: 'emily.t@gmail.com',
    productName: 'Handcrafted Ceramic Espresso Set (4 Pcs)',
    sellerName: 'Luxe Living Interiors',
    reason: 'Damaged item / Chipped saucer upon unboxing',
    amount: 84.55,
    status: 'Refunded',
    date: '2026-08-08',
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&q=80']
  },
  {
    id: 'RET-402',
    orderId: 'ORD-97810',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus.v@test.com',
    productName: 'Organic Cotton Oversized Hoodie',
    sellerName: 'UrbanStyle Apparel',
    reason: 'Size too large (Ordered XL, need M)',
    amount: 69.99,
    status: 'Requested',
    date: '2026-08-10',
    images: []
  },
  {
    id: 'RET-403',
    orderId: 'ORD-96501',
    customerName: 'Carlos Rossi',
    customerEmail: 'carlos.r@gmail.com',
    productName: 'ApexStudio Wireless Headphones',
    sellerName: 'Apexium Tech Store',
    reason: 'Buyer remorse / Changed mind',
    amount: 212.49,
    status: 'Rejected',
    date: '2026-08-02',
    images: []
  }
];

export const initialCustomers = [
  {
    id: 'CUST-1001',
    name: 'Aisha Malik',
    email: 'aisha.m@gmail.com',
    phone: '+1 (555) 321-7890',
    totalOrders: 14,
    totalSpent: 3240.50,
    lastOrderDate: '2026-08-10',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    city: 'Springfield, OR',
    joinDate: '2025-01-10'
  },
  {
    id: 'CUST-1002',
    name: 'Jordan Reed',
    email: 'jordan.reed@outlook.com',
    phone: '+1 (555) 654-9870',
    totalOrders: 8,
    totalSpent: 1480.20,
    lastOrderDate: '2026-08-10',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    city: 'Miami, FL',
    joinDate: '2025-03-22'
  },
  {
    id: 'CUST-1003',
    name: 'Sophia Chen',
    email: 'sophia.c@techcorp.io',
    phone: '+1 (555) 789-0123',
    totalOrders: 21,
    totalSpent: 6890.00,
    lastOrderDate: '2026-08-09',
    status: 'VIP Customer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80',
    city: 'San Francisco, CA',
    joinDate: '2024-11-15'
  },
  {
    id: 'CUST-1004',
    name: 'Liam O\'Connor',
    email: 'liam.oc@yahoo.com',
    phone: '+1 (555) 456-7890',
    totalOrders: 2,
    totalSpent: 289.50,
    lastOrderDate: '2026-08-11',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    city: 'Chicago, IL',
    joinDate: '2026-07-01'
  },
  {
    id: 'CUST-1005',
    name: 'Emily Taylor',
    email: 'emily.t@gmail.com',
    phone: '+1 (555) 890-1234',
    totalOrders: 5,
    totalSpent: 620.00,
    lastOrderDate: '2026-08-05',
    status: 'Inactive',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    city: 'Austin, TX',
    joinDate: '2025-09-18'
  }
];

export const initialBanners = [
  {
    id: 'ban-1',
    title: 'Summer Tech & Gadgets Fest',
    description: 'Get up to 40% OFF on premium headphones & OLED smartwatches.',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    ctaText: 'Shop Electronics',
    ctaUrl: '/catalog?category=electronics',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    status: 'Active'
  },
  {
    id: 'ban-2',
    title: 'Urban Style Autumn Fashion Line',
    description: 'Exclusive organic hoodie drops & eco-conscious apparel.',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
    ctaText: 'Explore Collection',
    ctaUrl: '/catalog?category=fashion',
    startDate: '2026-08-10',
    endDate: '2026-09-15',
    status: 'Active'
  },
  {
    id: 'ban-3',
    title: 'Artisanal Home Decor Sale',
    description: 'Handcrafted ceramics, ergonomic office chairs & kitchen essentials.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
    ctaText: 'Discover Home',
    ctaUrl: '/catalog?category=home-kitchen',
    startDate: '2026-09-01',
    endDate: '2026-10-01',
    status: 'Inactive'
  }
];

export const initialAds = [
  {
    id: 'ad-101',
    name: 'Facebook / Instagram Carousel - Audio Sale',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    targetUrl: 'https://apexiums.com/promo/summer-audio',
    placement: 'Social Media Feed',
    budget: 2500.00,
    spent: 1840.00,
    impressions: 142000,
    clicks: 6850,
    ctr: '4.82%',
    startDate: '2026-08-01',
    endDate: '2026-08-20',
    status: 'Active'
  },
  {
    id: 'ad-102',
    name: 'Google Shopping Search Ad - Smartwatch Series 5',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    targetUrl: 'https://apexiums.com/product/APX-WATCH-05',
    placement: 'Google Search Top',
    budget: 4000.00,
    spent: 3950.00,
    impressions: 210000,
    clicks: 11200,
    ctr: '5.33%',
    startDate: '2026-07-15',
    endDate: '2026-08-15',
    status: 'Active'
  },
  {
    id: 'ad-103',
    name: 'TikTok Influencer Video Ad - Urban Hoodies',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&q=80',
    targetUrl: 'https://apexiums.com/promo/urban-drop',
    placement: 'TikTok Feed',
    budget: 1500.00,
    spent: 0.00,
    impressions: 0,
    clicks: 0,
    ctr: '0.00%',
    startDate: '2026-08-25',
    endDate: '2026-09-10',
    status: 'Scheduled'
  }
];

export const initialInvestors = [
  {
    id: 'inv-1',
    name: 'Horizon Venture Capital',
    contactPerson: 'David Sterling (Managing Partner)',
    email: 'd.sterling@horizonvc.com',
    investmentAmount: 500000.00,
    investmentDate: '2024-06-15',
    returnRate: 14.5, // %
    totalReturnsPaid: 72500.00,
    status: 'Active',
    equityShare: '12%',
    notes: 'Series A lead investor.'
  },
  {
    id: 'inv-2',
    name: 'Apex Syndicate Angels',
    contactPerson: 'Rachel Weiss',
    email: 'rachel@apexangels.net',
    investmentAmount: 250000.00,
    investmentDate: '2025-01-20',
    returnRate: 12.0,
    totalReturnsPaid: 30000.00,
    status: 'Active',
    equityShare: '5%',
    notes: 'Pre-Series A syndicate.'
  },
  {
    id: 'inv-3',
    name: 'Global Ecommerce Growth Fund',
    contactPerson: 'Kenji Sato',
    email: 'kenji@gegf.io',
    investmentAmount: 1000000.00,
    investmentDate: '2025-11-01',
    returnRate: 16.0,
    totalReturnsPaid: 160000.00,
    status: 'Active',
    equityShare: '18%',
    notes: 'Series B expansion funding.'
  },
  {
    id: 'inv-4',
    name: 'Nexus Tech Holdings',
    contactPerson: 'Laura Bennett',
    email: 'laura@nexus-holdings.com',
    investmentAmount: 150000.00,
    investmentDate: '2026-07-10',
    returnRate: 10.0,
    totalReturnsPaid: 0.00,
    status: 'Pending Approval',
    equityShare: '3%',
    notes: 'Proposed convertible note.'
  }
];

export const initialStaff = [
  {
    id: 'st-1',
    name: 'Alexander Wright',
    email: 'alex.wright@apexiums-admin.com',
    role: 'Super Admin',
    department: 'Executive Management',
    status: 'Active',
    joinedDate: '2024-01-01'
  },
  {
    id: 'st-2',
    name: 'Samantha Ray',
    email: 'samantha.ray@apexiums-admin.com',
    role: 'Admin',
    department: 'Marketplace Operations',
    status: 'Active',
    joinedDate: '2024-05-12'
  },
  {
    id: 'st-3',
    name: 'Carlos Mendez',
    email: 'carlos.m@apexiums-admin.com',
    role: 'Manager',
    department: 'Finance & Compliance',
    status: 'Active',
    joinedDate: '2025-02-18'
  },
  {
    id: 'st-4',
    name: 'Priya Patel',
    email: 'priya.p@apexiums-admin.com',
    role: 'Staff',
    department: 'Customer Support & Returns',
    status: 'Active',
    joinedDate: '2025-09-01'
  },
  {
    id: 'st-5',
    name: 'Johnathan Cole',
    email: 'j.cole@apexiums-admin.com',
    role: 'Staff',
    department: 'Vendor Quality Assurance',
    status: 'Inactive',
    joinedDate: '2025-12-01'
  }
];

export const initialRolesPermissions = [
  {
    role: 'Super Admin',
    description: 'Full un-restricted system access across all financial, user, and administrative settings.',
    permissions: {
      viewDashboard: true,
      manageProducts: true,
      manageCategories: true,
      manageOrders: true,
      manageCustomers: true,
      manageSellers: true,
      manageStaff: true,
      manageMarketing: true,
      manageFinance: true,
      manageInvestors: true,
      manageSettings: true
    }
  },
  {
    role: 'Admin',
    description: 'High-level admin access to operations, products, sales, sellers, and marketing.',
    permissions: {
      viewDashboard: true,
      manageProducts: true,
      manageCategories: true,
      manageOrders: true,
      manageCustomers: true,
      manageSellers: true,
      manageStaff: false,
      manageMarketing: true,
      manageFinance: true,
      manageInvestors: false,
      manageSettings: true
    }
  },
  {
    role: 'Manager',
    description: 'Operational manager for catalog, order fulfillment, returns, and customer service.',
    permissions: {
      viewDashboard: true,
      manageProducts: true,
      manageCategories: true,
      manageOrders: true,
      manageCustomers: true,
      manageSellers: true,
      manageStaff: false,
      manageMarketing: true,
      manageFinance: false,
      manageInvestors: false,
      manageSettings: false
    }
  },
  {
    role: 'Staff',
    description: 'Support staff view for reviewing customer orders, inventory checks, and return tickets.',
    permissions: {
      viewDashboard: true,
      manageProducts: false,
      manageCategories: false,
      manageOrders: true,
      manageCustomers: true,
      manageSellers: false,
      manageStaff: false,
      manageMarketing: false,
      manageFinance: false,
      manageInvestors: false,
      manageSettings: false
    }
  },
  {
    role: 'Seller',
    description: 'Vendor portal view limited to managing store products, orders, and sales reports.',
    permissions: {
      viewDashboard: true,
      manageProducts: true,
      manageCategories: false,
      manageOrders: true,
      manageCustomers: false,
      manageSellers: false,
      manageStaff: false,
      manageMarketing: false,
      manageFinance: false,
      manageInvestors: false,
      manageSettings: false
    }
  }
];

export const initialFinanceData = {
  summary: {
    totalRevenue: 336900.00,
    grossSales: 374333.33,
    sellerRevenue: 303210.00,
    platformCommission: 33690.00,
    netRevenue: 33690.00
  },
  expensesList: [
    { id: 'exp-1', category: 'Software Fees', title: 'AWS Cloud Hosting & Databases', amount: 3450.00, date: '2026-08-01', vendor: 'Amazon Web Services', status: 'Paid' },
    { id: 'exp-2', category: 'Delivery Expenses', title: 'FedEx Express Courier Logistics', amount: 8920.00, date: '2026-08-05', vendor: 'FedEx', status: 'Paid' },
    { id: 'exp-3', category: 'Staff Salaries', title: 'Monthly Executive & Operations Payroll', amount: 24500.00, date: '2026-08-01', vendor: 'Direct Payroll', status: 'Paid' },
    { id: 'exp-4', category: 'Marketing', title: 'Google & Meta Digital Ad Campaign', amount: 5790.00, date: '2026-08-08', vendor: 'Google Ads / Meta', status: 'Paid' },
    { id: 'exp-5', category: 'Software Fees', title: 'Stripe Payment Gateway Processing Fees', amount: 1850.00, date: '2026-08-10', vendor: 'Stripe Inc.', status: 'Pending' }
  ],
  softwareFees: [
    { id: 'sw-1', name: 'AWS Cloud & Infrastructure', provider: 'Amazon Web Services', amount: 3450.00, billingCycle: 'Monthly', nextPaymentDate: '2026-09-01', status: 'Active' },
    { id: 'sw-2', name: 'SendGrid Email API & Marketing', provider: 'Twilio SendGrid', amount: 450.00, billingCycle: 'Monthly', nextPaymentDate: '2026-08-25', status: 'Active' },
    { id: 'sw-3', name: 'Zendesk Customer Support Suite', provider: 'Zendesk Inc.', amount: 890.00, billingCycle: 'Monthly', nextPaymentDate: '2026-09-05', status: 'Active' },
    { id: 'sw-4', name: 'Intercom AI Chatbot & Messaging', provider: 'Intercom', amount: 620.00, billingCycle: 'Monthly', nextPaymentDate: '2026-08-28', status: 'Active' }
  ],
  staffSalaries: [
    { id: 'sal-1', staffName: 'Alexander Wright', role: 'Super Admin', baseSalary: 12000.00, bonus: 1500.00, deductions: 500.00, netSalary: 13000.00, status: 'Paid', paymentDate: '2026-08-01' },
    { id: 'sal-2', staffName: 'Samantha Ray', role: 'Admin', baseSalary: 8500.00, bonus: 800.00, deductions: 300.00, netSalary: 9000.00, status: 'Paid', paymentDate: '2026-08-01' },
    { id: 'sal-3', staffName: 'Carlos Mendez', role: 'Manager', baseSalary: 6500.00, bonus: 500.00, deductions: 250.00, netSalary: 6750.00, status: 'Paid', paymentDate: '2026-08-01' },
    { id: 'sal-4', staffName: 'Priya Patel', role: 'Staff', baseSalary: 4200.00, bonus: 200.00, deductions: 150.00, netSalary: 4250.00, status: 'Paid', paymentDate: '2026-08-01' }
  ],
  deliveryExpenses: [
    { id: 'del-1', courier: 'FedEx Express', orderId: 'ORD-98421', cost: 18.50, date: '2026-08-10', status: 'Paid' },
    { id: 'del-2', courier: 'DHL Express', orderId: 'ORD-98422', cost: 24.00, date: '2026-08-10', status: 'Paid' },
    { id: 'del-3', courier: 'BlueDart Freight', orderId: 'ORD-98423', cost: 45.00, date: '2026-08-09', status: 'Pending' },
    { id: 'del-4', courier: 'FedEx Ground Return', orderId: 'ORD-98425', cost: 12.00, date: '2026-08-08', status: 'Paid' }
  ]
};

export const initialNotifications = [
  {
    id: 'notif-1',
    title: 'New Seller Registration',
    message: 'GreenFit Activewear submitted a seller application awaiting review.',
    type: 'Seller Approval Request',
    date: '2026-08-11 08:30 AM',
    read: false,
    actionUrl: 'sellers'
  },
  {
    id: 'notif-2',
    title: 'Low Stock Warning!',
    message: 'UltraSlim OLED Smartwatch Series 5 has only 8 items remaining.',
    type: 'Low Stock',
    date: '2026-08-11 07:45 AM',
    read: false,
    actionUrl: 'stock'
  },
  {
    id: 'notif-3',
    title: 'New Order Received (#ORD-98424)',
    message: 'Liam O\'Connor placed a $179.55 order for UltraSlim Smartwatch.',
    type: 'New Order',
    date: '2026-08-11 07:12 AM',
    read: false,
    actionUrl: 'orders'
  },
  {
    id: 'notif-4',
    title: 'New Investor Application',
    message: 'Nexus Tech Holdings requested $150,000 convertible note participation.',
    type: 'New Investor',
    date: '2026-08-10 04:20 PM',
    read: true,
    actionUrl: 'investors'
  },
  {
    id: 'notif-5',
    title: 'Return Request Received (#RET-402)',
    message: 'Marcus Vance requested a size exchange for Organic Cotton Hoodie.',
    type: 'Return Request',
    date: '2026-08-10 02:15 PM',
    read: true,
    actionUrl: 'returns'
  }
];

export const initialSettings = {
  storeName: 'Apexiums Marketplace',
  supportEmail: 'support@apexiums.com',
  contactPhone: '+1 (800) 555-APEX',
  currency: 'USD ($)',
  defaultCommissionRate: 10, // %
  autoApproveSellers: false,
  enableTaxCalculation: true,
  taxRate: 8.5, // %
  payoutSchedule: 'Bi-Weekly',
  stripeEnabled: true,
  paypalEnabled: true,
  bankTransferEnabled: true,
  maintenanceMode: false
};
