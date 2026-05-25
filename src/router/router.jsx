import { lazy, Suspense } from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, useNavigate, useParams } from 'react-router-dom';

import RootLayout from '../layout/public/RootLayout';
import LoadingFallback from './components/LoadingFallback';
import ProtectedRoute from './components/ProtectedRoute';
import RouteErrorBoundary from './components/RouteErrorBoundary';

const Home = lazy(() => import('../pages/public/public_Home/Home'));
const ContactView = lazy(() => import('../pages/public/public_contact/ContactView'));
const ElectronicsView = lazy(() => import('../pages/public/public_Electronics/ElectronicsView'));
const FashionView = lazy(() => import('../pages/public/public_Fashion/FashionView'));
const HomeGardenView = lazy(() => import('../pages/public/public_HomeGarden/HomeGardenView'));
const BeautyView = lazy(() => import('../pages/public/public_Beauty/BeautyView'));
const FoodGroceryView = lazy(() => import('../pages/public/public_FoodGrocery/FoodGroceryView'));
const SportsView = lazy(() => import('../pages/public/public_Sports/SportsView'));
const BooksView = lazy(() => import('../pages/public/public_Books/BooksView'));
const ToysKidsView = lazy(() => import('../pages/public/public_ToysKids/ToysKidsView'));
const ToolsDIYView = lazy(() => import('../pages/public/public_ToolsDIY/ToolsDIYView'));
const PetSuppliesView = lazy(() => import('../pages/public/public_PetSupplies/PetSuppliesView'));
const HealthView = lazy(() => import('../pages/public/public_Health/HealthView'));
const CartView = lazy(() => import('../pages/public/public_Cart/CartView'));
const SearchView = lazy(() => import('../pages/public/public_Search/SearchView'));
const ProductDetailsView = lazy(
  () => import('../pages/public/public_ProductDetails/ProductDetailsView')
);
const WishlistView = lazy(() => import('../pages/public/public_Wishlist/WishlistView'));

// Account Pages
const LoginView = lazy(() => import('../pages/auth/LoginView'));
const RegisterView = lazy(() => import('../pages/auth/RegisterView'));
const OTPView = lazy(() => import('../pages/auth/otp/OTPView'));
const OAuthCallbackView = lazy(() => import('../pages/auth/OAuthCallbackView'));

// User Dashboard
const UserView = lazy(() => import('../pages/users/UserView'));
const UserDashboard = lazy(() => import('../pages/users/pages/UserDashboard'));
const UserOrders = lazy(() => import('../pages/users/pages/UserOrders'));
const UserTrackOrder = lazy(() => import('../pages/users/pages/UserTrackOrder'));
const UserWishlist = lazy(() => import('../pages/users/pages/UserWishlist'));
const UserProfile = lazy(() => import('../pages/users/pages/UserProfile'));
const UserAddresses = lazy(() => import('../pages/users/pages/UserAddresses'));
const UserPayments = lazy(() => import('../pages/users/pages/UserPayments'));
const UserSettings = lazy(() => import('../pages/users/pages/UserSettings'));

// Portals
const AdminView = lazy(() => import('../pages/admin/AdminView'));
const MerchantView = lazy(() => import('../pages/merchant/MerchantView'));
const AdminDashboard = lazy(() => import('../pages/admin/pages/AdminDashboard'));
const AdminOrders = lazy(() => import('../pages/admin/pages/AdminOrders'));
const AdminProducts = lazy(() => import('../pages/admin/pages/AdminProducts'));
const AdminMerchants = lazy(() => import('../pages/admin/pages/AdminMerchants'));
const AdminCustomers = lazy(() => import('../pages/admin/pages/AdminCustomers'));
const AdminDelivery = lazy(() => import('../pages/admin/pages/AdminDelivery'));
const AdminRevenue = lazy(() => import('../pages/admin/pages/AdminRevenue'));
const AdminCoupons = lazy(() => import('../pages/admin/pages/AdminCoupons'));
const AdminSettings = lazy(() => import('../pages/admin/pages/AdminSettings'));

const MerchantDashboard = lazy(() => import('../pages/merchant/pages/MerchantDashboard'));
const MerchantOrders = lazy(() => import('../pages/merchant/pages/MerchantOrders'));
const MerchantProducts = lazy(() => import('../pages/merchant/pages/MerchantProducts'));
const MerchantInventory = lazy(() => import('../pages/merchant/pages/MerchantInventory'));
const MerchantEarnings = lazy(() => import('../pages/merchant/pages/MerchantEarnings'));
const MerchantPayouts = lazy(() => import('../pages/merchant/pages/MerchantPayouts'));
const MerchantAddProduct = lazy(() => import('../pages/merchant/pages/MerchantAddProduct'));
const MerchantReviews = lazy(() => import('../pages/merchant/pages/MerchantReviews'));
const MerchantPromotions = lazy(() => import('../pages/merchant/pages/MerchantPromotions'));
const MerchantProfile = lazy(() => import('../pages/merchant/pages/MerchantProfile'));
const MerchantSupport = lazy(() => import('../pages/merchant/pages/MerchantSupport'));

