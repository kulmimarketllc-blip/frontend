/**
 * Payment Error Handler
 * Standardizes and sanitizes payment error messages
 * No sensitive information is leaked to the user
 */

/**
 * Standard payment error messages (non-sensitive, user-friendly)
 */
const PAYMENT_ERROR_MESSAGES = {
  // Stripe-specific errors
  'card_declined': 'Your card was declined. Please try a different payment method.',
  'card_error': 'There was an issue with your card. Please check the details and try again.',
  'expired_card': 'Your card has expired. Please use a different card.',
  'incorrect_cvc': 'The CVC code is incorrect. Please check and try again.',
  'processing_error': 'Your bank declined the payment. Please contact your bank or try another payment method.',
  'rate_limit': 'Too many requests. Please wait a moment and try again.',
  
  // Generic payment errors
  'payment_failed': 'Your payment could not be processed. Please try again or use a different payment method.',
  'payment_not_completed': 'Your payment was not completed. Please try again.',
  'authentication_failed': 'Payment authentication failed. Please try again with a different card.',
  'insufficient_funds': 'Insufficient funds. Please check your account balance and try again.',
  'invalid_card': 'The card information is invalid. Please check and try again.',
  
  // Network/API errors
  'network_error': 'Network connection issue. Please check your internet and try again.',
  'timeout_error': 'The request took too long. Please try again.',
  'server_error': 'A server error occurred. Please try again later.',
  
  // Stripe initialization errors
  'stripe_initialization_failed': 'Payment system failed to initialize. Please reload the page and try again.',
  'card_element_not_ready': 'Card input is not ready. Please reload the page and try again.',
  
  // Payout errors
  'payout_min_amount': 'Minimum payout amount is $20. Please enter a higher amount.',
  'payout_insufficient_balance': 'You do not have sufficient balance for this payout amount. Please request a lower amount.',
  'payout_stripe_limit': 'The requested amount exceeds Stripe\'s available balance. Please try a lower amount or wait for more transfers to complete.',
  'payout_stripe_not_connected': 'Please connect your bank account before requesting a payout.',
  'payout_request_failed': 'Payout request failed. Please try again.',
  'stripe_onboarding_failed': 'Unable to start Stripe onboarding. Please try again.',
  
  // Address/Order errors
  'address_creation_failed': 'Failed to save your address. Please review the information and try again.',
  'order_creation_failed': 'Failed to create your order. Please try again.',
  'max_addresses_reached': 'You have reached the maximum of 10 saved addresses. Please remove one from Dashboard > Addresses and try again.',
  
  // Default fallback
  'unknown_error': 'An unexpected error occurred. Please try again or contact support.',
};

/**
 * Map error codes/messages to standard payment error message
 * @param {string} errorMessage - Raw error message from API or Stripe
 * @param {string} errorCode - Error code if available
 * @returns {string} - Standard, non-sensitive error message
 */
const getStandardErrorMessage = (errorMessage = '', errorCode = '') => {
  if (!errorMessage && !errorCode) {
    return PAYMENT_ERROR_MESSAGES.unknown_error;
  }

  const message = String(errorMessage || '').toLowerCase();
  const code = String(errorCode || '').toLowerCase();

  // Check for specific error codes first
  if (PAYMENT_ERROR_MESSAGES[code]) {
    return PAYMENT_ERROR_MESSAGES[code];
  }

  // Check for keywords in error message
  const keywords = [
    { key: 'card_declined', msg: PAYMENT_ERROR_MESSAGES.card_declined },
    { key: 'declined', msg: PAYMENT_ERROR_MESSAGES.card_declined },
    { key: 'expired', msg: PAYMENT_ERROR_MESSAGES.expired_card },
    { key: 'cvc|cvv', msg: PAYMENT_ERROR_MESSAGES.incorrect_cvc },
    { key: 'authentication|3d secure', msg: PAYMENT_ERROR_MESSAGES.authentication_failed },
    { key: 'insufficient.*funds|insufficient.*balance|insufficient balance', msg: PAYMENT_ERROR_MESSAGES.payout_insufficient_balance },
    { key: 'invalid.*card|invalid.*number', msg: PAYMENT_ERROR_MESSAGES.invalid_card },
    { key: 'network|connection|offline', msg: PAYMENT_ERROR_MESSAGES.network_error },
    { key: 'timeout|timed out', msg: PAYMENT_ERROR_MESSAGES.timeout_error },
    { key: 'maximum of 10 addresses', msg: PAYMENT_ERROR_MESSAGES.max_addresses_reached },
    { key: 'address.*failed|address.*error', msg: PAYMENT_ERROR_MESSAGES.address_creation_failed },
    { key: 'order.*failed|order.*error', msg: PAYMENT_ERROR_MESSAGES.order_creation_failed },
    // Payout-specific errors
    { key: 'minimum payout', msg: PAYMENT_ERROR_MESSAGES.payout_min_amount },
    { key: 'stripe transferable balance', msg: PAYMENT_ERROR_MESSAGES.payout_stripe_limit },
    { key: 'connect.*bank|stripe account', msg: PAYMENT_ERROR_MESSAGES.payout_stripe_not_connected },
    { key: 'stripe onboarding', msg: PAYMENT_ERROR_MESSAGES.stripe_onboarding_failed },
  ];

  for (const { key, msg } of keywords) {
    const regex = new RegExp(key);
    if (regex.test(message)) {
      return msg;
    }
  }

  // Default fallback for unknown errors
  return PAYMENT_ERROR_MESSAGES.unknown_error;
};

