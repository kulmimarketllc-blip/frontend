# ⚡ Performance Optimization Checklist

Use this checklist to ensure your React application follows performance best practices.

## 🎯 Critical (Must Do)

### Code Splitting

- [x] Routes are lazy loaded with `React.lazy()`
- [ ] All route components wrapped in `<Suspense>`
- [ ] Heavy components (charts, editors) lazy loaded
- [ ] Third-party libraries imported selectively

### Bundle Optimization

- [ ] Bundle analyzer configured and run
- [ ] Vendor chunks separated (React, Redux, UI libs)
- [ ] Bundle size < 100KB for initial load
- [ ] Tree shaking verified (no unused exports)

### React Performance

- [ ] Presentational components wrapped with `React.memo()`
- [ ] Event handlers use `useCallback()` when passed to children
- [ ] Expensive calculations use `useMemo()`
- [ ] Lists have stable `key` props (avoid index as key)

### Images & Assets

- [ ] All images have `loading="lazy"` attribute
- [ ] Images have explicit `width` and `height`
- [ ] Using modern formats (WebP, AVIF) with fallbacks
- [ ] SVGs are inline or lazy loaded for icons

## 🔥 High Priority (Should Do)

### State Management

- [ ] Redux selectors are memoized
- [ ] Separate selectors for each state slice
- [ ] No redundant state (can be derived)
- [ ] State normalized for large datasets

### Network Optimization

- [ ] API requests have proper caching
- [ ] Request deduplication implemented
- [ ] Optimistic updates for better UX
- [ ] Request cancellation on unmount (AbortController)

### Rendering Optimization

- [ ] Components don't re-render unnecessarily
- [ ] React DevTools Profiler used to identify issues
- [ ] Long lists virtualized (react-window/react-virtualized)
- [ ] Intersection Observer for lazy content

## ⚠️ Important (Nice to Have)

### Code Quality

- [ ] ESLint rules for performance enabled
- [ ] No console.logs in production
- [ ] PropTypes or TypeScript for type safety
- [ ] JSDoc comments for complex functions

### Monitoring

- [ ] Web Vitals tracking configured
- [ ] Performance metrics logged
- [ ] Error boundary catches runtime errors
- [ ] Sentry or similar error tracking in production

### Build Configuration

- [ ] Compression enabled (gzip/brotli)
- [ ] Source maps only in development
- [ ] CSS purging enabled (unused styles removed)
- [ ] Environment-specific builds

## 📊 Measurement

### Before Deployment

```bash
# 1. Build and analyze
npm run build
npm run preview

# 2. Run Lighthouse
# Chrome DevTools > Lighthouse > Run Analysis

# 3. Check bundle size
ls -lh dist/assets/

# 4. Verify lazy loading
# Network tab > Check initial load size
```

### Target Metrics

| Metric                 | Target  | Tool            |
| ---------------------- | ------- | --------------- |
| First Contentful Paint | < 1.0s  | Lighthouse      |
| Time to Interactive    | < 1.5s  | Lighthouse      |
| Initial Bundle Size    | < 100KB | Build output    |
| Lighthouse Score       | > 90    | Lighthouse      |
| CPU Usage              | < 50%   | Chrome DevTools |

## 🚫 Anti-Patterns to Avoid

### Don't Do This

```javascript
// ❌ Creating objects in render
<Component style={{ margin: 10 }} />

// ❌ Defining functions in render
<button onClick={() => handleClick(id)}>Click</button>

// ❌ Inline array methods in render
{items.filter(i => i.active).map(i => <Item key={i.id} />)}

// ❌ Using index as key
{items.map((item, index) => <Item key={index} />)}

// ❌ Not breaking down large components
function HugeComponent() {
  // 500+ lines of code
}
```

### Do This Instead

```javascript
// ✅ Define style object outside
const buttonStyle = { margin: 10 };
<Component style={buttonStyle} />;

// ✅ Use useCallback
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);

// ✅ Memoize filtered data
const activeItems = useMemo(() => items.filter((i) => i.active), [items]);

// ✅ Use stable unique keys
{
  items.map((item) => <Item key={item.id} />);
}

// ✅ Break into smaller components
function ParentComponent() {
  return (
    <>
      <HeaderSection />
      <ContentSection />
      <FooterSection />
    </>
  );
}
```

## 🔍 Debugging Performance Issues

### Step 1: Identify the Problem

1. Open React DevTools Profiler
2. Start recording
3. Perform the slow action
4. Stop recording and analyze

### Step 2: Common Issues & Fixes

**Issue**: Component re-renders too often

- **Check**: React DevTools Profiler
- **Fix**: Add `React.memo()`, `useCallback()`, or `useMemo()`

**Issue**: Slow initial load

- **Check**: Network tab, bundle size
- **Fix**: Code splitting, lazy loading

**Issue**: Janky scrolling/animations

- **Check**: Performance tab
- **Fix**: Virtualize lists, debounce scroll handlers

**Issue**: Large bundle size

- **Check**: Bundle analyzer
- **Fix**: Tree shaking, dynamic imports, remove unused deps

### Step 3: Verify the Fix

1. Re-run performance tests
2. Compare metrics before/after
3. Document the improvement

## 📝 Performance Review Checklist

Before merging code, verify:

- [ ] No new performance regressions
- [ ] Bundle size hasn't increased significantly
- [ ] All images optimized
- [ ] Network requests minimized
- [ ] React DevTools shows no unnecessary re-renders
- [ ] Lighthouse score maintained or improved

## 🎓 Learning Resources

### Official Documentation

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Redux Performance](https://redux.js.org/usage/performance)
- [Web Vitals](https://web.dev/vitals/)

### Tools

- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Bundle Analyzer](https://www.npmjs.com/package/rollup-plugin-visualizer)

### Articles

- [Optimizing React Performance](https://kentcdodds.com/blog/speed-up-your-app-with-web-workers)
- [Redux Performance Tips](https://redux-toolkit.js.org/usage/usage-guide#optimizing-update-performance)

---

**Remember**: Premature optimization is the root of all evil. Measure first, optimize what matters!

**Last Updated**: March 20, 2026