const SubAdminView = lazy(() => import('../pages/subadmin/SubAdminView'));
const SubAdminDashboard = lazy(() => import('../pages/subadmin/pages/SubAdminDashboard'));
const SubAdminSupportTickets = lazy(() => import('../pages/subadmin/pages/SubAdminSupportTickets'));
const SubAdminReviewModeration = lazy(() => import('../pages/subadmin/pages/SubAdminReviewModeration'));
const SubAdminFlaggedContent = lazy(() => import('../pages/subadmin/pages/SubAdminFlaggedContent'));
const SubAdminMerchantApprovals = lazy(() => import('../pages/subadmin/pages/SubAdminMerchantApprovals'));
const SubAdminUserManagement = lazy(() => import('../pages/subadmin/pages/SubAdminUserManagement'));
const SubAdminOrderDisputes = lazy(() => import('../pages/subadmin/pages/SubAdminOrderDisputes'));
const SubAdminCustomerMessages = lazy(() => import('../pages/subadmin/pages/SubAdminCustomerMessages'));
const SubAdminActivityLog = lazy(() => import('../pages/subadmin/pages/SubAdminActivityLog'));
const SubAdminReports = lazy(() => import('../pages/subadmin/pages/SubAdminReports'));

const MerchantRegister = lazy(() => import('../pages/public/public_MerchantRegister/MerchantRegister'));
const NotFound = lazy(() => import('../pages/error/NotFound'));

const wrap = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

const wrapElement = (element) => <Suspense fallback={<LoadingFallback />}>{element}</Suspense>;

const adminPathMap = {
  merchants: '/admin/merchants',
  orders: '/admin/orders',
  coupons: '/admin/coupons',
  payouts: '/admin/payouts',
};

const merchantPathMap = {
  'add-product': '/merchant/add-product',
  orders: '/merchant/orders',
  payouts: '/merchant/payouts',
  products: '/merchant/products',
  inventory: '/merchant/inventory',
};

const userPathMap = {
  orders: '/dashboard/orders',
  track: '/dashboard/track',
  wishlist: '/dashboard/wishlist',
  profile: '/dashboard/profile',
  addresses: '/dashboard/addresses',
  payments: '/dashboard/payments',
  settings: '/dashboard/settings',
};

const AdminDashboardRoute = () => {
  const navigate = useNavigate();
  return <AdminDashboard onNav={(id) => navigate(adminPathMap[id] || '/admin')} />;
};

const MerchantDashboardRoute = () => {
  const navigate = useNavigate();
  return <MerchantDashboard onNav={(id) => navigate(merchantPathMap[id] || '/merchant')} />;
};

const UserDashboardRoute = () => {
  const navigate = useNavigate();
  return <UserDashboard onNav={(id) => navigate(userPathMap[id] || '/dashboard')} />;
};

const MerchantProductsRoute = () => {
  const navigate = useNavigate();
  return <MerchantProducts onNav={(id) => navigate(merchantPathMap[id] || '/merchant/products')} />;
};

const MerchantEarningsRoute = () => {
  const navigate = useNavigate();
  return <MerchantEarnings onNav={(id) => navigate(merchantPathMap[id] || '/merchant/earnings')} />;
};

const MerchantAddProductRoute = () => {
  const navigate = useNavigate();
  return <MerchantAddProduct onNav={(id) => navigate(merchantPathMap[id] || '/merchant/add-product')} />;
};

const MerchantEditProductRoute = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  return <MerchantAddProduct onNav={(id) => navigate(merchantPathMap[id] || '/merchant/products')} productId={id} />;
};

