# Justin Medeiros App - Design System Guide
**"Earned Every Day" - Natural Earth Theme**

This document serves as the comprehensive design system reference for the Justin Medeiros Training App. Every component, interaction, and visual element should align with our brand philosophy of authenticity, functionality, and the daily grind.

## 🎨 Brand Theme: "Natural Earth"

Our design system is built around natural, earthy tones that reflect the raw, authentic training environments where real work happens - garage gyms, outdoor spaces, and dusty training floors.

---

## 🎯 Design Principles

### 1. **Clean but not Cold**
- Use natural color warmth and strategic whitespace
- Avoid sterile, overly minimal designs
- Add subtle textures and organic elements

### 2. **Functional First**
- Every element serves a purpose
- Minimize decorative animations
- Prioritize fast load times and smooth interactions

### 3. **Real over Perfect**
- Show effort and authenticity
- Avoid overly polished, unrealistic imagery
- Embrace imperfection as part of the brand

### 4. **Accessible Strength**  
- Design for all fitness levels
- Ensure high contrast and readability
- Support various screen sizes and devices

---

## 🌈 Color System

### Primary Colors
```css
/* Slate Blue - Primary Brand Color */
--slate-blue: #3A506B;
--slate-blue-light: #4A6A85;
--slate-blue-dark: #2A3B51;

/* Burnt Orange - Accent Color */
--burnt-orange: #E07A5F;
--burnt-orange-light: #E89B85;
--burnt-orange-dark: #C25A3F;
```

### Neutral Colors
```css
/* Base Colors */
--bone-white: #F4F1DE;
--sand: #D8C3A5;
--graphite-gray: #2F2F2F;

/* Semantic Colors */
--forest-green: #4F772D;      /* Success */
--rust-red: #C44536;          /* Error */
--amber-yellow: #F4A261;      /* Warning */
--steel-blue: #6B8CAE;        /* Info */
```

### Usage Guidelines
- **Slate Blue**: Headers, primary text, main CTAs, navigation elements
- **Burnt Orange**: Action buttons, price tags, progress indicators, active states
- **Bone White**: Main backgrounds, card surfaces
- **Sand**: Secondary backgrounds, card highlights, hover states
- **Graphite Gray**: Body text, icons, borders, secondary elements

---

## 📝 Typography System

### Font Families
```css
/* Headlines and Emphasis */
--font-primary: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;

/* Body Text and UI */
--font-secondary: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Type Scale
```css
/* Headlines */
--text-h1: 32px;    /* Page titles */
--text-h2: 24px;    /* Section headers */
--text-h3: 20px;    /* Subsection headers */
--text-h4: 18px;    /* Card titles */

/* Body Text */
--text-body-large: 16px;    /* Primary body text */
--text-body: 14px;          /* Secondary body text */
--text-caption: 12px;       /* Captions, timestamps */
--text-small: 10px;         /* Labels, tags */
```

### Font Weights
```css
--weight-light: 300;
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

### Typography Examples
```jsx
// Page Title
<Text style={{
  fontFamily: 'Poppins',
  fontSize: 32,
  fontWeight: '600',
  color: '#3A506B'
}}>Today's Training</Text>

// Body Text
<Text style={{
  fontFamily: 'Roboto',
  fontSize: 16,
  fontWeight: '400',
  color: '#2F2F2F'
}}>Complete your workout to track progress</Text>

// Caption
<Text style={{
  fontFamily: 'Roboto',
  fontSize: 12,
  fontWeight: '300',
  color: '#6B8CAE'
}}>2 hours ago</Text>
```

---

## 📏 Spacing & Layout

### Spacing Scale
```css
--space-xs: 4px;     /* Tight spacing, icon margins */
--space-sm: 8px;     /* Button padding, small gaps */
--space-md: 16px;    /* Card padding, text blocks */
--space-lg: 24px;    /* Section spacing */
--space-xl: 32px;    /* Page margins */
--space-xxl: 48px;   /* Large section breaks */
```

### Layout Grid
- **Mobile**: 4-column grid with 16px gutters
- **Tablet**: 8-column grid with 24px gutters
- **Desktop**: 12-column grid with 32px gutters

