/**
 * UI Components Library
 *
 * Production-ready, accessible React components following:
 * - WCAG 2.1 AA accessibility standards
 * - Lighthouse audit best practices
 * - React best practices (memo, forwardRef)
 * - Tailwind CSS utility-first styling
 *
 * Usage:
 * import { Button, InputField, Card, Modal } from '@/components/ui';
 */

// Buttons
export { default as Button } from './buttons/Button';
export { default as IconButton } from './buttons/IconButton';

// Forms
export { default as InputField } from './forms/InputField';
export { default as Checkbox } from './forms/Checkbox';
export { default as SelectField } from './forms/SelectField';
export { default as FormWrapper } from './forms/FormWrapper';

// Layouts
export { default as Card } from './layouts/Card';
export { default as Container } from './layouts/Container';
export { default as Grid } from './layouts/Grid';

// Modals
export { default as InfoModal } from './modals/InfoModal';
export { default as ConfirmModal } from './modals/ConfirmModal';
export { default as FormModal } from './modals/FormModal';

// Notifications
export { default as Alert } from './notifications/Alert';
export { default as Toast } from './notifications/Toast';
export { useToast } from './notifications/useToast';

// Tables
export { default as DataTable } from './tables/DataTable';
export { default as TableHeader } from './tables/TableHeader';
export { default as TableRow } from './tables/TableRow';

// Typography
export { Heading, Text, Label } from './typography';

// Icons (re-exported from lucide-react for convenience)
export * from './icons';
