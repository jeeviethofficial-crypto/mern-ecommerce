export const products = [
  {
    _id: '1',
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Experience premium sound with industry-leading active noise cancellation. Features up to 30 hours of battery life.',
    price: 299.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    countInStock: 10,
    isActive: true,
    rating: 4.5,
    numReviews: 2,
    reviews: [
      {
        _id: 'r1',
        name: 'Jane Doe',
        rating: 5,
        comment: 'Absolutely love these! Best headphones I have ever owned.',
        user: 'user-2'
      },
      {
        _id: 'r2',
        name: 'John Smith',
        rating: 4,
        comment: 'Great sound, but a bit tight on the ears.',
        user: 'user-3'
      }
    ]
  },
  {
    _id: '2',
    name: 'Minimalist Mechanical Keyboard',
    description: 'Compact 75% layout mechanical keyboard with tactile switches and customizable RGB backlighting.',
    price: 129.50,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
    countInStock: 0,
    isActive: true,
    rating: 5,
    numReviews: 1,
    reviews: [
      {
        _id: 'r3',
        name: 'Alice',
        rating: 5,
        comment: 'Typing on this is a dream.',
        user: 'user-4'
      }
    ]
  },
  {
    _id: '3',
    name: 'Stainless Steel Water Bottle',
    description: 'Double-wall vacuum insulated water bottle. Keeps drinks cold for 24 hours or hot for 12 hours.',
    price: 34.99,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
    countInStock: 50,
    isActive: true,
    rating: 4,
    numReviews: 1,
    reviews: [
      {
        _id: 'r4',
        name: 'Bob',
        rating: 4,
        comment: 'Keeps water very cold. Paint chipped a little.',
        user: 'user-5'
      }
    ]
  },
  {
    _id: '4',
    name: 'Ergonomic Office Chair',
    description: 'Highly adjustable ergonomic chair with lumbar support and breathable mesh back.',
    price: 199.99,
    category: 'Furniture',
    imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80',
    countInStock: 5,
    isActive: true,
    rating: 0,
    numReviews: 0,
    reviews: []
  },
];

export const users = [
  {
    _id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123', // In a real app, this would be hashed
    role: 'customer',
  },
  {
    _id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'adminpassword',
    role: 'admin',
  }
];

export const orders: any[] = [];