### Container Sizing
```css
--container-sm: 400px;   /* Small screens */
--container-md: 768px;   /* Medium screens */
--container-lg: 1024px;  /* Large screens */
--container-xl: 1200px;  /* Extra large screens */
```

---

## 🧱 Component Library

### Buttons

#### Primary Button
```jsx
const PrimaryButton = {
  backgroundColor: '#E07A5F',
  color: '#FFFFFF',
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 8,
  fontSize: 16,
  fontWeight: '600',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3
};
```

#### Secondary Button
```jsx
const SecondaryButton = {
  backgroundColor: 'transparent',
  borderColor: '#3A506B',
  borderWidth: 2,
  color: '#3A506B',
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 8,
  fontSize: 16,
  fontWeight: '500'
};
```

#### Ghost Button
```jsx
const GhostButton = {
  backgroundColor: 'transparent',
  color: '#3A506B',
  paddingVertical: 8,
  paddingHorizontal: 16,
  fontSize: 16,
  fontWeight: '500',
  textDecorationLine: 'underline'
};
```

### Cards

#### Workout Card
```jsx
const WorkoutCard = {
  backgroundColor: '#D8C3A5',
  borderRadius: 8,
  padding: 16,
  marginVertical: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2
};

const WorkoutTitle = {
  fontSize: 18,
  fontWeight: '600',
  color: '#3A506B',
  marginBottom: 8
};

const WorkoutDuration = {
  backgroundColor: '#E07A5F',
  color: '#FFFFFF',
  paddingVertical: 4,
  paddingHorizontal: 8,
  borderRadius: 12,
  fontSize: 12,
  fontWeight: '500'
};
```

#### Product Card
```jsx
const ProductCard = {
  backgroundColor: '#F4F1DE',
  borderRadius: 8,
  padding: 16,
  marginVertical: 8,
  borderWidth: 1,
  borderColor: '#D8C3A5'
};

const ProductName = {
  fontSize: 16,
  fontWeight: '600',
  color: '#3A506B',
  marginBottom: 4
};

const ProductPrice = {
  fontSize: 18,
  fontWeight: '700',
  color: '#E07A5F'
};
```

### Form Elements

#### Text Input
```jsx
const TextInput = {
  backgroundColor: '#D8C3A5',
  borderRadius: 8,
  padding: 12,
  fontSize: 16,
  color: '#2F2F2F',
  borderWidth: 1,
  borderColor: 'transparent',
  marginVertical: 8
};

const TextInputFocused = {
  borderColor: '#3A506B',
  backgroundColor: '#F4F1DE'
};
```

#### Toggle Switch
```jsx
const ToggleSwitch = {
  // Inactive state
  trackColor: { false: '#D8C3A5', true: '#E07A5F' },
  thumbColor: '#FFFFFF',
  ios_backgroundColor: '#D8C3A5'
};
```

---

## 🎭 States & Interactions

### Button States
```jsx
// Default
backgroundColor: '#E07A5F'

// Pressed
backgroundColor: '#C25A3F'
transform: [{ scale: 0.98 }]

// Disabled
backgroundColor: '#D8C3A5'
opacity: 0.6

// Loading
backgroundColor: '#E07A5F'
// Show loading spinner
```

### Interactive Feedback
- **Hover** (web): Slight background tint, 200ms transition
- **Press**: Scale down to 98%, 100ms duration
- **Focus**: Border glow in Slate Blue
- **Disabled**: 60% opacity, no interactions

---

## 🔤 Voice & Tone Examples

### Button Labels
```
✅ Good: "Start Training", "Add to Bag", "Join the Grind"
❌ Avoid: "Click Here", "Submit", "Buy Now"
```

### Headers
```
✅ Good: "Today's Training", "The Shop", "Community Feed"
❌ Avoid: "Dashboard", "Products", "Social"
```

### Messages
```
✅ Good: "Great work! You're 3 days consistent."
❌ Avoid: "Congratulations! You have completed your task."
```

---

## 📱 Navigation Components