/**
 * Handle payment checkout error
 * Sanitizes and maps error to standard message
 * @param {Error|AxiosError} error - Error object from payment/API call
 * @returns {string} - Standard error message to show user
 */
export const handlePaymentError = (error) => {
  // Handle Stripe confirmation errors
  if (error?.error?.message) {
    return getStandardErrorMessage(error.error.message, error.error.code);
  }

  // Handle API response errors
  if (error?.response?.data?.message) {
    const message = error.response.data.message;
    const apiMessage = Array.isArray(message) ? message[0] : message;
    return getStandardErrorMessage(apiMessage);
  }

  // Handle generic Error objects
  if (error?.message) {
    return getStandardErrorMessage(error.message);
  }

  // Default fallback
  return PAYMENT_ERROR_MESSAGES.unknown_error;
};

/**
 * Handle Stripe confirmation error specifically
 * @param {Object} confirmation - Stripe confirmCardPayment result
 * @returns {string|null} - Error message or null if no error
 */
export const handleStripeConfirmationError = (confirmation) => {
  if (!confirmation?.error) return null;

  const { error } = confirmation;
  return getStandardErrorMessage(error.message, error.code);
};

/**
 * Map error to standard system message for consistency
 * Useful for matching error messages across frontend/backend
 */
export const STANDARD_PAYMENT_ERRORS = {
  CARD_DECLINED: 'Your card was declined. Please try a different payment method.',
  AUTHENTICATION_FAILED: 'Payment authentication failed. Please try again with a different card.',
  PAYMENT_PROCESSING_ERROR: 'Your bank declined the payment. Please contact your bank or try another payment method.',
  PAYMENT_NOT_COMPLETED: 'Your payment was not completed. Please try again.',
  STRIPE_INIT_FAILED: 'Payment system failed to initialize. Please reload the page and try again.',
  ADDRESS_CREATION_FAILED: 'Failed to save your address. Please review the information and try again.',
  ORDER_CREATION_FAILED: 'Failed to create your order. Please try again.',
  PAYOUT_MIN_AMOUNT: 'Minimum payout amount is $20. Please enter a higher amount.',
  PAYOUT_INSUFFICIENT_BALANCE: 'You do not have sufficient balance for this payout amount. Please request a lower amount.',
  PAYOUT_STRIPE_LIMIT: 'The requested amount exceeds Stripe\'s available balance. Please try a lower amount or wait for more transfers to complete.',
  PAYOUT_STRIPE_NOT_CONNECTED: 'Please connect your bank account before requesting a payout.',
  PAYOUT_REQUEST_FAILED: 'Payout request failed. Please try again.',
  STRIPE_ONBOARDING_FAILED: 'Unable to start Stripe onboarding. Please try again.',
  NETWORK_ERROR: 'Network connection issue. Please check your internet and try again.',
  SERVER_ERROR: 'A server error occurred. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again or contact support.',
};

export default {
  handlePaymentError,
  handleStripeConfirmationError,
  getStandardErrorMessage,
  STANDARD_PAYMENT_ERRORS,
};
