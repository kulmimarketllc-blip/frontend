# Order Details Modal Component

## Overview

The `OrderDetailsModal` is a comprehensive order details viewer designed for the merchant dashboard. It displays all relevant information about a specific order in a clean, dark-themed modal that matches the merchant dashboard design system.

## Components

### 1. **OrderDetailsModal** (`OrderDetailsModal.jsx`)
Main modal component that displays complete order details.

**Features:**
- Dark theme matching merchant dashboard design
- Comprehensive order information display
- Customer details with contact links
- Order items with images and pricing
- Pricing breakdown (subtotal, shipping, tax, total)
- Status timeline visualization
- Order notes section
- Action alerts for pending items
- Print order functionality
- Keyboard accessibility (Escape to close)
- Focus management
- Click-outside to close

### 2. **OrderDetailsButton** (`OrderDetailsButton.jsx`)
Compact button component to trigger the modal.

**Features:**
- Eye icon with optional label
- Responsive (text hidden on mobile, icon only)
- Teal color theme matching the design system
- Hover effects
- Accessibility labels

## Usage

### Basic Implementation

```jsx
import { useState } from 'react';
import OrderDetailsModal from '@/components/merchant/OrderDetailsModal';
import OrderDetailsButton from '@/components/merchant/OrderDetailsButton';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleOpenDetails = (orderData) => {
    setSelectedOrder(orderData);
    setIsOpen(true);
  };

  return (
    <>
      <OrderDetailsButton onClick={() => handleOpenDetails(order)} />
      
      <OrderDetailsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        orderId={selectedOrder?.id}
        order={selectedOrder}
      />
    </>
  );
}
```

### In MerchantOrders Page

The modal is integrated into the MerchantOrders page. When a user clicks the "Details" button on any order, it displays the full order information.

```jsx
const [isDetailOpen, setIsDetailOpen] = useState(false);
const [selectedOrder, setSelectedOrder] = useState(null);

const openOrderDetails = (orderGroup) => {
  setSelectedOrder(orderGroup);
  setIsDetailOpen(true);
};

// In the render:
<OrderDetailsButton onClick={() => openOrderDetails(o)} />

<OrderDetailsModal
  isOpen={isDetailOpen}
  onClose={() => {
    setIsDetailOpen(false);
    setSelectedOrder(null);
  }}
  orderId={selectedOrder?.order?.id}
  order={selectedOrder?.order}
/>
```

### In MerchantDashboard

The recent orders table now includes a "View" button that opens the modal.

```jsx
<OrderDetailsButton 
  onClick={() => {
    setSelectedOrder(order.order);
    setIsDetailOpen(true);
  }} 
  label="View" 
/>
```

## Props

### OrderDetailsModal

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isOpen` | boolean | Yes | `false` | Controls modal visibility |
| `onClose` | function | Yes | - | Callback when modal should close |
| `orderId` | string | Yes | - | Order ID to display in header |
| `order` | object | Yes | `{}` | Complete order object |

### Order Object Structure

```javascript
{
  id: "ORD-123456",
  status: "confirmed", // pending_payment, confirmed, processing, ready_for_pickup, picked_up, in_transit, delivered, cancelled, returned, refunded, return_requested
  customer: {
    id: "CUST-123",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1234567890"
  },
  items: [
    {
      id: "ITEM-1",
      productName: "Product Name",
      sku: "SKU-001",
      price: 29.99,
      quantity: 2,
      image: "https://..." // URL to product image
    }
  ],
  totalAmount: 59.98,
  subTotal: 59.98,
  shippingCost: 5.00,
  tax: 0.00,
  shippingAddress: "123 Main St, City, State 12345",
  createdAt: "2024-04-20T10:30:00Z",
  expectedDelivery: "2024-04-25T00:00:00Z",
  notes: "Handle with care",
  timeline: [
    {
      status: "Order Placed",
      date: "2024-04-20T10:30:00Z",
      completed: true
    },
    {
      status: "Processing",
      date: "2024-04-20T11:00:00Z",
      completed: true
    }
  ],
  actionRequired: "Payment pending - customer needs to complete payment" // Optional
}
```

### OrderDetailsButton

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onClick` | function | Yes | - | Callback when button is clicked |
| `label` | string | No | `"Details"` | Button label text |

## Design Details

### Color Scheme
- **Background**: Dark navy (`bg-card`, `bg-navy3`)
- **Text**: White for primary, `text-gray` for secondary
- **Accent**: Teal (`text-teal`) for highlights and interactive elements
- **Borders**: `border-white/5` to `border-white/30`
- **Status Colors**: Dynamic colors based on order status

### Layout Structure

