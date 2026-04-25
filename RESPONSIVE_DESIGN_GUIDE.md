# StreamFlix - Responsive Design Guide

## 📱 Screen Size Breakpoints

Our app is optimized for all devices using Tailwind CSS breakpoints:

| Breakpoint | Device | Width |
|-----------|--------|-------|
| `sm` | Phones (landscape) | 640px |
| `md` | Tablets | 768px |
| `lg` | Laptops | 1024px |
| `xl` | Desktops | 1280px |
| `2xl` | Large screens | 1536px |

---

## 🎯 Responsive Classes Used

### Container & Spacing
```
container mx-auto px-4 py-8
md:px-6 md:py-12
lg:px-8 lg:py-16
```

### Grid Layouts
```
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
gap-4 md:gap-6 lg:gap-8
```

### Flex Layouts
```
flex flex-col md:flex-row
items-center justify-between
gap-2 md:gap-4 lg:gap-6
```

### Typography
```
text-base md:text-lg lg:text-xl
leading-relaxed md:leading-loose
text-balance text-pretty
```

---

## ✅ Components Optimized for Mobile

### 1. Header & Navigation
- Mobile: Hamburger menu (hidden on sm)
- Tablet: Simplified navigation
- Desktop: Full navigation bar
- Sticky header on scroll
- Touch-friendly button sizes (44px minimum)

### 2. Content Grid
- Mobile: Single column (grid-cols-1)
- Tablet: 2 columns (md:grid-cols-2)
- Desktop: 3-4 columns (lg:grid-cols-3, xl:grid-cols-4)
- Responsive gaps (gap-4 md:gap-6)

### 3. Video Player
- Mobile: Full width, maintains aspect ratio
- Tablet: Centered with max-width
- Desktop: Theater mode available
- Touch controls on mobile
- Keyboard controls on desktop

### 4. Forms & Inputs
- Mobile: Full width inputs
- Tablet: 2-column layout (md:grid-cols-2)
- Desktop: Multi-column with proper spacing
- Label always visible on mobile
- Inline labels on desktop (optional)

### 5. Admin Panels
- Mobile: Single column, expandable sections
- Tablet: 2 columns with sidebar
- Desktop: 3 columns (sidebar + main + details)
- Collapsible menu on mobile
- Fixed sidebar on desktop

### 6. Modals & Overlays
- Mobile: Full screen with padding
- Tablet: 80% width, centered
- Desktop: 60% width, centered
- Close button easily accessible
- Swipe to close on mobile

---

## 🔧 Responsive Patterns in Code

### Pattern 1: Grid with Responsive Columns
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {/* Items automatically reflow */}
</div>
```

### Pattern 2: Flex with Direction Change
```tsx
<div className="flex flex-col md:flex-row items-start md:items-center gap-4">
  {/* Stacks on mobile, side-by-side on tablet+ */}
</div>
```

### Pattern 3: Typography Scaling
```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Responsive Title
</h1>
```

### Pattern 4: Spacing Optimization
```tsx
<div className="px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-12">
  {/* More padding on larger screens */}
</div>
```

### Pattern 5: Hiding Elements by Screen Size
```tsx
{/* Hide on mobile, show on tablet+ */}
<div className="hidden md:block">
  Desktop only content
</div>

{/* Show on mobile, hide on tablet+ */}
<div className="md:hidden">
  Mobile only content
</div>
```

---

## 📐 Layout Methods Priority

### 1. Flexbox (90% of layouts)
```tsx
<div className="flex flex-col md:flex-row gap-4">
  {/* Use for navigation, cards, headers */}
</div>
```

### 2. CSS Grid (10% of layouts)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Use for image galleries, complex layouts */}
</div>
```

### 3. Avoid Float & Absolute
- No floats (use flexbox instead)
- No absolute positioning (use flexbox/grid)
- Except for modals and overlays

---

## 🎨 Mobile-First Approach

All styles start with mobile design, then enhance:

```tsx
// ❌ WRONG - Desktop first
<div className="md:block hidden">

// ✅ CORRECT - Mobile first
<div className="block md:hidden">
```

