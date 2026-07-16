import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  Apple,
  Dumbbell,
  BookOpen,
  Baby,
  Wrench,
  Dog,
  Heart,
  Search,
  User,
  ShoppingCart,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import Sidebar from './Sidebar';
import { getCurrentUser, logout } from '../../services/authService';
import { getTrendingSearches, searchAutocomplete } from '../../services/productService';
import { getCartItems, getWishlistItems } from '../../services/shopStorageService';
import { getToken } from '../../utils/storage';
import Logo from '../../components/Logo';

const NavbarLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Departments');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const searchBoxRef = useRef(null);

  const refreshCounts = () => {
    setWishlistCount(getWishlistItems().length);
    setCartCount(getCartItems().reduce((sum, item) => sum + Number(item.qty || 1), 0));
  };

  useEffect(() => {
    // Only treat session as authenticated if both token and user are present.
    const user = getCurrentUser();
    const token = getToken();
    setCurrentUser(user && token ? user : null);
    refreshCounts();
  }, [location]);

  useEffect(() => {
    const onShopUpdate = () => refreshCounts();
    window.addEventListener('kulmi:shop-updated', onShopUpdate);
    return () => window.removeEventListener('kulmi:shop-updated', onShopUpdate);
  }, []);

  useEffect(() => {
    let active = true;

    const loadTrending = async () => {
      try {
        const data = await getTrendingSearches(6);
        if (active) {
          setTrendingSearches(Array.isArray(data) ? data : []);
        }
      } catch {
        if (active) setTrendingSearches([]);
      }
    };

    loadTrending();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const timer = setTimeout(async () => {
      if (!searchText.trim()) {
        if (active) setSearchSuggestions([]);
        return;
      }

      try {
        const categoryFilter = selectedCategory !== 'All Departments' ? selectedCategory : '';
        const data = await searchAutocomplete(searchText.trim(), 8, categoryFilter);
        if (active) {
          setSearchSuggestions(Array.isArray(data) ? data : []);
        }
      } catch {
        if (active) setSearchSuggestions([]);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchText, selectedCategory]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (!searchBoxRef.current?.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    navigate('/auth/login');
  };

  const submitSearch = (query) => {
    const text = String(query || searchText).trim();
    if (!text) return;

    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(text)}`);
  };

  const categories = [
    { id: 1, name: 'All Departments', icon: ShoppingBag, path: '/' },
    { id: 2, name: 'Electronics', icon: Smartphone, path: '/electronics' },
    { id: 3, name: 'Fashion', icon: Shirt, path: '/fashion' },
    { id: 4, name: 'Home & Garden', icon: Home, path: '/home-garden' },
    { id: 5, name: 'Beauty', icon: Sparkles, path: '/beauty' },
    { id: 6, name: 'Food & Grocery', icon: Apple, path: '/food-grocery' },
    { id: 7, name: 'Sports', icon: Dumbbell, path: '/sports' },
    { id: 8, name: 'Books', icon: BookOpen, path: '/books' },
    { id: 9, name: 'Toys & Kids', icon: Baby, path: '/toys-kids' },
    { id: 10, name: 'Tools & DIY', icon: Wrench, path: '/tools-diy' },
    { id: 11, name: 'Pet Supplies', icon: Dog, path: '/pet-supplies' },
    { id: 12, name: 'Health', icon: Heart, path: '/health' },
  ];

  const getActiveCategory = () => {
    const cat = categories.find((c) => c.path === location.pathname);
    return cat ? cat.name : 'All Departments';
  };

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileBtnRef = useRef(null);

  // Close dropdown on outside click (mobile)
  useEffect(() => {
    if (!profileDropdownOpen) return;
    const handler = (e) => {
      if (profileBtnRef.current && !profileBtnRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileDropdownOpen]);

  return (
    <>
      <div className="bg-teal text-navy px-4 py-2 text-center text-[0.6rem] font-medium tracking-[0.05em] max-[580px]:hidden lg:text-[0.78rem]">
        Free shipping on orders over $50 | New merchants welcome | Download our app coming soon
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-16 z-40 bg-black/50 min-[900px]:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <nav className="sticky top-0 z-300 flex h-16 items-center justify-between border-b border-white/10 bg-[rgba(10,15,30,0.97)] px-3 backdrop-blur-lg min-[640px]:px-4 min-[900px]:grid min-[900px]:grid-cols-[auto_1fr_auto_auto] min-[900px]:gap-6 min-[900px]:px-8">
        <div className="flex items-center gap-2 min-[900px]:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="icon-btn text-gray2 hover:text-teal rounded-sm p-1.5 min-[640px]:p-2 transition hover:bg-[rgba(0,201,167,0.15)]"
            title="Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button
            onClick={() => {
              setMobileSearchOpen(!mobileSearchOpen);
              if (mobileMenuOpen) setMobileMenuOpen(false);
            }}
            className="icon-btn text-gray2 hover:text-teal rounded-sm p-1.5 min-[640px]:p-2 transition hover:bg-[rgba(0,201,167,0.15)]"
            title="Search"
          >
            {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
          </button>
        </div>

        <Logo className="h-10 min-[640px]:h-12 min-[900px]:col-start-1" textClassName="text-white" />

        <div ref={searchBoxRef} className="search-bar bg-navy3 relative hidden items-center overflow-visible rounded-sm border border-white/10 min-[900px]:flex">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-navy3 text-gray2 h-full cursor-pointer border-r border-white/10 px-3 text-[0.8rem] outline-none"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <input
            type="text"
            name="siteSearch"
            autoComplete="off"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submitSearch();
              }
            }}
            placeholder="Search products, brands, categories..."
            className="placeholder:text-gray flex-1 bg-transparent px-4 py-[0.4rem] lg:py-[0.6rem] text-[0.9rem] text-white outline-none"
          />
          <button
            type="button"
            onClick={() => submitSearch()}
            className="bg-teal text-navy hover:bg-teal2 absolute right-0 h-full px-5 transition-colors"
          >
            <Search size={18} />
          </button>

          {searchOpen && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 rounded-sm border border-white/10 bg-navy2 p-2 shadow-2xl" style={{ zIndex: 500 }}>
              {searchText.trim() ? (
                <>
                  <div className="px-2 py-1 text-[0.65rem] font-bold tracking-widest text-gray uppercase">Suggestions</div>
                  {(searchSuggestions.length ? searchSuggestions : [searchText]).map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => submitSearch(item)}
                      className="block w-full rounded px-2 py-2 text-left text-[0.8rem] text-gray2 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      {item}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <div className="px-2 py-1 text-[0.65rem] font-bold tracking-widest text-gray uppercase">Trending</div>
                  {trendingSearches.map((item) => (
                    <button
                      type="button"
                      key={item.query}
                      onClick={() => submitSearch(item.query)}
                      className="flex w-full items-center justify-between rounded px-2 py-2 text-left text-[0.8rem] text-gray2 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <span>{item.query}</span>
                      <span className="text-[0.65rem] text-gray">{item.count}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 min-[640px]:gap-2">
          <div
            className="relative order-last min-[640px]:order-first group"
            ref={profileBtnRef}
            onMouseEnter={() => setProfileDropdownOpen(true)}
            onMouseLeave={() => setProfileDropdownOpen(false)}
          >
            {currentUser ? (
              <button
                className="icon-btn text-gray2 hover:text-teal rounded-sm p-1.5 min-[640px]:p-2 transition hover:bg-[rgba(0,201,167,0.15)]"
                title="Account"
                onClick={() => setProfileDropdownOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={profileDropdownOpen}
              >
                <User size={20} />
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth/login')}
                className="min-[500px]:hidden icon-btn text-gray2 hover:text-teal rounded-sm p-1.5 transition hover:bg-[rgba(0,201,167,0.15)]"
                title="Sign In"
              >
                <User size={20} />
              </button>
            )}

            {/* Auth Status Display */}
            {currentUser && (
              <div
                className={`absolute top-full right-0 z-400 pt-2 w-64 transition-opacity duration-150 ${
                  profileDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                } min-[900px]:invisible min-[900px]:group-hover:visible min-[900px]:opacity-100`}
                style={{ pointerEvents: profileDropdownOpen ? 'auto' : 'none' }}
              >
                <div className="overflow-hidden rounded-md border border-white/10 bg-[#0D1626] shadow-2xl backdrop-blur-xl">
                  <div className="border-b border-white/10 px-4 py-3">
                    <div className="text-[0.88rem] leading-none font-bold text-teal capitalize">
                      {currentUser.firstName} {currentUser.lastName}
                    </div>
                    <div className="text-gray2 mt-1 text-[0.7rem] leading-none tracking-widest uppercase font-semibold">
                      {currentUser.role}
                    </div>
                    <div className="text-gray mt-1.5 text-[0.7rem] wrap-break-word">
                      {currentUser.email}
                    </div>
                  </div>
                  <div className="space-y-0.5 p-2">
                    {(currentUser.role === 'customer' || currentUser.role === 'delivery_partner') && (
                      <Link
                        to="/dashboard"
                        className="text-gray2 hover:bg-teal/10 hover:text-teal flex items-center gap-2.5 rounded px-3 py-2 text-[0.82rem] no-underline transition"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <User size={14} /> My Dashboard
                      </Link>
                    )}
                    {(currentUser.role === 'admin' || currentUser.role === 'sub_admin') && (
                      <Link
                        to="/admin"
                        className="text-gray2 hover:bg-teal/10 hover:text-teal flex items-center gap-2.5 rounded px-3 py-2 text-[0.82rem] no-underline transition"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <Smartphone size={14} /> Admin Portal
                      </Link>
                    )}
                    {currentUser.role === 'merchant' && (
                      <Link
                        to="/merchant"
                        className="text-gray2 hover:bg-teal/10 hover:text-teal flex items-center gap-2.5 rounded px-3 py-2 text-[0.82rem] no-underline transition"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <ShoppingBag size={14} /> Merchant Portal
                      </Link>
                    )}
                    <div className="my-1 h-px bg-white/10" />
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 flex w-full items-center gap-2.5 rounded px-3 py-2 text-[0.82rem] font-bold no-underline transition"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!currentUser && (
            <button
              onClick={() => navigate('/auth/login')}
              className="hidden min-[500px]:block text-teal hover:text-teal2 border border-teal hover:border-teal2 rounded-sm px-3 py-1.5 text-[0.82rem] font-semibold transition"
            >
              Sign In
            </button>
          )}

          <Link
            to="/wishlist"
            className="icon-btn text-gray2 hover:text-teal relative rounded-sm p-1.5 min-[640px]:p-2 no-underline transition hover:bg-[rgba(0,201,167,0.15)]"
            title="Wishlist"
          >
            <Heart size={18} className="min-[640px]:size-5" />
            <span className="bg-teal text-navy absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full text-[0.6rem] font-bold">
              {wishlistCount}
            </span>
          </Link>
          <Link
            to="/cart"
            className="icon-btn text-gray2 hover:text-teal relative rounded-sm p-1.5 min-[640px]:p-2 no-underline transition hover:bg-[rgba(0,201,167,0.15)]"
            title="Cart"
          >
            <ShoppingCart size={18} className="min-[640px]:size-5" />
            <span className="bg-teal text-navy absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full text-[0.6rem] font-bold">
              {cartCount}
            </span>
          </Link>
        </div>

        {/* Mobile Search Overlay */}
        {mobileSearchOpen && (
          <div className="absolute top-full left-0 right-0 border-b border-white/10 bg-[rgba(10,15,30,0.98)] p-3 min-[900px]:hidden backdrop-blur-lg">
            <div className="relative flex h-11 items-center overflow-visible rounded-sm border border-white/10 bg-navy3">
              <input
                type="text"
                autoComplete="off"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    setMobileSearchOpen(false);
                    submitSearch();
                  }
                }}
                placeholder="Search products, brands..."
                className="placeholder:text-gray flex-1 bg-transparent px-4 text-[0.9rem] text-white outline-none w-full h-full"
              />
              <button
                type="button"
                onClick={() => {
                  setMobileSearchOpen(false);
                  submitSearch();
                }}
                className="bg-teal text-navy hover:bg-teal2 h-full px-5 transition-colors shrink-0"
              >
                <Search size={18} />
              </button>

              {searchOpen && (
                <div className="absolute top-[calc(100%+6px)] left-0 right-0 rounded-sm border border-white/10 bg-navy2 p-2 shadow-2xl" style={{ zIndex: 500 }}>
                  {searchText.trim() ? (
                    <>
                      <div className="px-2 py-1 text-[0.65rem] font-bold tracking-widest text-gray uppercase">Suggestions</div>
                      {(searchSuggestions.length ? searchSuggestions : [searchText]).map((item) => (
                        <button
                          type="button"
                          key={item}
                          onClick={() => {
                            setMobileSearchOpen(false);
                            submitSearch(item);
                          }}
                          className="block w-full rounded px-2 py-2 text-left text-[0.8rem] text-gray2 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          {item}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      <div className="px-2 py-1 text-[0.65rem] font-bold tracking-widest text-gray uppercase">Trending</div>
                      {trendingSearches.map((item) => (
                        <button
                          type="button"
                          key={item.query}
                          onClick={() => {
                            setMobileSearchOpen(false);
                            submitSearch(item.query);
                          }}
                          className="flex w-full items-center justify-between rounded px-2 py-2 text-left text-[0.8rem] text-gray2 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <span>{item.query}</span>
                          <span className="text-[0.65rem] text-gray">{item.count}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <Sidebar
        categories={categories}
        selectedCategory={getActiveCategory()}
        mobileMenuOpen={mobileMenuOpen}
        onSelectCategory={(cat) => {
          navigate(cat.path);
          setMobileMenuOpen(false);
        }}
      />

      <div className="cat-nav bg-navy2 scrollbar-hide hidden items-center overflow-x-auto border-b border-white/10 px-4 min-[900px]:flex min-[900px]:px-8">
        {categories.map((cat) => {
          const IconComponent = cat.icon;
          const isActive = location.pathname === cat.path;
          return (
            <Link
              key={cat.id}
              to={cat.path}
              className={`inline-flex items-center gap-1.5 border-b-2 px-[1.1rem] py-3 text-[0.8rem] tracking-[0.04em] whitespace-nowrap no-underline transition-colors ${
                isActive ? 'border-teal text-teal' : 'text-gray2 hover:text-teal border-transparent'
              }`}
            >
              <IconComponent size={16} />
              {cat.name}
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default NavbarLayout;
