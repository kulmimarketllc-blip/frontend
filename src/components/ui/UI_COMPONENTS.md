# UI Components Library

Production-ready, accessible React components following WCAG 2.1 AA standards and Lighthouse audit best practices.

## 📦 Installation

All components are located in `src/components/ui/` and can be imported using the `@/` path alias:

```jsx
import { Button, InputField, Card, Modal } from '@/components/ui';
```

## 🎯 Key Features

- ✅ **WCAG 2.1 AA Compliant** - Full accessibility support
- ✅ **Lighthouse Optimized** - Follows all audit best practices
- ✅ **Performance Optimized** - Uses React.memo() for all components
- ✅ **Keyboard Navigation** - Full keyboard support
- ✅ **Screen Reader Support** - Proper ARIA attributes
- ✅ **TypeScript Ready** - Fully typed with PropTypes

## 📚 Component Categories

### Buttons

- **Button** - Primary action button with variants and loading states
- **IconButton** - Icon-only button with mandatory aria-label

### Forms

- **InputField** - Text input with proper label association
- **Checkbox** - Checkbox with indeterminate state support
- **SelectField** - Select dropdown with custom styling
- **FormWrapper** - Form container with error handling

### Layouts

- **Card** - Content card with header, body, footer sections
- **Container** - Responsive container with max-width options
- **Grid** - Responsive grid with breakpoint support

### Modals

- **InfoModal** - Basic modal with focus management
- **ConfirmModal** - Confirmation dialog
- **FormModal** - Form-specific modal

### Notifications

- **Alert** - Alert banner with variants
- **Toast** - Auto-dismiss toast notification
- **useToast** - Hook for managing toast state

### Tables

- **DataTable** - Sortable data table with accessibility
- **TableHeader** - Reusable table header
- **TableRow** - Reusable table row

### Typography

- **Heading** - Semantic headings (h1-h6) with visual styles
- **Text** - Body text with styling options
- **Label** - Form label with required indicator

## 🚀 Quick Start Examples

### Button Usage

```jsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">
  Click Me
</Button>

<Button variant="outline" leftIcon={<User />}>
  Profile
</Button>

<Button loading disabled>
  Saving...
</Button>
```

### Form Usage

```jsx
import { InputField, Checkbox, FormWrapper } from '@/components/ui';

<FormWrapper title="Sign Up" errors={errors} onSubmit={handleSubmit}>
  <InputField
    label="Email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
  />

  <Checkbox label="I agree to terms" checked={agreed} onChange={setAgreed} />

  <Button type="submit">Submit</Button>
</FormWrapper>;
```

### Modal Usage

```jsx
import { ConfirmModal } from '@/components/ui';

<ConfirmModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Delete Item"
  message="Are you sure? This action cannot be undone."
  confirmText="Delete"
  variant="danger"
/>;
```

### Layout Usage

```jsx
import { Card, Container, Grid } from '@/components/ui';

<Container size="lg">
  <Grid cols={3} gap={4}>
    <Card variant="elevated">
      <Card.Header>
        <Heading as="h3" size="lg">
          Title
        </Heading>
      </Card.Header>
      <Card.Body>
        <Text>Content here</Text>
      </Card.Body>
      <Card.Footer>
        <Button>Action</Button>
      </Card.Footer>
    </Card>
  </Grid>
</Container>;
```

### Toast Notification

```jsx
import { useToast, Toast } from '@/components/ui';

function MyComponent() {
  const { toasts, addToast, removeToast } = useToast();

  const showSuccess = () => {
    addToast({
      variant: 'success',
      message: 'Changes saved successfully!',
    });
  };

  return (
    <>
      <Button onClick={showSuccess}>Save</Button>

      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </>
  );
}
```

### Data Table

```jsx
import { DataTable } from '@/components/ui';

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role' },
];

const data = [
  { id: 1, name: 'John', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane', email: 'jane@example.com', role: 'User' },
];

<DataTable caption="User List" columns={columns} data={data} striped hoverable />;
```

## ♿ Accessibility Features

All components include:

- ✅ Proper ARIA attributes (`aria-label`, `aria-describedby`, `aria-invalid`, etc.)
- ✅ Keyboard navigation support (Tab, Enter, Escape, Arrow keys)
- ✅ Focus management (visible focus indicators, focus trapping in modals)
- ✅ Screen reader announcements (`aria-live`, `role`, `aria-hidden`)
- ✅ Semantic HTML (proper heading hierarchy, form associations)

