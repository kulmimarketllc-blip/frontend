import {
  Chrome,
  Eye,
  EyeOff,
  Facebook,
  Mail,
  Phone,
  User,
} from 'lucide-react';

const iconMap = {
  mail: Mail,
  user: User,
  phone: Phone,
  eye: Eye,
  eyeOff: EyeOff,
};

export const AuthDivider = ({ text }) => (
  <div className="mb-5 flex items-center gap-3">
    <div className="h-px flex-1 bg-white/10" />
    <span className="text-gray text-[0.72rem]">{text}</span>
    <div className="h-px flex-1 bg-white/10" />
  </div>
);

export const SocialButton = ({ provider = 'google', children, onClick }) => {
  const Icon = provider === 'facebook' ? Facebook : Chrome;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-navy3 border-border hover:border-teal hover:bg-teal/10 flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-[0.82rem] font-medium text-white transition-colors"
    >
      <Icon size={16} />
      {children}
    </button>
  );
};

export const AuthInput = ({
  id,
  label,
  labelRight,
  type = 'text',
  placeholder,
  icon,
  value,
  onChange,
  prefix,
  onIconClick,
}) => {
  const Icon = iconMap[icon];

  return (
    <div className="mb-4">
      {(label || labelRight) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && (
            <label
              htmlFor={id}
              className="text-gray text-[0.7rem] font-medium tracking-widest uppercase"
            >
              {label}
            </label>
          )}
          {labelRight && <div className="text-[0.7rem]">{labelRight}</div>}
        </div>
      )}

      <div className="relative">
        {prefix && (
          <span className="text-gray absolute top-1/2 left-3 -translate-y-1/2 text-[0.85rem]">{prefix}</span>
        )}

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`bg-navy3 border-border text-white placeholder:text-gray focus:border-teal w-full rounded-md border px-4 py-3 text-[0.9rem] outline-none transition-colors ${
            prefix ? 'pl-10' : ''
          } ${Icon ? 'pr-10' : ''}`}
        />

        {Icon && (
          <button
            type="button"
            onClick={onIconClick}
            className={`text-gray absolute top-1/2 right-3 -translate-y-1/2 transition-colors ${
              onIconClick ? 'cursor-pointer hover:text-teal' : 'cursor-default'
            }`}
            tabIndex={onIconClick ? 0 : -1}
          >
            <Icon size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export const PasswordStrength = ({ value }) => {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  const label = ['Enter a password', 'Weak', 'Fair', 'Good', 'Strong'][score];

  const getBarClass = (index) => {
    if (index >= score) return 'bg-white/10';
    if (score <= 1) return 'bg-red';
    if (score <= 2) return 'bg-yellow';
    return 'bg-green-500';
  };

  return (
    <div className="mt-2">
      <div className="mb-1 flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-0.75 flex-1 rounded ${getBarClass(i)}`} />
        ))}
      </div>
      <p className="text-gray text-[0.68rem]">{label}</p>
    </div>
  );
};

export const CheckboxField = ({ id, checked, onChange, children, required = false }) => (
  <label htmlFor={id} className="mb-3 flex cursor-pointer items-start gap-2.5">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      required={required}
      onChange={onChange}
      className="mt-0.5 h-4 w-4 shrink-0 accent-teal"
    />
    <span className="text-gray text-[0.78rem] leading-relaxed">{children}</span>
  </label>
);

export const AuthButton = ({
  children,
  type = 'button',
  disabled = false,
  variant = 'primary',
  onClick,
}) => {
  const className =
    variant === 'outline'
      ? 'border-border text-gray2 hover:border-teal hover:text-teal border bg-transparent'
      : 'bg-teal text-navy hover:bg-teal2 border border-teal';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`mb-4 w-full rounded-md px-4 py-3 text-[0.9rem] font-semibold tracking-[0.04em] transition-all ${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {children}
    </button>
  );
};
