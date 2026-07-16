// Hardcoded users for development
const USERS = {
  admin: {
    id: 1,
    name: 'Admin User',
    email: 'admin@kulmi.com',
    role: 'admin',
    avatar: 'A',
    badge: 'Super Admin',
  },
  merchant: {
    id: 2,
    name: 'TechZone MN',
    email: 'techzone@kulmi.com',
    role: 'merchant',
    avatar: 'T',
    badge: 'Merchant Account',
    storeName: 'TechZone MN',
    category: 'Electronics',
    rating: 4.9,
    reviews: 1204,
  },
  user: {
    id: 3,
    name: 'Ahmed Mohamed',
    email: 'ahmed@email.com',
    role: 'user',
    avatar: 'A',
    badge: 'Verified Member',
  },
};

/**
 * Get user by role
 * @param {'admin' | 'merchant' | 'user'} role
 * @returns {object}
 */
export const getUserByRole = (role) => {
  switch (role) {
    case 'admin':
      return USERS.admin;
    case 'merchant':
      return USERS.merchant;
    case 'user':
      return USERS.user;
    default:
      return USERS.user;
  }
};

/**
 * Get the default redirect path for a role
 * @param {'admin' | 'merchant' | 'user'} role
 * @returns {string} path
 */
export const getHomePathByRole = (role) => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'merchant':
      return '/merchant';
    case 'user':
    default:
      return '/';
  }
};

export const CURRENT_ROLE = 'user';

export default USERS;
