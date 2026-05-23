# React Redux Tailwind CSS Boilerplate 🚀

A modern, production-ready React + Redux + Tailwind CSS boilerplate with best practices, feature-rich setup, and comprehensive tooling.

**Architecture Score**: 7.4/10 | [📚 Documentation Index](DOCS_INDEX.md)

## 📚 Documentation Hub

- **[📖 Documentation Index](DOCS_INDEX.md)** - Navigate all documentation
- **[🏗️ Architecture Assessment](ARCHITECTURE_ASSESSMENT.md)** - Comprehensive analysis, scoring, and roadmap
- **[⚡ Quick Performance Wins](QUICK_WINS.md)** - Fast optimizations (2-4 hours)
- **[✅ Performance Checklist](PERFORMANCE_CHECKLIST.md)** - Complete performance audit checklist
- **[📄 This README](#)** - Setup guide and basic usage

## ✨ Features

- **React 19** - Latest React with hooks support
- **Redux Toolkit** - Simplified Redux state management with Redux Toolkit
- **Tailwind CSS 4** - Utility-first CSS framework for rapid UI development
- **Vite** - Lightning-fast build tool and development server
- **React Router v7** - Client-side routing with latest React Router
- **ESLint & Prettier** - Code quality and formatting tools
- **Axios** - Promise-based HTTP client with interceptors
- **React Toastify** - Toast notifications
- **Lucide React** - Beautiful and consistent icon library
- **Responsive Design** - Mobile-first responsive components
- **TypeScript Ready** - Pre-configured for TypeScript projects

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd react-boilerplate
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Configure your environment variables:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=React Boilerplate
```

5. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📦 Available Scripts

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run format` - Format code with Prettier

## 📁 Project Structure

```
src/
├── components/
│   ├── common/           # Shared components across features
│   └── ui/              # Basic UI components (Button, Input, etc.)
├── config/
│   ├── constants.js     # Application constants
│   └── env.js          # Environment variable validation
├── features/
│   ├── store.js        # Redux store configuration
│   ├── auth/           # Authentication feature
│   ├── counter/        # Counter example feature
│   └── products/       # Products feature with API
│       ├── productsAPI.js
│       └── productsSlice.js
├── pages/
│   ├── admin/          # Admin-only pages
│   ├── auth/           # Authentication pages
│   ├── error/          # Error pages (404, 500, etc.)
│   │   └── NotFound.jsx
│   └── public/         # Public pages
│       ├── public_about/
│       │   └── AboutView.jsx
│       ├── public_contact/
│       │   └── ContactView.jsx
│       └── public_Home/
│           └── HomeView.jsx
├── router/
│   ├── router.jsx      # Main router configuration
│   ├── guard/          # Route guards for authentication
│   └── layout/         # Layout components
│       ├── FooterLayout.jsx
│       ├── NavbarLayout.jsx
│       └── RootLayout.jsx
├── services/
│   ├── axiosInstance.js    # Configured Axios instance
│   ├── httpEndpoint.js     # API endpoint definitions
│   └── httpMethods.js      # HTTP method helpers
└── utils/
    ├── errorHandler.js     # Global error handling
    ├── Helper.js          # General helper functions
    ├── storage.js         # LocalStorage/SessionStorage helpers
    └── validators.js      # Form validation functions
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# App Configuration
VITE_APP_NAME=React Boilerplate
```

### Tailwind CSS

Tailwind CSS 4 is configured with the `@tailwindcss/vite` plugin. Customize your design in the CSS file:

```css
@import 'tailwindcss';

@theme {
  /* Your custom theme configuration */
}
```

### Redux Store

The store is configured in `src/features/store.js`. Add new features by creating slices:

```javascript
// src/features/myFeature/myFeatureSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: [],
  loading: false,
  error: null,
};

export const myFeatureSlice = createSlice({
  name: 'myFeature',
  initialState,
  reducers: {
    setData: (state, action) => {
      state.data = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setData, setLoading, setError } = myFeatureSlice.actions;
export default myFeatureSlice.reducer;
```

Then add it to the store:

```javascript
// src/features/store.js
import { configureStore } from '@reduxjs/toolkit';
import myFeatureReducer from './myFeature/myFeatureSlice';

const store = configureStore({
  reducer: {
    myFeature: myFeatureReducer,
    // ... other reducers
  },
});

export default store;
```

## 📝 How to Use This Boilerplate

### 1. Setting Up Your Project

1. **Clone and Setup**: Follow the Quick Start guide above
2. **Configure Environment**: Update `.env` with your API endpoints
3. **Customize Branding**: Update app name, logo, and colors
4. **Clean Example Code**: Remove example features you don't need

### 2. Adding New Features

#### Creating a New Page

1. Create a new folder in `src/pages/public/` (or `admin/` for admin pages)
2. Create your component file (e.g., `MyPageView.jsx`)
3. Add the route in `src/router/router.jsx`

```javascript
// src/pages/public/my_page/MyPageView.jsx
import React from 'react';

const MyPageView = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1>My New Page</h1>
    </div>
  );
};

export default MyPageView;
```

```javascript
// src/router/router.jsx
import MyPageView from '../pages/public/my_page/MyPageView';

// Add to your routes
<Route path="my-page" element={<MyPageView />} />;
```

#### Creating a New Redux Feature

1. Create a new folder in `src/features/`
2. Create your slice file following the pattern in `src/features/products/`
3. Add API functions if needed
4. Connect to the store

### 3. Working with APIs

The boilerplate includes a configured Axios instance in `src/services/axiosInstance.js`:

```javascript
// Example API call
import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';

export const fetchMyData = createAsyncThunk(
  'myFeature/fetchMyData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/my-endpoint', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
```

### 4. Styling Components

Use Tailwind CSS utility classes for styling:

```javascript
const MyComponent = () => {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">Title</h2>
      <p className="leading-relaxed text-gray-600">Content</p>
      <button className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
        Action
      </button>
    </div>
  );
};
```

### 5. Form Handling

Example form with validation:

```javascript
import React, { useState } from 'react';

const MyForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();

    if (Object.keys(newErrors).length === 0) {
      // Handle successful submission
      console.log('Form submitted:', formData);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="Name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>
      {/* More form fields... */}
      <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-white">
        Submit
      </button>
    </form>
  );
};
```

## 🔒 Authentication Setup

To add authentication to your app:

1. **Create Auth Slice** in `src/features/auth/authSlice.js`
2. **Add Auth API** functions in `src/features/auth/authAPI.js`
3. **Create Route Guards** in `src/router/guard/`
4. **Update Axios Interceptors** to handle tokens

Example auth slice:

```javascript
// src/features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
```

## 🎨 Customization

### Changing Colors and Themes

Update your Tailwind theme by modifying the CSS:

```css
@theme {
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;
}
```

### Adding Custom Components

Create reusable components in `src/components/`:

```javascript
// src/components/ui/Card.jsx
const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`rounded-lg bg-white p-6 shadow-md ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure redirects for SPA in `_redirects` file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The web framework used
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Vite](https://vitejs.dev/) - Build tool
- [Lucide](https://lucide.dev/) - Icon library

## 📞 Support

If you have any questions or need help getting started:

- 📧 Email: hello@reactboilerplate.dev
- 💬 Discord: [Join our community](https://discord.gg/reactboilerplate)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 Docs: [Documentation](https://docs.reactboilerplate.dev)

---

**Happy Coding!** 🎉

- `npm run lint` - Run ESLint to check code quality
- `npm run format` - Format code with Prettier

## 📁 Project Structure

```
src/
├── api/
│   ├── apiClient.js
│   └── endpoints/
│       └── exampleApi.js
├── app/
│   ├── store.js
│   └── rootReducer.js
├── components/
│   ├── common/
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   └── index.js
│   │   ├── Input/
│   │   │   ├── Input.jsx
│   │   │   └── index.js
│   │   └── LoadingSpinner/
│   │       ├── LoadingSpinner.jsx
│   │       └── index.js
│   └── layout/
│       ├── Header/
│       │   ├── Header.jsx
│       │   └── index.js
│       └── Footer/
│           ├── Footer.jsx
│           └── index.js
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── authSlice.js
│   │   └── authApi.js
│   ├── todos/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── todosSlice.js
│   │   └── todosApi.js
│   └── counter/
│       ├── components/
│       ├── hooks/
│       ├── counterSlice.js
│       └── counterApi.js
├── hooks/
│   ├── useDebounce.js
│   ├── useLocalStorage.js
│   └── useMediaQuery.js
├── utils/
│   ├── constants.js
│   ├── helpers.js
│   └── validators.js
├── styles/
│   └── globals.css
├── routes/
│   ├── PrivateRoute.jsx
│   └── AppRoutes.jsx
└── App.jsx
```

## 🔧 Configuration

### Tailwind CSS

The Tailwind CSS configuration is located in `tailwind.config.js`. Customize your design tokens here:

```javascript
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /* ... */
      },
      spacing: {
        /* ... */
      },
    },
  },
  darkMode: 'class',
};
```

### Redux Store

Redux slices are located in `src/store/slices/`. Create new slices for different features:

```javascript
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  /* ... */
};

export const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    // Add your reducers here
  },
});

export const {
  /* actions */
} = featureSlice.actions;
export default featureSlice.reducer;
```

Then register the slice in `src/store/store.js`:

```javascript
import featureReducer from './slices/featureSlice';

export const store = configureStore({
  reducer: {
    // ... other reducers
    feature: featureReducer,
  },
});
```

## 📝 Usage Examples

### Using Redux State

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/slices/appSlice';

export default function Component() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.app.theme);

  return <button onClick={() => dispatch(toggleTheme())}>Current theme: {theme}</button>;
}
```

### Using UI Components

```javascript
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Example() {
  return (
    <Card>
      <h2 className="text-xl font-bold">Welcome</h2>
      <p className="mt-2 text-gray-600">Hello, World!</p>
      <Button variant="primary" size="md" className="mt-4">
        Click Me
      </Button>
    </Card>
  );
}
```

### Styling with Tailwind CSS

```javascript
export default function Component() {
  return (
    <div className="flex items-center justify-center rounded-lg bg-blue-500 px-6 py-4 text-white shadow-lg hover:bg-blue-600 dark:bg-blue-900">
      Tailwind styled component
    </div>
  );
}
```

## 🎨 Component Library

### Button

Versatile button component with multiple variants and sizes.

```javascript
<Button variant="primary" size="md">
  Primary Button
</Button>
<Button variant="secondary" size="sm">
  Secondary Button
</Button>
<Button variant="danger" size="lg">
  Danger Button
</Button>
```

**Props:**

- `variant`: `'primary'` | `'secondary'` | `'danger'` (default: `'primary'`)
- `size`: `'sm'` | `'md'` | `'lg'` (default: `'md'`)
- `className`: Additional CSS classes
- All standard HTML button attributes

### Card

Container component for grouping content.

```javascript
<Card className="max-w-md">
  <h3 className="font-bold">Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

**Props:**

- `children`: Card content
- `className`: Additional CSS classes

### ThemeToggle

Component to switch between light and dark modes.

```javascript
<ThemeToggle />
```

## 🌙 Dark Mode

Dark mode is built-in using Tailwind's class-based dark mode. To enable dark mode:

```javascript
// In your component
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">Content</div>
```

The `ThemeToggle` component is already integrated and manages the theme state via Redux.

## 📚 Dependencies

### Core Dependencies

- **react** - UI library
- **react-dom** - DOM rendering
- **react-redux** - Redux bindings for React
- **@reduxjs/toolkit** - Redux state management

### Styling

- **tailwindcss** - Utility-first CSS framework
- **@tailwindcss/vite** - Vite plugin for Tailwind CSS
- **clsx** - Utility for constructing className strings

### Routing & HTTP

- **react-router-dom** - Client-side routing
- **axios** - HTTP client

### UI & Notifications

- **react-toastify** - Toast notifications

### Development Tools

- **vite** - Build tool
- **eslint** - Code quality
- **prettier** - Code formatter
- **prettier-plugin-tailwindcss** - Tailwind CSS class sorting

## 🛠️ Best Practices

1. **Component Organization** - Keep components modular and focused on single responsibility
2. **Redux Slices** - Use Redux Toolkit slices for cleaner state management
3. **Styling** - Prefer Tailwind CSS utility classes over custom CSS
4. **Type Safety** - Consider using TypeScript for larger projects
5. **Performance** - Use React.memo and useMemo for performance optimization
6. **Testing** - Add tests using Jest and React Testing Library
7. **Code Quality** - Run ESLint and Prettier regularly
8. **Environment Variables** - Use `.env` files for sensitive data

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

This generates an optimized build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Deploy to Netlify

1. Push code to GitHub
2. Connect repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`

## 📖 Resources

- [React Documentation](https://react.dev)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💡 Tips

- Use the Redux DevTools browser extension for better state debugging
- Leverage Tailwind's responsive prefixes (sm:, md:, lg:) for responsive design
- Create custom Tailwind components using `@apply` in your CSS
- Keep your Redux slices small and focused
- Consider using Redux Thunk or Redux Saga for async operations

## 🐛 Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically use the next available port.

### Tailwind Classes Not Working

1. Ensure content paths in `tailwind.config.js` are correct
2. Clear Tailwind cache: `rm -rf node_modules/.vite`
3. Restart the dev server

### Redux Not Connecting

Ensure `Provider` wraps your app in `main.jsx` and the store is properly configured.

---

Built with ❤️ using React, Redux, and Tailwind CSS

# React-boilerplate