### Icon-Only Buttons/Links

All icon-only buttons **must** have an `aria-label` for screen readers:

```jsx
// ❌ Bad - No aria-label
<IconButton icon={<X />} />

// ✅ Good - Has aria-label
<IconButton icon={<X />} aria-label="Close" />
```

The IconButton component will warn in development if aria-label is missing.

### Heading Hierarchy

Use semantic heading levels (h1-h6) correctly:

```jsx
// ✅ Good - Semantic structure
<Heading as="h1" size="3xl">Page Title</Heading>
<Heading as="h2" size="xl">Section</Heading>
<Heading as="h3" size="lg">Subsection</Heading>

// ❌ Bad - Skipping levels
<Heading as="h1">Title</Heading>
<Heading as="h4">Subsection</Heading> {/* Skipped h2, h3 */}
```

## 🎨 Component Variants

Most components support multiple variants:

### Button Variants

- `primary` - Primary action (blue)
- `secondary` - Secondary action (gray)
- `outline` - Outlined style
- `ghost` - Transparent background
- `danger` - Destructive action (red)
- `success` - Success action (green)

### Button Sizes

- `xs` - Extra small
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large
- `xl` - Extra large

### Alert/Toast Variants

- `success` - Green
- `error` - Red
- `warning` - Yellow
- `info` - Blue

### Card Variants

- `elevated` - Box shadow
- `outlined` - Border only
- `flat` - No shadow or border

## 🎭 Component Props

### Common Props

Most components accept these common props:

```jsx
{
  className: string,        // Additional CSS classes
  disabled: boolean,        // Disabled state
  'aria-label': string,    // ARIA label for screen readers
  ...rest                   // All other HTML attributes
}
```

### Button Props

```jsx
{
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success',
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  loading: boolean,         // Shows spinner, disables button
  leftIcon: ReactNode,      // Icon before text
  rightIcon: ReactNode,     // Icon after text
  fullWidth: boolean,       // Expand to full width
}
```

### InputField Props

```jsx
{
  label: string,            // Field label
  type: string,             // Input type (text, email, password, etc.)
  error: string,            // Error message
  helperText: string,       // Helper text below input
  required: boolean,        // Required indicator
  disabled: boolean,        // Disabled state
}
```

### Modal Props

```jsx
{
  isOpen: boolean,          // Modal open state
  onClose: function,        // Close handler
  title: string,            // Modal title
  size: 'sm' | 'md' | 'lg' | 'xl',
  closeOnOverlayClick: boolean,  // Default true
  showCloseButton: boolean,      // Default true
}
```

## 🔧 Customization

All components use Tailwind CSS classes and can be customized:

### Using className

```jsx
<Button className="mt-4 shadow-lg">Custom Styled Button</Button>
```

### Extending Components

```jsx
import { Button } from '@/components/ui';

export default function MyButton(props) {
  return <Button className="bg-gradient-to-r from-purple-500 to-pink-500" {...props} />;
}
```

## 🚨 Common Issues

### Missing aria-label Warning

If you see a warning about missing `aria-label`, add it to icon-only buttons:

```jsx
<IconButton icon={<X />} aria-label="Close modal" />
```

### Form Input Not Associated

Ensure inputs have proper IDs and labels:

```jsx
<InputField
  label="Username"
  id="username" // Auto-generated if not provided
  value={username}
/>
```

### Modal Not Scrollable

If modal content is long, the body will automatically scroll:

```jsx
<InfoModal isOpen={isOpen} onClose={onClose}>
  {/* Long content will scroll */}
</InfoModal>
```

## 📖 Related Documentation

- [ARCHITECTURE_ASSESSMENT.md](../../ARCHITECTURE_ASSESSMENT.md) - Project architecture details
- [LIGHTHOUSE_FIXES.md](../../LIGHTHOUSE_FIXES.md) - Lighthouse audit fixes
- [QUICK_WINS.md](../../QUICK_WINS.md) - Quick optimization wins

## 🤝 Contributing

When adding new components:

1. ✅ Follow WCAG 2.1 AA standards
2. ✅ Include proper ARIA attributes
3. ✅ Add keyboard navigation support
4. ✅ Use React.memo() for performance
5. ✅ Add comprehensive JSDoc comments
6. ✅ Test with screen readers
7. ✅ Update this documentation

## 📝 License

Part of React Boilerplate project.