### Bottom Tab Navigation
```jsx
const TabBar = {
  backgroundColor: '#F4F1DE',
  borderTopWidth: 1,
  borderTopColor: '#D8C3A5',
  paddingVertical: 8
};

const TabIcon = {
  size: 24,
  color: '#2F2F2F',      // inactive
  activeColor: '#3A506B'  // active
};

const TabLabel = {
  fontSize: 12,
  fontWeight: '500',
  color: '#2F2F2F',      // inactive
  activeColor: '#3A506B'  // active
};
```

### Header Navigation
```jsx
const Header = {
  backgroundColor: '#F4F1DE',
  borderBottomWidth: 1,
  borderBottomColor: '#D8C3A5',
  paddingVertical: 12,
  paddingHorizontal: 16
};

const HeaderTitle = {
  fontSize: 20,
  fontWeight: '600',
  color: '#3A506B'
};
```

---

## 🖼️ Imagery Guidelines

### Photography Style
- **Lighting**: Natural, soft lighting preferred
- **Environment**: Garage gyms, outdoor training, authentic spaces
- **People**: Real athletes, diverse backgrounds, genuine effort
- **Composition**: Rule of thirds, focus on action and emotion

### Image Treatments
```jsx
const ImageOverlay = {
  backgroundColor: 'rgba(42, 59, 81, 0.3)', // Slate Blue overlay
  borderRadius: 8
};

const ImageBorder = {
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#D8C3A5'
};
```

---

## 🎯 Icon System

### Style Guidelines
- **Type**: Stroke-based icons (not filled)
- **Weight**: 1.5px stroke width
- **Style**: Rounded corners, minimalist
- **Size**: 16px, 20px, 24px, 32px
- **Color**: Graphite Gray default, Slate Blue for active states

### Common Icons
```
🏠 home
💪 workout / dumbbell
🛒 shopping-bag
👥 users / community
👤 user / profile
⚙️ settings
📈 trending-up
❤️ heart
📝 edit
🔍 search
```

---

## 🚨 Alert & Feedback Components

### Success Alert
```jsx
const SuccessAlert = {
  backgroundColor: '#4F772D',
  color: '#FFFFFF',
  padding: 12,
  borderRadius: 8,
  fontSize: 14,
  fontWeight: '500'
};
```

### Error Alert
```jsx
const ErrorAlert = {
  backgroundColor: '#C44536',
  color: '#FFFFFF',
  padding: 12,
  borderRadius: 8,
  fontSize: 14,
  fontWeight: '500'
};
```

### Loading States
```jsx
const LoadingSpinner = {
  color: '#E07A5F',
  size: 'large'
};

const LoadingSkeleton = {
  backgroundColor: '#D8C3A5',
  borderRadius: 4,
  opacity: 0.6
};
```

---

## 📐 Responsive Design

### Breakpoints
```css
--mobile: 0px - 767px
--tablet: 768px - 1023px
--desktop: 1024px+
```

### Component Scaling
- **Mobile**: Single column layout, larger touch targets
- **Tablet**: Two-column layout where appropriate
- **Desktop**: Multi-column layout, hover states

---

## ✅ Implementation Checklist

When implementing a component, ensure:

- [ ] Colors match the defined palette
- [ ] Typography follows the scale and weights
- [ ] Spacing uses the defined scale
- [ ] Interactive states are properly implemented
- [ ] Component is accessible (proper contrast, touch targets)
- [ ] Component works across different screen sizes
- [ ] Voice and tone align with brand guidelines

---

## 🔗 Quick Reference

### Most Used Colors
- Primary: `#3A506B` (Slate Blue)
- Accent: `#E07A5F` (Burnt Orange)
- Background: `#F4F1DE` (Bone White)
- Text: `#2F2F2F` (Graphite Gray)

### Most Used Fonts
- Headlines: `Poppins SemiBold`
- Body: `Roboto Regular`

### Most Used Spacing
- Small: `8px`
- Medium: `16px`
- Large: `24px`

---

**Remember**: This design system embodies "Earned Every Day" - every component should feel authentic, functional, and grounded in the real work of training. When in doubt, choose the more honest, straightforward approach over the flashy one. 