### Build Process:
1. Design for mobile (base styles)
2. Enhance for tablet (md:)
3. Enhance for desktop (lg:, xl:)
4. Test on actual devices

---

## 📊 Common Responsive Issues & Fixes

### Issue 1: Text Overflowing
```tsx
// ❌ WRONG
<p className="whitespace-nowrap">Long text</p>

// ✅ CORRECT
<p className="text-balance break-words">Long text</p>
```

### Issue 2: Images Not Responsive
```tsx
// ❌ WRONG
<img src="..." width="800" height="600" />

// ✅ CORRECT
<Image 
  src="..." 
  alt="..." 
  width={800} 
  height={600}
  className="w-full h-auto"
/>
```

### Issue 3: Padding/Margin Too Small on Mobile
```tsx
// ❌ WRONG
<div className="p-8">Too much on mobile</div>

// ✅ CORRECT
<div className="p-4 md:p-6 lg:p-8">Better spacing</div>
```

### Issue 4: Buttons Too Small on Mobile
```tsx
// ❌ WRONG
<button className="px-2 py-1">Too small</button>

// ✅ CORRECT
<button className="px-4 py-2 md:px-6 md:py-3">Good size</button>
```

---

## 🧪 Testing Responsive Design

### Browser DevTools
1. Open Chrome DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Test sizes:
   - iPhone 14 (390px)
   - iPad (820px)
   - Laptop (1440px)

### Actual Devices
- iPhone/Android (5" screen)
- iPad/Android tablet (10" screen)
- MacBook/Windows laptop (14" screen)
- Desktop monitor (24" screen)

### Testing Checklist
- [ ] No horizontal scrolling on mobile
- [ ] Text readable without zooming
- [ ] Buttons at least 44x44px
- [ ] Proper spacing between elements
- [ ] Images scale correctly
- [ ] Forms work on touch devices
- [ ] Navigation accessible on small screens
- [ ] Modals don't cover entire screen
- [ ] Video player works on all sizes
- [ ] Admin panels usable on tablets

---

## 🎯 Components Responsive Status

### ✅ Fully Responsive
- Header/Navigation
- Content Grid
- Forms
- Cards
- Modals
- Video Player
- User Settings
- Audit Logs

### 🔄 Partially Responsive
- Admin Sidebar (collapsible on mobile)
- Branding Editor (single column on mobile)
- Admin Dashboard (simplified on mobile)

### ⚠️ Desktop-Only (by design)
- Advanced Admin Features
- Complex Data Tables
- (Should show message on mobile)

---

## 📝 Best Practices

1. **Always use mobile-first approach**
   - Start with base styles for mobile
   - Add md:, lg:, xl: prefixes for larger screens

2. **Use container queries when available**
   - Better than media queries for components
   - More flexible and reusable

3. **Touch-friendly sizes**
   - Minimum 44x44px for buttons
   - Minimum 16px font size
   - Proper spacing between clickable elements

4. **Readable text on mobile**
   - Use text-balance for titles
   - Line height 1.5-1.6 for body text
   - Max-width 65ch for body text

5. **Images & media**
   - Always use aspect-ratio
   - Use srcset for different screen sizes
   - Lazy load images below fold

6. **Performance**
   - Minimize CSS for mobile
   - Optimize images for mobile
   - Defer non-critical CSS

---

## 🔗 Resources

- Tailwind Responsive Design: https://tailwindcss.com/docs/responsive-design
- MDN Responsive Design: https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design
- Mobile-First CSS: https://www.uxmatters.com/articles/2012/03/design-for-mobile-first.php

---

## 📈 Browser Support

Supported browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 6+)

---

## 🚀 Deployment Tips

Before deploying:
1. Test on actual mobile devices
2. Check viewport meta tag in HTML
3. Verify no console errors on mobile
4. Test touch interactions
5. Check loading time on slow 3G
6. Verify form submission on mobile
7. Test video playback on mobile

---

Last Updated: 2026-04-24
Version: 1.0