```
┌─────────────────────────────────────┐
│  Order Details [Status Badge]   [X] │
│  Order #ORD-12345                   │
├─────────────────────────────────────┤
│  📅 Order Date | ⏱ Expected Delivery│
├─────────────────────────────────────┤
│  Customer Information                │
│  Name, Email, Phone, Address         │
├─────────────────────────────────────┤
│  Order Items                         │
│  [Item 1] [Item 2] ...              │
├─────────────────────────────────────┤
│  Pricing Breakdown                   │
│  Subtotal: $X.XX                     │
│  Shipping: $X.XX                     │
│  Tax: $X.XX                          │
│  Total: $X.XX                        │
├─────────────────────────────────────┤
│  [Close]              [Print Order]  │
└─────────────────────────────────────┘
```

## Status Colors

The modal automatically applies appropriate colors to the status badge based on the order status:

- **pending_payment**: Yellow
- **confirmed**: Teal
- **processing**: Blue
- **ready_for_pickup**: Yellow
- **picked_up/in_transit**: Purple
- **delivered**: Green
- **cancelled/returned/refunded**: Red
- **return_requested**: Orange

## Features

### 1. Order Header
- Displays order ID and status with color-coded badge
- Shows order date for quick reference

### 2. Customer Information
- Full customer name
- Email (clickable link)
- Phone number (clickable link)
- Shipping address with icon indicator

### 3. Order Items
- Product images with fallback background
- Product names
- SKU information
- Quantity and individual line item totals
- Hover effects for better interactivity

### 4. Pricing Breakdown
- Itemized breakdown of costs
- Subtotal, shipping, and tax display
- Clear total amount highlighting
- All values formatted to 2 decimal places

### 5. Status Timeline (Optional)
- Visual timeline of order status changes
- Completion indicators
- Timestamps for each status change

### 6. Order Notes (Optional)
- Display any special instructions or notes
- Only shown if notes exist

### 7. Action Alerts (Optional)
- Orange alert banner for pending actions
- Clear messaging of what needs to be done
- Only shown if action is required

### 8. Footer Actions
- Close button for dismissing the modal
- Print button for generating a printable version

## Accessibility Features

- Proper ARIA attributes (`role="dialog"`, `aria-modal="true"`)
- Focus management (focus moves to modal on open, returns on close)
- Keyboard support (Escape key to close)
- Semantic HTML with proper heading hierarchy
- Color contrast compliant
- Proper label associations

## Responsive Design

### Desktop (min-width: 800px)
- Full-width layout with proper spacing
- Optimized grid layouts for information display
- All features visible by default

### Mobile (< 800px)
- Single-column layout
- Adjusted padding and spacing
- Scrollable content
- Touch-friendly button sizes
- Optimized text display

## Integration Points

### MerchantOrders Page
- Details button appears for orders not in active workflow
- Opens modal showing complete order information
- Integrated with the order grouping system

### MerchantDashboard
- Recent orders table includes "View" button
- Quick access to full order details
- Integrated into both desktop and mobile views

## Example Data

```javascript
const exampleOrder = {
  id: "ORD-001234",
  status: "processing",
  customer: {
    firstName: "Alice",
    lastName: "Smith",
    email: "alice@example.com",
    phone: "+1-555-0123"
  },
  items: [
    {
      productName: "Premium Wireless Headphones",
      sku: "AUDIO-001",
      price: 149.99,
      quantity: 1,
      image: "https://example.com/headphones.jpg"
    },
    {
      productName: "USB-C Cable 6ft",
      sku: "CABLE-USB-6",
      price: 12.99,
      quantity: 2,
      image: "https://example.com/cable.jpg"
    }
  ],
  totalAmount: 175.97,
  subTotal: 175.97,
  shippingCost: 0.00,
  tax: 0.00,
  shippingAddress: "456 Oak Ave, Suite 200, Springfield, IL 62701",
  createdAt: "2024-04-20T14:30:00Z",
  expectedDelivery: "2024-04-25T23:59:59Z",
  notes: "Signature required for delivery",
  timeline: [
    { status: "Order Placed", date: "2024-04-20T14:30:00Z", completed: true },
    { status: "Payment Confirmed", date: "2024-04-20T14:35:00Z", completed: true },
    { status: "Processing", date: "2024-04-21T09:00:00Z", completed: true },
    { status: "Ready for Pickup", date: "2024-04-23T15:00:00Z", completed: false }
  ]
};
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Notes

- Component uses `React.memo` for optimization
- Focus and scroll state properly managed
- Backdrop blur effect applied for better visual separation
- Smooth animations with CSS transitions

## Future Enhancements

1. Print functionality implementation
2. Export to PDF feature
3. Refund/Return workflow integration
4. Customer communication history
5. Order modification options
6. Invoice generation
7. Multi-language support
8. Real-time order tracking integration