const AdminPlaceholder = ({ title, icon }) => (
  <div className="bg-card rounded-md border border-white/[0.07] p-12 text-center">
    <div className="mb-3 text-4xl">{icon}</div>
    <div className="font-['Syne'] text-lg font-bold text-white">{title}</div>
    <div className="text-gray mt-1 text-sm">Coming soon</div>
  </div>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<RootLayout />} errorElement={<RouteErrorBoundary />}>
        <Route index element={<Home />} />
        <Route path="contact" element={wrap(ContactView)} />
        <Route path="electronics" element={wrap(ElectronicsView)} />
        <Route path="fashion" element={wrap(FashionView)} />
        <Route path="home-garden" element={wrap(HomeGardenView)} />
        <Route path="beauty" element={wrap(BeautyView)} />
        <Route path="food-grocery" element={wrap(FoodGroceryView)} />
        <Route path="sports" element={wrap(SportsView)} />
        <Route path="books" element={wrap(BooksView)} />
        <Route path="toys-kids" element={wrap(ToysKidsView)} />
        <Route path="tools-diy" element={wrap(ToolsDIYView)} />
        <Route path="pet-supplies" element={wrap(PetSuppliesView)} />
        <Route path="health" element={wrap(HealthView)} />
        <Route path="search" element={wrap(SearchView)} />
        <Route path="wishlist" element={wrap(WishlistView)} />
        <Route path="cart" element={<ProtectedRoute>{wrap(CartView)}</ProtectedRoute>} />
        <Route
          path="product/:id"
          element={wrap(ProductDetailsView)}
        />

        <Route path="*" element={wrap(NotFound)} />
      </Route>

      {/* Standalone pages - No marketplace layout */}
      <Route path="merchant-register" element={wrap(MerchantRegister)} />

      {/* Auth & Dashboards - No marketplace layout */}
      <Route path="auth">
        <Route path="login" element={<LoginView />} />
        <Route path="register" element={wrap(RegisterView)} />
        <Route path="otp" element={wrap(OTPView)} />
        <Route path="callback" element={wrap(OAuthCallbackView)} />
      </Route>
      <Route path="dashboard" element={
        <ProtectedRoute>
          {wrap(UserView)}
        </ProtectedRoute>
      } errorElement={<RouteErrorBoundary />}>
        <Route index element={wrapElement(<UserDashboardRoute />)} />
        <Route path="orders" element={wrap(UserOrders)} />
        <Route path="track" element={wrap(UserTrackOrder)} />
        <Route path="wishlist" element={
          <ProtectedRoute>
            {wrap(UserWishlist)}
          </ProtectedRoute>
        } />
        <Route path="profile" element={wrap(UserProfile)} />
        <Route path="addresses" element={wrap(UserAddresses)} />
        <Route path="payments" element={wrap(UserPayments)} />
        <Route path="settings" element={wrap(UserSettings)} />
      </Route>
      <Route path="admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          {wrap(AdminView)}
        </ProtectedRoute>
      } errorElement={<RouteErrorBoundary />}>
        <Route index element={wrapElement(<AdminDashboardRoute />)} />
        <Route path="orders" element={wrap(AdminOrders)} />
        <Route path="products" element={wrap(AdminProducts)} />
        <Route path="merchants" element={wrap(AdminMerchants)} />
        <Route path="customers" element={wrap(AdminCustomers)} />
        <Route path="delivery" element={wrap(AdminDelivery)} />
        <Route path="revenue" element={wrap(AdminRevenue)} />
        <Route path="coupons" element={wrap(AdminCoupons)} />
        <Route path="settings" element={wrap(AdminSettings)} />
        {/* <Route path="payouts" element={<AdminPlaceholder title="Payout Management" icon="💸" />} />
        <Route path="commission" element={<AdminPlaceholder title="Commission Config" icon="📈" />} />
        <Route path="categories" element={<AdminPlaceholder title="Category Management" icon="📂" />} />
        <Route path="banners" element={<AdminPlaceholder title="Banner Management" icon="🖼️" />} />
        <Route path="analytics" element={<AdminPlaceholder title="Analytics Reports" icon="📊" />} /> */}
      </Route>
      <Route path="merchant" element={
        <ProtectedRoute allowedRoles={['merchant']}>
          {wrap(MerchantView)}
        </ProtectedRoute>
      } errorElement={<RouteErrorBoundary />}>
        <Route index element={wrapElement(<MerchantDashboardRoute />)} />
        <Route path="orders" element={wrap(MerchantOrders)} />
        <Route path="products" element={wrapElement(<MerchantProductsRoute />)} />
        <Route path="inventory" element={wrap(MerchantInventory)} />
        <Route path="earnings" element={wrapElement(<MerchantEarningsRoute />)} />
        <Route path="payouts" element={wrap(MerchantPayouts)} />
        <Route path="add-product" element={wrapElement(<MerchantAddProductRoute />)} />
        <Route path="edit-product/:id" element={wrapElement(<MerchantEditProductRoute />)} />
        <Route path="reviews" element={wrap(MerchantReviews)} />
        <Route path="promotions" element={wrap(MerchantPromotions)} />
        <Route path="profile" element={wrap(MerchantProfile)} />
        <Route path="support" element={wrap(MerchantSupport)} />
        <Route path="register" element={wrap(MerchantRegister)} />
      </Route>
      <Route path="subadmin" element={
        <ProtectedRoute allowedRoles={['sub_admin', 'admin']}>
          {wrap(SubAdminView)}
        </ProtectedRoute>
      } errorElement={<RouteErrorBoundary />}>
        <Route index element={wrap(SubAdminDashboard)} />
        <Route path="support-tickets" element={wrap(SubAdminSupportTickets)} />
        <Route path="review-moderation" element={wrap(SubAdminReviewModeration)} />
        <Route path="flagged-content" element={wrap(SubAdminFlaggedContent)} />
        <Route path="merchant-approvals" element={wrap(SubAdminMerchantApprovals)} />
        <Route path="user-management" element={wrap(SubAdminUserManagement)} />
        <Route path="order-disputes" element={wrap(SubAdminOrderDisputes)} />
        {/* <Route path="customer-messages" element={wrap(SubAdminCustomerMessages)} /> */}
        <Route path="activity-log" element={wrap(SubAdminActivityLog)} />
        <Route path="my-reports" element={wrap(SubAdminReports)} />
      </Route>
    </>
  )
);

export default router;
