const CART_KEY = 'kulmi_cart_items';
const WISHLIST_KEY = 'kulmi_wishlist_items';

const read = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('kulmi:shop-updated'));
  }
};

const toId = (product = {}) => String(product.id || product.slug || product.name || '').trim();

export const normalizeShopProduct = (product = {}) => {
  const priceValue = Number(String(product.price || '0').replace(/[^0-9.]/g, '')) || 0;
  const oldValue = Number(String(product.old || product.oldPrice || '0').replace(/[^0-9.]/g, '')) || 0;

  return {
    id: toId(product),
    productId: product.id || null,
    slug: product.slug || null,
    name: product.name || 'Unnamed product',
    store: product.store || product.merchant?.storeName || 'Marketplace Store',
    image: product.image || (Array.isArray(product.images) ? product.images[0] : ''),
    icon: product.icon || '🛍',
    price: priceValue,
    old: oldValue || priceValue,
    off: oldValue > priceValue && oldValue > 0
      ? Math.round(((oldValue - priceValue) / oldValue) * 100)
      : 0,
    variant: product.variant || 'Standard',
  };
};

export const getCartItems = () => read(CART_KEY);

export const addToCart = (product, qty = 1) => {
  const item = normalizeShopProduct(product);
  if (!item.id) return null;

  const cart = getCartItems();
  const index = cart.findIndex((entry) => entry.id === item.id);

  if (index >= 0) {
    cart[index] = { ...cart[index], qty: Math.max(1, Number(cart[index].qty || 1) + Number(qty || 1)) };
  } else {
    cart.unshift({ ...item, qty: Math.max(1, Number(qty || 1)) });
  }

  write(CART_KEY, cart);
  return cart;
};

export const updateCartItemQty = (id, qty) => {
  const cart = getCartItems().map((item) =>
    item.id === id ? { ...item, qty: Math.max(1, Math.min(99, Number(qty || 1))) } : item
  );
  write(CART_KEY, cart);
  return cart;
};

export const removeFromCart = (id) => {
  const cart = getCartItems().filter((item) => item.id !== id);
  write(CART_KEY, cart);
  return cart;
};

export const clearCart = () => {
  write(CART_KEY, []);
  return [];
};

export const getWishlistItems = () => read(WISHLIST_KEY);

export const isWishlisted = (id) => {
  return getWishlistItems().some((item) => item.id === id);
};

export const toggleWishlistItem = (product) => {
  const item = normalizeShopProduct(product);
  if (!item.id) return { wishlisted: false, items: getWishlistItems() };

  const items = getWishlistItems();
  const index = items.findIndex((entry) => entry.id === item.id);

  if (index >= 0) {
    const next = items.filter((entry) => entry.id !== item.id);
    write(WISHLIST_KEY, next);
    return { wishlisted: false, items: next };
  }

  const next = [item, ...items];
  write(WISHLIST_KEY, next);
  return { wishlisted: true, items: next };
};

export const removeFromWishlist = (id) => {
  const items = getWishlistItems().filter((item) => item.id !== id);
  write(WISHLIST_KEY, items);
  return items;
};
