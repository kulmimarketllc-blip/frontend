import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Home } from 'lucide-react';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  clearCart,
  getCartItems,
  removeFromCart,
  toggleWishlistItem,
  updateCartItemQty,
} from '../../../services/shopStorageService';
import {
  confirmCheckoutPayment,
  createMyAddress,
  createCheckoutPaymentIntent,
  getMyAddresses,
  placeCheckoutOrder,
  validateCheckoutCoupon,
} from '../../../services/checkoutService';
import { handlePaymentError, handleStripeConfirmationError } from '../../../utils/paymentErrorHandler';
import { ENV } from '../../../config/env';

const stripePromise = ENV.STRIPE_PUBLIC_KEY ? loadStripe(ENV.STRIPE_PUBLIC_KEY) : null;

const CardPaymentForm = ({ cardholderName, setCardholderName, setStripeContext }) => {
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    setStripeContext({ stripe, elements });
  }, [elements, setStripeContext, stripe]);

  return (
    <div className="space-y-2.5 min-[480px]:space-y-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-gray text-[0.7rem] min-[480px]:text-[0.75rem] font-medium tracking-widest uppercase">
          Cardholder Name
        </label>
        <input
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          className="bg-navy3 placeholder:text-gray focus:border-teal rounded border border-white/[0.07] px-3 min-[480px]:px-4 py-2.5 min-[480px]:py-3 text-[0.8rem] min-[480px]:text-[0.88rem] text-white transition-colors outline-none"
          placeholder="John Doe"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-gray text-[0.7rem] min-[480px]:text-[0.75rem] font-medium tracking-widest uppercase">
          Card Details
        </label>
        <div className="bg-navy3 rounded border border-white/[0.07] px-3 min-[480px]:px-4 py-3 min-[480px]:py-3.5 text-white">
          <CardElement
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  color: '#ffffff',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '15px',
                  '::placeholder': { color: '#7b8794' },
                },
                invalid: { color: '#f87171' },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

const defaultShippingForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'United States',
};

const COUNTRY_OPTIONS = ['United States', 'Canada', 'Mexico'];

const STATE_OPTIONS_BY_COUNTRY = {
  'United States': [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida',
    'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
    'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska',
    'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas',
    'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
  ],
  Canada: [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Nova Scotia',
    'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan',
  ],
  Mexico: [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Coahuila',
    'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Mexico City', 'Mexico State',
    'Michoacan', 'Morelos', 'Nayarit', 'Nuevo Leon', 'Oaxaca', 'Puebla', 'Queretaro', 'Quintana Roo',
    'San Luis Potosi', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatan', 'Zacatecas',
  ],
};

const mapAddressToForm = (entry = {}) => {
  const fullName = String(entry.fullName || '').trim();
  const parts = fullName.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || '';
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';

  return {
    firstName,
    lastName,
    email: entry.email || '',
    phone: entry.phone || '',
    addressLine1: entry.addressLine1 || '',
    addressLine2: entry.addressLine2 || '',
    city: entry.city || '',
    state: entry.state || '',
    zipCode: entry.zipCode || '',
    country: entry.country || 'United States',
  };
};

const SHIPPING_REQUIRED_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'addressLine1', 'city', 'state', 'zipCode', 'country'];

const SHIPPING_FIELD_LABELS = {
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email Address',
  phone: 'Phone Number',
  addressLine1: 'Street Address',
  city: 'City',
  state: 'State/Province',
  zipCode: 'Zip Code',
  country: 'Country',
};

const SAVED_ADDRESS_REQUIRED_FIELDS = ['fullName', 'email', 'phone', 'addressLine1', 'city', 'state', 'zipCode', 'country'];

const SAVED_ADDRESS_FIELD_LABELS = {
  fullName: 'Full Name',
  email: 'Email Address',
  phone: 'Phone Number',
  addressLine1: 'Street Address',
  city: 'City',
  state: 'State/Province',
  zipCode: 'Zip Code',
  country: 'Country',
};

const CartView = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [cartItems, setCartItems] = useState(() => getCartItems());
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscountAmount, setCouponDiscountAmount] = useState(0);
  const [couponAppliedCode, setCouponAppliedCode] = useState('');
  const [couponError, setCouponError] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [selectedShipping, setSelectedShipping] = useState({ name: 'Standard Delivery', cost: 0 });
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [addressSource, setAddressSource] = useState('saved');
  const [shippingForm, setShippingForm] = useState(defaultShippingForm);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [stripeContext, setStripeContext] = useState({ stripe: null, elements: null });
  const [checkoutError, setCheckoutError] = useState('');
  const [processing, setProcessing] = useState(false);

  const changeQty = (id, delta) => {
    const current = cartItems.find((item) => item.id === id);
    const nextQty = Math.max(1, Math.min(99, Number(current?.qty || 1) + delta));
    const updated = updateCartItemQty(id, nextQty);
    setCartItems(updated);
  };

  const removeItem = (id) => {
    setCartItems(removeFromCart(id));
  };

  const saveForLater = (item) => {
    toggleWishlistItem(item);
    setCartItems(removeFromCart(item.id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const discount = couponApplied ? Number(couponDiscountAmount || 0) : 0;
  const tax = (subtotal - discount + selectedShipping.cost) * 0.075;
  const total = subtotal - discount + selectedShipping.cost + tax;

  const selectedAddressEntry = addresses.find((entry) => entry.id === selectedAddressId) || null;
  const selectedAddressForm = mapAddressToForm(selectedAddressEntry || {});
  const activeShippingForm = addressSource === 'saved'
    ? selectedAddressForm
    : shippingForm;
  const stateOptions = STATE_OPTIONS_BY_COUNTRY[activeShippingForm.country] || [];

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setAddressesLoading(true);
        setAddressesError('');
        const payload = await getMyAddresses();
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.addresses)
            ? payload.addresses
            : Array.isArray(payload?.data)
              ? payload.data
              : [];

        const normalized = list
          .filter((entry) => entry && entry.id)
          .map((entry) => ({
            ...entry,
            fullName: entry.fullName || entry.name || 'Saved Address',
            addressLine1: entry.addressLine1 || entry.line1 || '',
            city: entry.city || '',
            email: entry.email || '',
          }));

        setAddresses(normalized);
        const defaultAddress = normalized.find((entry) => entry.isDefault) || normalized[0];
        setSelectedAddressId((prev) => {
          if (prev && normalized.some((entry) => entry.id === prev)) return prev;
          return defaultAddress?.id || '';
        });
        setAddressSource((prev) => (prev === 'manual' ? 'manual' : (defaultAddress?.id ? 'saved' : 'manual')));
      } catch {
        setAddresses([]);
        setSelectedAddressId('');
        setAddressSource('manual');
        setAddressesError('Could not load saved addresses. Please sign in again or add an address from your account page.');
      } finally {
        setAddressesLoading(false);
      }
    };

    loadAddresses();
  }, []);

  useEffect(() => {
    if (addressSource !== 'manual') return;
    const options = STATE_OPTIONS_BY_COUNTRY[shippingForm.country] || [];
    if (shippingForm.state && !options.includes(shippingForm.state)) {
      setShippingForm((prev) => ({ ...prev, state: '' }));
    }
  }, [addressSource, shippingForm.country, shippingForm.state]);

  const updateShippingField = (field, value) => {
    setShippingForm((prev) => ({ ...prev, [field]: value }));
    setCheckoutError('');
    if (addressSource !== 'manual' && field !== 'email') {
      setAddressSource('manual');
    }
  };

  const continueToPayment = () => {
    if (addressSource === 'saved') {
      if (!selectedAddressId) {
        setCheckoutError('Please select a saved shipping address before continuing to payment.');
        return;
      }

      const missingSavedFields = SAVED_ADDRESS_REQUIRED_FIELDS
        .filter((field) => !String(selectedAddressEntry?.[field] || '').trim())
        .map((field) => SAVED_ADDRESS_FIELD_LABELS[field] || field);

      if (missingSavedFields.length > 0) {
        setCheckoutError(`Your saved address is missing required fields (${missingSavedFields.join(', ')}). Please update it in Dashboard > Addresses before continuing to payment.`);
        return;
      }

      setCheckoutError('');
      goTo(3);
      return;
    }

    const missingFields = SHIPPING_REQUIRED_FIELDS
      .filter((field) => !String(shippingForm[field] || '').trim())
      .map((field) => SHIPPING_FIELD_LABELS[field] || field);

    if (missingFields.length > 0) {
      setCheckoutError(`Please fill required shipping fields: ${missingFields.join(', ')}`);
      return;
    }

    setCheckoutError('');
    goTo(3);
  };

  const applyCoupon = async () => {
    const val = couponCode.trim().toUpperCase();
    if (!val) return;
    try {
      const payload = await validateCheckoutCoupon(val, subtotal);
      setCouponApplied(true);
      setCouponAppliedCode(val);
      setCouponDiscountAmount(Number(payload?.discountAmount || 0));
      setCouponError(false);
    } catch {
      setCouponApplied(false);
      setCouponAppliedCode('');
      setCouponDiscountAmount(0);
      setCouponError(true);
      setTimeout(() => setCouponError(false), 1500);
    }
  };

  const goTo = (step) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const placeOrder = async () => {
    if (!cartItems.length) {
      setCheckoutError('Your cart is empty. Add items before placing the order.');
      return;
    }

    const invalidItem = cartItems.find((item) => !item.productId);
    if (invalidItem) {
      setCheckoutError('One or more cart items are missing a product id. Refresh the cart and try again.');
      return;
    }

    if (!['card', 'stripe'].includes(selectedPayment)) {
      setCheckoutError('Only Stripe card payments are currently supported.');
      return;
    }

    if (addressSource === 'manual' && !String(shippingForm.email || '').trim()) {
      setCheckoutError('Please enter your email address in shipping details before placing the order.');
      return;
    }

    const manualRequired = ['firstName', 'lastName', 'phone', 'addressLine1', 'city', 'state', 'zipCode', 'country'];
    const missingManualField = manualRequired.find((field) => !String(shippingForm[field] || '').trim());

    const shippingMethod = selectedShipping.name.includes('Next Day')
      ? 'next_day'
      : selectedShipping.name.includes('Express')
        ? 'express'
        : 'free';

    try {
      setProcessing(true);
      setCheckoutError('');

      let orderAddressId = selectedAddressId;

      if (addressSource === 'saved') {
        if (!orderAddressId) {
          throw new Error('Choose a saved shipping address before placing the order.');
        }

        const missingSavedFields = SAVED_ADDRESS_REQUIRED_FIELDS
          .filter((field) => !String(selectedAddressEntry?.[field] || '').trim())
          .map((field) => SAVED_ADDRESS_FIELD_LABELS[field] || field);

        if (missingSavedFields.length > 0) {
          throw new Error(`Your saved address is missing required fields (${missingSavedFields.join(', ')}). Please update it in Dashboard > Addresses and try again.`);
        }
      } else {
        if (missingManualField) {
          throw new Error('Please fill all required shipping address fields.');
        }

        const createdAddress = await createMyAddress({
          type: 'other',
          fullName: `${shippingForm.firstName} ${shippingForm.lastName}`.trim(),
          email: shippingForm.email.trim(),
          phone: shippingForm.phone.trim(),
          addressLine1: shippingForm.addressLine1.trim(),
          addressLine2: shippingForm.addressLine2.trim() || undefined,
          city: shippingForm.city.trim(),
          state: shippingForm.state.trim(),
          zipCode: shippingForm.zipCode.trim(),
          country: shippingForm.country.trim(),
          isDefault: false,
        });

        if (!createdAddress?.id) {
          throw new Error('Unable to create shipping address from the entered details.');
        }

        setAddresses((prev) => {
          const exists = prev.some((entry) => entry.id === createdAddress.id);
          return exists ? prev : [createdAddress, ...prev];
        });
        setSelectedAddressId(createdAddress.id);
        orderAddressId = createdAddress.id;
      }

      const paymentIntent = await createCheckoutPaymentIntent(total, 'usd', {
        source: 'web-cart-checkout',
        paymentMethod: selectedPayment,
      });

      const order = await placeCheckoutOrder({
        addressId: orderAddressId,
        paymentIntentId: paymentIntent.intentId,
        shippingMethod,
        couponCode: couponAppliedCode || undefined,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: Number(item.qty || 1),
        })),
      });

      const { stripe, elements } = stripeContext;
      if (!stripe || !elements) {
        throw new Error('Payment system failed to initialize. Please reload the page and try again.');
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card input is not ready. Please reload the page and try again.');
      }

      const confirmation = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName || undefined,
          },
        },
      });

      if (confirmation.error) {
        throw new Error(handleStripeConfirmationError(confirmation));
      }

      if (!confirmation.paymentIntent || !['succeeded', 'processing'].includes(confirmation.paymentIntent.status)) {
        throw new Error('Your payment was not completed. Please try again.');
      }

      if (confirmation.paymentIntent.status === 'succeeded') {
        await confirmCheckoutPayment(paymentIntent.intentId, order?.id);
      }

      setPlacedOrderId(order?.id || '');
      clearCart();
      setCartItems([]);
      goTo(4);
    } catch (error) {
      // Use standard payment error messages instead of raw API errors
      const standardMessage = handlePaymentError(error);
      setCheckoutError(standardMessage);
    } finally {
      setProcessing(false);
    }
  };

  const steps = [
    { num: 1, label: 'Cart' },
    { num: 2, label: 'Shipping' },
    { num: 3, label: 'Payment' },
    { num: 4, label: 'Confirm' },
  ];

  const shippingOptions = [
    { name: 'Standard Delivery', days: '5–7 business days', cost: 0 },
    { name: 'Express Delivery', days: '2–3 business days', cost: 7.99 },
    { name: '⚡ Next Day Delivery', days: 'Tomorrow by 8 PM', cost: 19.99 },
  ];

  const paymentMethods = [
    {
      id: 'card',
      icon: '\u{1F4B3}',
      name: 'Credit / Debit Card',
      desc: 'Visa, Mastercard, Amex, Discover',
      supported: true,
      logos: [
        { src: 'https://media.assettype.com/sunstar/2025-11-12/8w4ntbmy/visa-logo-800x450.webp?w=1200&h=675&auto=format%2Ccompress&fit=max&enlarge=true', alt: 'Visa' },
        { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/250px-MasterCard_Logo.svg.png', alt: 'Mastercard' },
        { src: '/img/payments/american-express.svg', alt: 'American Express' },
        { src: '/img/payments/discover.svg', alt: 'Discover' },
      ],
    },
    {
      id: 'stripe',
      icon: '\u26A1',
      name: 'Stripe Pay',
      desc: 'Fast, secure one-click payment',
      supported: true,
      logos: [{ src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc_b7cYDTEaXxYsRDAdsVXYknigIr16CNbZQ&s', alt: 'Stripe' }],
    },
    {
      id: 'paypal',
      icon: '\u{1F17F}\uFE0F',
      name: 'PayPal',
      desc: 'Pay with your PayPal account (Coming soon)',
      supported: false,
      logos: [{ src: 'https://www.top-bank.ch/images/logo_540/paypal.png', alt: 'PayPal' }],
    },
    {
      id: 'apple',
      icon: '\u{1F34E}',
      name: 'Apple Pay',
      desc: 'Touch ID / Face ID payment (Coming soon)',
      supported: false,
      logos: [{ src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Apple_Pay_logo.svg/960px-Apple_Pay_logo.svg.png', alt: 'Apple' }],
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Progress Bar */}
      <div className="bg-navy2 border-b border-white/[0.07] px-3 py-3 min-[480px]:px-4 min-[640px]:px-8">
        <div className=" flex container mx-auto items-center overflow-x-auto">
          {steps.map((step, i) => (
            <React.Fragment key={step.num}>
              <div className="flex items-center gap-1 min-[480px]:gap-2 shrink-0">
                <div
                  className={`flex h-6 w-6 min-[480px]:h-7 min-[480px]:w-7 shrink-0 items-center justify-center rounded-full font-['Syne'] text-[0.65rem] min-[480px]:text-xs font-bold transition-all ${
                    currentStep > step.num
                      ? 'border-teal bg-teal/10 text-teal border-2'
                      : currentStep === step.num
                        ? 'border-teal bg-teal text-navy border-2'
                        : 'text-gray border-2 border-white/[0.07]'
                  }`}
                >
                  {currentStep > step.num ? '✓' : step.num}
                </div>
                <span
                  className={`text-[0.65rem] min-[480px]:text-[0.72rem] min-[640px]:text-[0.78rem] font-medium transition-colors ${
                    currentStep >= step.num ? 'text-teal' : 'text-gray'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-1 min-[480px]:mx-2 h-px flex-1 transition-colors ${
                    currentStep > step.num ? 'bg-teal' : 'bg-white/[0.07]'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Layout */}
      <div
        className={`mx-auto container gap-6 min-[900px]:gap-8 px-3 min-[480px]:px-4 min-[640px]:px-8 py-6 min-[640px]:py-8 ${
          currentStep === 4
            ? 'block'
            : 'grid grid-cols-1 items-start min-[1024px]:grid-cols-[1fr_380px]'
        }`}
      >
        {/* Left Column */}
        <div>
          {/* Step 1: Cart */}
          {currentStep === 1 && (
            <div className="animate-fadeUp">
              <div className="bg-card mb-4 min-[640px]:mb-5 overflow-hidden rounded-md border border-white/[0.07]">
                <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between border-b border-white/[0.07] px-4 min-[480px]:px-5 py-3 min-[480px]:py-4 gap-2 min-[480px]:gap-0">
                  <h2 className="font-['Syne'] text-sm min-[480px]:text-base font-bold text-white">
                    🛒 Your Cart{' '}
                    <span className="text-gray text-xs min-[480px]:text-sm font-normal">({totalQty} items)</span>
                  </h2>
                  {subtotal > 50 && (
                    <span className="border-teal/25 bg-teal/10 text-teal inline-flex items-center gap-1 min-[480px]:gap-1.5 rounded-full border px-2 min-[480px]:px-2.5 py-0.5 min-[480px]:py-1 text-[0.65rem] min-[480px]:text-[0.72rem] whitespace-nowrap">
                      Free shipping on this order!
                    </span>
                  )}
                </div>
                <div className="px-3 min-[480px]:px-5 py-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col min-[480px]:grid min-[480px]:grid-cols-[60px_1fr_auto] min-[640px]:grid-cols-[72px_1fr_auto] gap-3 min-[480px]:gap-4 border-b border-white/[0.07] py-3 min-[480px]:py-4 first:pt-0 last:border-b-0 last:pb-0"
                    >
                      <div className="bg-navy3 flex h-14 min-[480px]:h-16 min-[640px]:h-18 w-14 min-[480px]:w-16 min-[640px]:w-18 shrink-0 items-center justify-center overflow-hidden rounded text-lg min-[480px]:text-xl min-[640px]:text-[2rem]">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          item.icon
                        )}
                      </div>
                      <div>
                        <div className="text-teal mb-0.5 text-[0.6rem] min-[480px]:text-[0.65rem] font-bold tracking-widest uppercase">
                          {item.store}
                        </div>
                        <div className="mb-1 text-[0.75rem] min-[480px]:text-[0.9rem] leading-snug font-medium text-white">
                          {item.name}
                        </div>
                        <div className="text-gray text-[0.65rem] min-[480px]:text-[0.75rem]">{item.variant}</div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 min-[480px]:gap-2">
                          <div className="flex overflow-hidden rounded border border-white/[0.07]">
                            <button
                              onClick={() => changeQty(item.id, -1)}
                              className="bg-navy3 hover:bg-navy2 flex h-6 w-6 min-[480px]:h-7 min-[480px]:w-7 items-center justify-center text-[0.8rem] min-[480px]:text-[0.9rem] text-white transition-colors"
                            >
                              −
                            </button>
                            <input
                              type="text"
                              value={item.qty}
                              readOnly
                              className="h-6 w-8 min-[480px]:h-7 min-[480px]:w-9 border-none bg-transparent text-center font-['DM_Sans'] text-[0.75rem] min-[480px]:text-[0.85rem] text-white outline-none"
                            />
                            <button
                              onClick={() => changeQty(item.id, 1)}
                              className="bg-navy3 hover:bg-navy2 flex h-6 w-6 min-[480px]:h-7 min-[480px]:w-7 items-center justify-center text-[0.8rem] min-[480px]:text-[0.9rem] text-white transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => saveForLater(item)}
                            className="text-gray hover:text-teal bg-transparent px-1.5 min-[480px]:px-2 py-0.5 min-[480px]:py-1 text-[0.65rem] min-[480px]:text-[0.78rem] transition-colors whitespace-nowrap"
                          >
                            ♡ Save
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray hover:text-red bg-transparent px-1.5 min-[480px]:px-2 py-0.5 min-[480px]:py-1 text-[0.65rem] min-[480px]:text-[0.78rem] transition-colors whitespace-nowrap"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-['Syne'] text-sm min-[480px]:text-base font-bold text-white">
                          ${(item.price * item.qty).toFixed(2)}
                        </div>
                        <div className="text-gray mt-0.5 text-[0.65rem] min-[480px]:text-[0.75rem] line-through">
                          ${(item.old * item.qty).toFixed(2)}
                        </div>
                        <div className="text-red mt-0.5 text-[0.6rem] min-[480px]:text-[0.7rem]">-{item.off}%</div>
                      </div>
                    </div>
                  ))}

                  {/* Coupon */}
                  <div className="mt-3 min-[480px]:mt-4 border-t border-white/[0.07] pt-3 min-[480px]:pt-4">
                    <div className="text-gray2 mb-2 text-[0.75rem] min-[480px]:text-[0.82rem] font-medium">
                      🏷 Have a coupon code?
                    </div>
                    <div className="flex flex-col min-[480px]:flex-row gap-2 min-[480px]:gap-3">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className={`bg-navy3 placeholder:text-gray flex-1 rounded px-3 min-[480px]:px-4 py-2 min-[480px]:py-2.5 font-['DM_Sans'] text-[0.8rem] min-[480px]:text-[0.85rem] text-white transition-colors outline-none ${
                          couponError
                            ? 'border-red border'
                            : 'focus:border-teal border border-white/[0.07]'
                        }`}
                      />
                      <button
                        onClick={applyCoupon}
                        className="bg-navy3 text-teal hover:border-teal hover:bg-teal/10 rounded border border-white/[0.07] px-4 min-[480px]:px-5 py-2 min-[480px]:py-2.5 font-['DM_Sans'] text-[0.75rem] min-[480px]:text-[0.82rem] font-medium whitespace-nowrap transition-all"
                      >
                        Apply
                      </button>
                    </div>
                    {couponApplied && (
                      <div className="mt-2 flex items-center gap-1.5 text-[0.7rem] min-[480px]:text-[0.78rem] text-green-500">
                        ✓ Coupon <strong>{couponAppliedCode}</strong> applied — ${discount.toFixed(2)} off!
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {!cartItems.length ? (
                <div className="rounded border border-white/[0.07] bg-navy3 p-5 text-center">
                  <div className="text-white text-base font-semibold">Your cart is empty</div>
                  <div className="text-gray2 mt-2 text-sm">Add products from marketplace pages to begin checkout.</div>
                  <Link to="/" className="bg-teal text-navy hover:bg-teal2 mt-4 inline-block rounded px-4 py-2 text-sm font-medium no-underline">
                    Continue Shopping
                  </Link>
                </div>
              ) : null}

              <div className="flex flex-col min-[640px]:flex-row justify-end">
                <button
                  onClick={() => goTo(2)}
                  disabled={!cartItems.length}
                  className="bg-teal text-navy hover:bg-teal2 w-full min-[640px]:w-auto rounded px-4 min-[640px]:px-6 py-3 font-['DM_Sans'] text-[0.8rem] min-[640px]:text-[0.85rem] font-medium transition-all hover:-translate-y-0.5"
                >
                  Continue to Shipping →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Shipping */}
          {currentStep === 2 && (
            <div className="animate-fadeUp">
              <div className="bg-card mb-4 min-[640px]:mb-5 overflow-hidden rounded-md border border-white/[0.07]">
                <div className="border-b border-white/[0.07] px-4 min-[480px]:px-5 py-3 min-[480px]:py-4">
                  <h2 className="font-['Syne'] text-sm min-[480px]:text-base font-bold text-white">
                    📦 Shipping Address
                  </h2>
                </div>
                <div className="px-4 min-[480px]:px-5 py-4 min-[480px]:py-5">
                  <div className="grid grid-cols-1 gap-3 min-[480px]:gap-4 min-[580px]:grid-cols-2">
                    <div className="col-span-full flex flex-col gap-1.5">
                      <label className="text-gray text-[0.7rem] min-[480px]:text-[0.75rem] font-medium tracking-widest uppercase">
                        Address Source
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!addresses.length) {
                              setCheckoutError('No saved addresses found. Enter a new address or add one from your account page.');
                              return;
                            }
                            setAddressSource('saved');
                            setCheckoutError('');
                          }}
                          disabled={processing}
                          className={`rounded border px-3 py-2 text-[0.75rem] transition-colors ${
                            addressSource === 'saved'
                              ? 'border-teal bg-teal/10 text-teal'
                              : 'border-white/[0.07] bg-navy3 text-gray2 hover:border-teal/40'
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          Use Saved Address
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddressSource('manual');
                            setCheckoutError('');
                          }}
                          disabled={processing}
                          className={`rounded border px-3 py-2 text-[0.75rem] transition-colors ${
                            addressSource === 'manual'
                              ? 'border-teal bg-teal/10 text-teal'
                              : 'border-white/[0.07] bg-navy3 text-gray2 hover:border-teal/40'
                          }`}
                        >
                          Enter New Address
                        </button>
                      </div>
                    </div>
                    {addressSource === 'saved' && (
                      <div className="col-span-full flex flex-col gap-1.5">
                        <label className="text-gray text-[0.7rem] min-[480px]:text-[0.75rem] font-medium tracking-widest uppercase">
                          Saved Address
                        </label>
                        <select
                          value={selectedAddressId}
                          onChange={(e) => {
                            setSelectedAddressId(e.target.value);
                            setAddressSource('saved');
                            setCheckoutError('');
                          }}
                          disabled={addressesLoading || processing}
                          className="bg-navy3 focus:border-teal rounded border border-white/[0.07] px-3 min-[480px]:px-4 py-2.5 min-[480px]:py-3 text-[0.8rem] min-[480px]:text-[0.88rem] text-white transition-colors outline-none"
                        >
                          <option value="">
                            {addressesLoading
                              ? 'Loading saved addresses...'
                              : addresses.length
                                ? 'Select a saved address'
                                : 'No saved addresses found'}
                          </option>
                          {addresses.map((entry) => (
                            <option key={entry.id} value={entry.id}>
                              {entry.fullName} - {entry.addressLine1}, {entry.city}
                            </option>
                          ))}
                        </select>
                        {addressesError ? (
                          <p className="text-red text-[0.72rem]">{addressesError}</p>
                        ) : null}
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray text-[0.7rem] min-[480px]:text-[0.75rem] font-medium tracking-widest uppercase">
                        First Name
                      </label>
                      <input
                        value={activeShippingForm.firstName}
                        onChange={(e) => updateShippingField('firstName', e.target.value)}
                        disabled={processing || addressSource === 'saved'}
                        className="bg-navy3 placeholder:text-gray focus:border-teal rounded border border-white/[0.07] px-3 min-[480px]:px-4 py-2.5 min-[480px]:py-3 text-[0.8rem] min-[480px]:text-[0.88rem] text-white transition-colors outline-none"
                        placeholder="John"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray text-[0.7rem] min-[480px]:text-[0.75rem] font-medium tracking-widest uppercase">
                        Last Name
                      </label>
                      <input
                        value={activeShippingForm.lastName}
                        onChange={(e) => updateShippingField('lastName', e.target.value)}
                        disabled={processing || addressSource === 'saved'}
                        className="bg-navy3 placeholder:text-gray focus:border-teal rounded border border-white/[0.07] px-3 min-[480px]:px-4 py-2.5 min-[480px]:py-3 text-[0.8rem] min-[480px]:text-[0.88rem] text-white transition-colors outline-none"
                        placeholder="Doe"
                      />
                    </div>
                    <div className="col-span-full flex flex-col gap-1.5">
                      <label className="text-gray text-[0.7rem] min-[480px]:text-[0.75rem] font-medium tracking-widest uppercase">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="shippingEmail"
                        autoComplete="email"
                        inputMode="email"
                        value={activeShippingForm.email}
                        onChange={(e) => updateShippingField('email', e.target.value)}
                        disabled={processing || addressSource === 'saved'}
                        className="bg-navy3 placeholder:text-gray focus:border-teal rounded border border-white/[0.07] px-3 min-[480px]:px-4 py-2.5 min-[480px]:py-3 text-[0.8rem] min-[480px]:text-[0.88rem] text-white transition-colors outline-none"
                        placeholder="Enter email for order updates"
                      />
                    </div>
                    <div className="col-span-full flex flex-col gap-1.5">
                      <label className="text-gray text-[0.7rem] min-[480px]:text-[0.75rem] font-medium tracking-widest uppercase">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={activeShippingForm.phone}
                        onChange={(e) => updateShippingField('phone', e.target.value)}
                        disabled={processing || addressSource === 'saved'}
                        className="bg-navy3 placeholder:text-gray focus:border-teal rounded border border-white/[0.07] px-3 min-[480px]:px-4 py-2.5 min-[480px]:py-3 text-[0.8rem] min-[480px]:text-[0.88rem] text-white transition-colors outline-none"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="col-span-full flex flex-col gap-1.5">
                      <label className="text-gray text-[0.7rem] min-[480px]:text-[0.75rem] font-medium tracking-widest uppercase">
                        Street Address
                      </label>
                      <input
                        value={activeShippingForm.addressLine1}
                        onChange={(e) => updateShippingField('addressLine1', e.target.value)}
                        disabled={processing || addressSource === 'saved'}
                        className="bg-navy3 placeholder:text-gray focus:border-teal rounded border border-white/[0.07] px-3 min-[480px]:px-4 py-2.5 min-[480px]:py-3 text-[0.8rem] min-[480px]:text-[0.88rem] text-white transition-colors outline-none"
                        placeholder="123 Main Street, Apt 4B"
                      />
                    </div>
                    <div className="col-span-full flex flex-col gap-1.5">
                      <label className="text-gray text-[0.7rem] min-[480px]:text-[0.75rem] font-medium tracking-widest uppercase">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        value={activeShippingForm.addressLine2}
                        onChange={(e) => updateShippingField('addressLine2', e.target.value)}
                        disabled={processing || addressSource === 'saved'}
                        className="bg-navy3 placeholder:text-gray focus:border-teal rounded border border-white/[0.07] px-3 min-[480px]:px-4 py-2.5 min-[480px]:py-3 text-[0.8rem] min-[480px]:text-[0.88rem] text-white transition-colors outline-none"
                        placeholder="Building, suite, landmark..."
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray text-[0.7rem] min-[480px]:text-[0.75rem] font-medium tracking-widest uppercase">
                        City
                      </label>
                      <input
                        value={activeShippingForm.city}
                        onChange={(e) => updateShippingField('city', e.target.value)}
                        disabled={processing || addressSource === 'saved'}
                        className="bg-navy3 placeholder:text-gray focus:border-teal rounded border border-white/[0.07] px-3 min-[480px]:px-4 py-2.5 min-[480px]:py-3 text-[0.8rem] min-[480px]:text-[0.88rem] text-white transition-colors outline-none"
                        placeholder="Savage"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray text-[0.7rem] min-[480px]:text-[0.75rem] font-medium tracking-widest uppercase">
                        State
                      </label>
                      {addressSource === 'saved' ? (
                        <input
                          value={activeShippingForm.state}
                          disabled
                          className="bg-navy3 placeholder:text-gray focus:border-teal rounded border border-white/[0.07] px-3 min-[480px]:px-4 py-2.5 min-[480px]:py-3 text-[0.8rem] min-[480px]:text-[0.88rem] text-white transition-colors outline-none"
                          placeholder="State/Province"
                        />
                      ) : (
                        <select
                          value={activeShippingForm.state}
                          onChange={(e) => updateShippingField('state', e.target.value)}
                          disabled={processing}
                          className="bg-navy3 focus:border-teal rounded border border-white/[0.07] px-3 min-[480px]:px-4 py-2.5 min-[480px]:py-3 text-[0.8rem] min-[480px]:text-[0.88rem] text-white transition-colors outline-none"
                        >
                          <option value="">Select state/province</option>
                          {stateOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray text-[0.7rem] min-[480px]:text-[0.75rem] font-medium tracking-widest uppercase">
                        Zip Code
                      </label>
                      <input
                        value={activeShippingForm.zipCode}
                        onChange={(e) => updateShippingField('zipCode', e.target.value)}
                        disabled={processing || addressSource === 'saved'}
                        className="bg-navy3 placeholder:text-gray focus:border-teal rounded border border-white/[0.07] px-3 min-[480px]:px-4 py-2.5 min-[480px]:py-3 text-[0.8rem] min-[480px]:text-[0.88rem] text-white transition-colors outline-none"
                        placeholder="55378"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray text-[0.7rem] min-[480px]:text-[0.75rem] font-medium tracking-widest uppercase">
                        Country
                      </label>
                      <select
                        value={activeShippingForm.country}
                        onChange={(e) => updateShippingField('country', e.target.value)}
                        disabled={processing || addressSource === 'saved'}
                        className="bg-navy3 focus:border-teal rounded border border-white/[0.07] px-3 min-[480px]:px-4 py-2.5 min-[480px]:py-3 text-[0.8rem] min-[480px]:text-[0.88rem] text-white transition-colors outline-none"
                      >
                        {COUNTRY_OPTIONS.map((country) => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <h3 className="mt-4 min-[480px]:mt-5 mb-2 min-[480px]:mb-3 font-['Syne'] text-[0.75rem] min-[480px]:text-[0.85rem] font-bold tracking-wide text-white">
                    🚚 Shipping Method
                  </h3>
                  <div className="flex flex-col gap-2 min-[480px]:gap-2.5">
                    {shippingOptions.map((opt) => (
                      <div
                        key={opt.name}
                        onClick={() => setSelectedShipping(opt)}
                        className={`flex cursor-pointer items-center gap-3 rounded border px-3 min-[480px]:px-4 py-2.5 min-[480px]:py-3 transition-colors ${
                          selectedShipping.name === opt.name
                            ? 'border-teal bg-teal/5'
                            : 'bg-navy3 hover:border-teal/30 border-white/[0.07]'
                        }`}
                      >
                        <div
                          className={`flex h-3 w-3 min-[480px]:h-3.5 min-[480px]:w-3.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            selectedShipping.name === opt.name ? 'border-teal' : 'border-gray'
                          }`}
                        >
                          {selectedShipping.name === opt.name && (
                            <div className="bg-teal h-1 w-1 min-[480px]:h-1.5 min-[480px]:w-1.5 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[0.75rem] min-[480px]:text-[0.85rem] font-medium text-white">{opt.name}</div>
                          <div className="text-gray text-[0.65rem] min-[480px]:text-[0.72rem]">{opt.days}</div>
                        </div>
                        <div
                          className={`text-[0.75rem] min-[480px]:text-[0.85rem] font-medium whitespace-nowrap ${opt.cost === 0 ? 'text-green-500' : 'text-white'}`}
                        >
                          {opt.cost === 0 ? 'FREE' : `$${opt.cost.toFixed(2)}`}
                        </div>
                      </div>
                    ))}
                  </div>

                  {checkoutError ? (
                    <div className="mt-4 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {checkoutError}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-col min-[480px]:flex-row justify-between gap-2 min-[480px]:gap-3">
                <button
                  onClick={() => goTo(1)}
                  className="hover:border-teal hover:text-teal rounded border border-white/[0.07] bg-transparent px-4 min-[480px]:px-6 py-2.5 min-[480px]:py-3 text-[0.8rem] min-[480px]:text-[0.85rem] text-white transition-all order-2 min-[480px]:order-1"
                >
                  ← Back to Cart
                </button>
                <button
                  onClick={continueToPayment}
                  className="bg-teal text-navy hover:bg-teal2 rounded px-4 min-[480px]:px-6 py-2.5 min-[480px]:py-3 text-[0.8rem] min-[480px]:text-[0.85rem] font-medium transition-all hover:-translate-y-0.5 order-1 min-[480px]:order-2"
                >
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <div className="animate-fadeUp">
              <div className="bg-card mb-4 min-[640px]:mb-5 overflow-hidden rounded-md border border-white/[0.07]">
                <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between border-b border-white/[0.07] px-4 min-[480px]:px-5 py-3 min-[480px]:py-4 gap-2 min-[480px]:gap-0">
                  <h2 className="font-['Syne'] text-sm min-[480px]:text-base font-bold text-white flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-white" />
                    Payment Details
                  </h2>
                  <span className="border-teal/25 bg-teal/10 text-teal inline-flex items-center gap-1 min-[480px]:gap-1.5 rounded border px-2 min-[480px]:px-2.5 py-0.5 min-[480px]:py-1 text-[0.65rem] min-[480px]:text-[0.72rem] whitespace-nowrap">
                    <Lock className="h-3 w-3" />
                    <span>TLS Encrypted</span>
                  </span>
                </div>
                <div className="px-4 min-[480px]:px-5 py-4 min-[480px]:py-5">
                  <div className="mb-4 min-[480px]:mb-5 flex flex-col gap-2.5 min-[480px]:gap-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        onClick={() => {
                          if (method.supported) setSelectedPayment(method.id);
                        }}
                        className={`flex items-center gap-1 min-[480px]:gap-2 rounded border px-3 min-[480px]:px-4 py-3 min-[480px]:py-3.5 transition-all ${
                          method.supported ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                        } ${
                          selectedPayment === method.id && method.supported
                            ? 'border-teal bg-teal/10'
                            : 'bg-navy3 hover:border-teal/30 border-white/[0.07]'
                        }`}
                      >
                        <div
                          className={`flex h-3.5 w-3.5 min-[480px]:h-4 min-[480px]:w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            selectedPayment === method.id && method.supported ? 'border-teal' : 'border-gray'
                          }`}
                        >
                          {selectedPayment === method.id && method.supported && (
                            <div className="bg-teal h-1.5 w-1.5 min-[480px]:h-2 min-[480px]:w-2 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[0.8rem] min-[480px]:text-[0.88rem] font-medium text-white">{method.name}</div>
                          <div className="text-gray text-[0.65rem] min-[480px]:text-[0.72rem]">{method.desc}</div>
                        </div>
                        {method.logos.length > 0 && (
                          <div className="ml-auto hidden min-[480px]:flex gap-2 items-center">
                            {method.logos.map((logo, idx) => (
                              <div
                                key={logo.alt || idx}
                                className="bg-white rounded-sm p-1 border border-white/[0.06] flex items-center justify-center h-6 w-12"
                              >
                                <img
                                  src={logo.src || logo}
                                  alt={logo.alt || `logo-${idx}`}
                                  className="max-h-full max-w-full object-contain"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {['card', 'stripe'].includes(selectedPayment) && (
                    stripePromise ? (
                      <Elements stripe={stripePromise}>
                        <CardPaymentForm
                          cardholderName={cardholderName}
                          setCardholderName={setCardholderName}
                          setStripeContext={setStripeContext}
                        />
                      </Elements>
                    ) : (
                      <div className="rounded border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
                        Stripe is not configured yet. Add VITE_STRIPE_PUBLIC_KEY to the frontend env file.
                      </div>
                    )
                  )}

                  {checkoutError && (
                    <div className="mt-4 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {checkoutError}
                    </div>
                  )}

                  <div className="bg-navy3 text-gray mt-4 min-[480px]:mt-5 flex items-center gap-2 rounded border border-white/[0.07] px-3 min-[480px]:px-4 py-2.5 min-[480px]:py-3 text-[0.7rem] min-[480px]:text-[0.78rem]">
                    <Lock className="h-4 w-4 text-teal" />
                    <span>Your payment is secured and encrypted. We never store your card details.</span>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-card mb-4 min-[640px]:mb-5 overflow-hidden rounded-md border border-white/[0.07]">
                <div className="border-b border-white/[0.07] px-4 min-[480px]:px-5 py-3 min-[480px]:py-4">
                  <h2 className="font-['Syne'] text-sm min-[480px]:text-base font-bold text-white flex items-center gap-2">
                    <Home className="h-4 w-4 text-white" />
                    Billing Address
                  </h2>
                </div>
                <div className="px-4 min-[480px]:px-5 py-3 min-[480px]:py-4">
                  <label className="flex cursor-pointer items-center gap-2.5 text-[0.8rem] min-[480px]:text-[0.85rem] text-white">
                    <input type="checkbox" defaultChecked className="accent-teal h-4 w-4" />
                    Same as shipping address
                  </label>
                </div>
              </div>

              <div className="flex flex-col min-[480px]:flex-row justify-between gap-2 min-[480px]:gap-3">
                <button
                  onClick={() => goTo(2)}
                  disabled={processing}
                  className="hover:border-teal hover:text-teal rounded border border-white/[0.07] bg-transparent px-4 min-[480px]:px-6 py-2.5 min-[480px]:py-3 text-[0.8rem] min-[480px]:text-[0.85rem] text-white transition-all order-2 min-[480px]:order-1"
                >
                  ← Back to Shipping
                </button>
                <button
                  onClick={placeOrder}
                  disabled={processing}
                  className="bg-teal text-navy hover:bg-teal2 rounded px-4 min-[480px]:px-6 py-2.5 min-[480px]:py-3 text-[0.8rem] min-[480px]:text-[0.85rem] font-medium transition-all hover:-translate-y-0.5 order-1 min-[480px]:order-2"
                >
                  {processing ? '⏳ Processing...' : 'Place Order →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 4 && (
            <div className="col-span-full animate-fadeUp py-8 min-[640px]:py-16 px-4 min-[640px]:px-0 text-center">
              <div className="animate-pop text-[3rem] min-[480px]:text-[4rem] min-[640px]:text-[5rem]">✅</div>
              <h1 className="mb-2 min-[480px]:mb-3 font-['Syne'] text-xl min-[480px]:text-2xl min-[640px]:text-[2rem] font-extrabold text-white">
                Order Placed!
              </h1>
              <p className="text-gray mx-auto mb-6 min-[480px]:mb-8 max-w-120 text-sm min-[480px]:text-base leading-relaxed">
                Thank you for shopping with Kulmi Market. Your order has been confirmed and is being
                processed by our merchants.
              </p>
              <div className="border-teal/30 bg-teal/10 text-teal mb-6 min-[480px]:mb-8 inline-flex items-center gap-2 min-[480px]:gap-2.5 rounded border px-4 min-[480px]:px-5 py-2 min-[480px]:py-2.5 font-['Syne'] text-sm min-[480px]:text-base font-bold">
                📦 Order #{placedOrderId || 'Pending Confirmation'}
              </div>
              <div className="flex flex-col min-[480px]:flex-row flex-wrap justify-center gap-2 min-[480px]:gap-4">
                <Link
                  to="/"
                  className="bg-teal text-navy hover:bg-teal2 rounded px-6 min-[480px]:px-8 py-2.5 min-[480px]:py-3 text-[0.8rem] min-[480px]:text-[0.85rem] font-medium no-underline transition-colors"
                >
                  Continue Shopping
                </Link>
                <button
                  onClick={() => {
                    if (placedOrderId) {
                      navigate(`/dashboard/track?id=${encodeURIComponent(placedOrderId)}`);
                    } else {
                      navigate('/dashboard/track');
                    }
                  }}
                  className="hover:border-teal hover:text-teal rounded border border-white/[0.07] bg-transparent px-6 min-[480px]:px-8 py-2.5 min-[480px]:py-3 text-[0.8rem] min-[480px]:text-[0.85rem] text-white transition-all"
                >
                  Track Your Order
                </button>
              </div>

              {/* Timeline */}
              <div className="mx-auto mt-8 min-[480px]:mt-12 max-w-100 px-4 min-[480px]:px-0 text-left">
                <h3 className="mb-4 text-center font-['Syne'] text-[0.75rem] min-[480px]:text-[0.85rem] font-bold tracking-widest text-white uppercase">
                  Order Timeline
                </h3>
                {[
                  { label: '✅ Order Confirmed', time: 'Just now', active: true },
                  { label: '📦 Merchant Processing', time: 'Within 1–2 hours', active: false },
                  { label: '🚚 Out for Delivery', time: 'Estimated 5–7 days', active: false },
                  { label: '🏠 Delivered', time: 'To your doorstep', active: false },
                ].map((item, i, arr) => (
                  <div key={i} className="mb-4 min-[480px]:mb-5 flex gap-3 min-[480px]:gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-3 w-3 min-[480px]:h-3.5 min-[480px]:w-3.5 shrink-0 rounded-full ${
                          item.active ? 'bg-teal' : 'bg-navy3 border-2 border-white/[0.07]'
                        }`}
                      />
                      {i < arr.length - 1 && (
                        <div className="min-h-6 w-px flex-1 bg-white/[0.07]" />
                      )}
                    </div>
                    <div>
                      <div className="text-[0.8rem] min-[480px]:text-[0.85rem] font-medium text-white">{item.label}</div>
                      <div className="text-gray text-[0.65rem] min-[480px]:text-[0.72rem]">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        {currentStep !== 4 && (
          <div className="bg-card sticky top-20 rounded-md border border-white/[0.07] p-3 min-[480px]:p-4 min-[640px]:p-5">
            <h3 className="mb-3 min-[480px]:mb-4 min-[640px]:mb-5 font-['Syne'] text-sm min-[480px]:text-base font-bold text-white">Order Summary</h3>
            <div className="mb-4 min-[640px]:mb-5">
              {cartItems.map((item) => (
                <div key={item.id} className="mb-2.5 min-[480px]:mb-3 flex items-center gap-2.5 min-[640px]:gap-3">
                  <div className="bg-navy3 flex h-9 min-[480px]:h-10 min-[640px]:h-11 w-9 min-[480px]:w-10 min-[640px]:w-11 shrink-0 items-center justify-center rounded text-base min-[480px]:text-lg min-[640px]:text-xl">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.7rem] min-[480px]:text-[0.75rem] min-[640px]:text-[0.8rem] leading-tight text-white truncate">{item.name}</div>
                    <div className="text-gray text-[0.6rem] min-[480px]:text-[0.65rem] min-[640px]:text-[0.72rem]">Qty: {item.qty}</div>
                  </div>
                  <div className="text-[0.75rem] min-[480px]:text-[0.8rem] min-[640px]:text-[0.85rem] font-medium whitespace-nowrap text-white">
                    ${(item.price * item.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/[0.07] pt-2.5 min-[480px]:pt-3 min-[640px]:pt-3">
              <div className="flex justify-between py-1 min-[480px]:py-1.5 text-[0.7rem] min-[480px]:text-[0.8rem] min-[640px]:text-[0.85rem]">
                <span className="text-gray">Subtotal ({totalQty} items)</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between py-1 min-[480px]:py-1.5 text-[0.7rem] min-[480px]:text-[0.8rem] min-[640px]:text-[0.85rem]">
                  <span className="text-gray">Coupon ({couponAppliedCode || 'Applied'})</span>
                  <span className="text-green-500">−${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 min-[480px]:py-1.5 text-[0.7rem] min-[480px]:text-[0.8rem] min-[640px]:text-[0.85rem]">
                <span className="text-gray">Shipping</span>
                <span className={selectedShipping.cost === 0 ? 'text-green-500' : 'text-white'}>
                  {selectedShipping.cost === 0 ? 'FREE' : `$${selectedShipping.cost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between py-1 min-[480px]:py-1.5 text-[0.7rem] min-[480px]:text-[0.8rem] min-[640px]:text-[0.85rem]">
                <span className="text-gray">Tax (7.5%)</span>
                <span className="text-white">${tax.toFixed(2)}</span>
              </div>
              <div className="mt-2 min-[480px]:mt-2.5 min-[640px]:mt-3 flex items-center justify-between border-t border-white/[0.07] pt-2.5 min-[480px]:pt-3 min-[640px]:pt-3">
                <span className="font-['Syne'] text-[0.85rem] min-[480px]:text-[0.9rem] min-[640px]:text-[0.95rem] font-bold text-white">Total</span>
                <span className="text-teal font-['Syne'] text-lg min-[480px]:text-xl min-[640px]:text-xl font-extrabold">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                if (currentStep === 1) goTo(2);
                else if (currentStep === 2) continueToPayment();
                else if (currentStep === 3) placeOrder();
              }}
              disabled={processing}
              className="bg-teal text-navy hover:bg-teal2 mt-4 min-[640px]:mt-5 w-full rounded py-3 min-[640px]:py-4 font-['Syne'] text-[0.75rem] min-[480px]:text-[0.85rem] min-[640px]:text-[0.95rem] font-bold tracking-wide transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing
                ? '⏳ Processing...'
                : currentStep === 1
                  ? 'Proceed to Shipping →'
                  : currentStep === 2
                    ? 'Continue to Payment →'
                    : 'Place Order →'}
            </button>
            <div className="text-gray mt-2.5 min-[640px]:mt-3.5 flex items-center justify-center gap-2 text-[0.65rem] min-[480px]:text-[0.7rem] min-[640px]:text-[0.72rem]">
              <Lock className="h-4 w-4" />
              <span>Secure & encrypted checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartView;
