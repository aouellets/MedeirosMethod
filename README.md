# Justin Medeiros Training App
**"Earned Every Day"**

A bold, authentic training and lifestyle platform grounded in consistency, community, and confidence. Built for athletes who show up, keep going, and do the work without needing flash.

> More raw than polished. More earth than chrome.

## 📱 App Overview

The Justin Medeiros App is a React Native/Expo mobile application that embodies the "Earned Every Day" philosophy - focusing on daily grind, authentic training experiences, and building a community around consistent effort rather than just highlight reels.

### Core Features
- **Training Programs**: Daily workouts and structured training plans
- **Community Feed**: Share progress, connect with fellow athletes
- **Store**: Training gear and nutrition products
- **Progress Tracking**: Monitor consistency and growth
- **User Profiles**: Personal training journey documentation

## 🧭 Brand Pillars

| Pillar | Description |
|--------|-------------|
| **Honest Work Ethic** | Clean, minimalist interface focused on function over flair |
| **Accessible Strength** | Broad appeal for everyday athletes, not just elites |
| **Training as a Lifestyle** | Every screen reinforces habit, routine, and growth |
| **Community Roots** | Built around shared grind and the ethos Justin lives |

## 🎨 Visual Identity & Design System

### Color Palette
```
🟦 Primary - Slate Blue: #3A506B (Headers, text, CTAs)
🟧 Accent - Burnt Orange: #E07A5F (Action buttons, price tags)
🟨 Base - Bone White: #F4F1DE (Backgrounds)
🟫 Neutral - Sand: #D8C3A5 (Cards, surfaces, highlights)
⚫ Dark - Graphite Gray: #2F2F2F (Body text, icons, outlines)
🟩 Success - Forest Green: #4F772D (Workout completion, positive states)
❌ Error - Rust Red: #C44536 (Form errors, failed actions)
```

### Typography
- **Headlines**: Poppins SemiBold (Page titles, section headers)
- **Body Text**: Roboto Regular (Descriptive text, labels)
- **Captions**: Roboto Light (Timestamps, status indicators)

### Design Principles
- **Clean but not cold**: Natural color warmth with strategic whitespace
- **Functional first**: Minimal animations, fast load times
- **Easy navigation**: 3-click max to any feature
- **Real over perfect**: Authentic photos showing effort, not polish

## 🔧 Technical Stack

- **Framework**: React Native with Expo (~53.0.11)
- **Language**: JavaScript/TypeScript
- **State Management**: [To be implemented]
- **Navigation**: [To be implemented]
- **Backend**: [To be implemented]
- **Database**: [To be implemented]

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Mac) or Android Studio (Android development)

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd MedeirosMethod

# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platforms
npm run ios     # iOS simulator
npm run android # Android emulator
npm run web     # Web browser
```

## 📱 App Architecture

### Screen Structure
```
├── Home (Dashboard)
├── Workouts
│   ├── Today's Training
│   ├── Program Overview
│   └── Exercise Library
├── Store
│   ├── Products
│   ├── Cart
│   └── Orders
├── Community
│   ├── Feed
│   ├── Challenges
│   └── Leaderboards
└── Profile
    ├── Progress
    ├── Settings
    └── Preferences
```

### Navigation Pattern
- **Bottom Tab Navigation**: 5 main sections (Home, Workouts, Store, Community, Profile)
- **Stack Navigation**: Within each section for detailed views
- **Modal Presentation**: For actions like posting, purchasing, settings

## 🎨 UI Component Library

### Buttons
```javascript
// Primary Button - Burnt Orange background, white text
<PrimaryButton>Start Training</PrimaryButton>

// Secondary Button - Outline style in Slate Blue
<SecondaryButton>View Details</SecondaryButton>

// Ghost Button - Text only with underline hover
<GhostButton>Cancel</GhostButton>
```

### Cards
```javascript
// Workout Card - Sand background, drop shadow
<WorkoutCard
  title="Upper Body Strength" // Slate Blue
  duration="45 min"          // Burnt Orange badge
  difficulty="Intermediate"   // Graphite text
/>

// Product Card - Bone background, product focus
<ProductCard
  image={productImage}
  name="Training Tee"        // Slate Blue
  price="$29.99"            // Burnt Orange
/>
```

### Form Elements
- **Text Inputs**: Rounded fields with Sand fill, Graphite text
- **Toggles**: Pill shape, Burnt Orange when active
- **Dropdowns**: Flat lists with light hover highlights

## ✍️ Voice & Tone

### Brand Voice
- **Honest & Motivational**: Coach-like, less hype, more substance
- **Clear & Direct**: No fluff, straight to the point
- **Encouraging**: Focus on consistency over intensity

### Example Copy
- **Taglines**: "Earned Every Day", "Grit Over Glam", "Train Like It's Personal"
- **CTAs**: "Let's Go", "Start Training", "Add to Bag", "Join the Grind"
- **Messages**: "No shortcuts. No excuses.", "Consistency beats intensity.", "Show up. That's the win."

## 📸 Photography & Media Guidelines

### Photo Style
- **Environment**: Garage gyms, dusty floors, outdoor workouts
- **Lighting**: Natural light preferred, avoid high-contrast artificial
- **Mood**: Raw training environments, sweat details, human moments
- **Composition**: Focus on effort and authenticity over polished poses

### Video Content
- **Format**: Vertical (9:16) for mobile-first experience
- **Duration**: 15-60 seconds for feed content
- **Style**: Documentary-style, behind-the-scenes training footage

## 🛠️ Development Guidelines

### Code Standards
- Use functional components with hooks
- Implement TypeScript for type safety
- Follow React Native best practices
- Use ESLint and Prettier for code formatting

### File Structure
```
src/
├── components/        # Reusable UI components
├── screens/          # Screen components
├── navigation/       # Navigation configuration
├── services/         # API calls and external services
├── utils/           # Helper functions
├── constants/       # App constants (colors, fonts, etc.)
├── assets/          # Images, fonts, static files
└── types/           # TypeScript type definitions
```

### Component Naming
- Use PascalCase for component names
- Use descriptive names that reflect functionality
- Group related components in folders

## 🎯 Key Features to Implement

### Phase 1 - Foundation
- [ ] App navigation structure
- [ ] Design system implementation
- [ ] Basic screens (Home, Profile, Settings)
- [ ] Authentication flow

### Phase 2 - Core Features
- [ ] Workout library and tracking
- [ ] Community feed functionality
- [ ] Store/e-commerce integration
- [ ] User profile and progress tracking

### Phase 3 - Advanced Features
- [ ] Push notifications
- [ ] Offline functionality
- [ ] Social features (following, sharing)
- [ ] Analytics and insights

## 🧪 Testing Strategy

- **Unit Tests**: Jest for utility functions and hooks
- **Component Tests**: React Native Testing Library
- **E2E Tests**: Detox for critical user flows
- **Manual Testing**: Regular testing on both iOS and Android devices

## 📱 Platform Considerations

### iOS
- Follow Apple Human Interface Guidelines
- Test on various iPhone sizes
- Optimize for iOS-specific gestures and interactions

### Android
- Follow Material Design principles
- Test on various Android devices and screen sizes
- Handle Android-specific permissions and behaviors

## 🚀 Deployment

### Development
- Use Expo Development Build for testing
- Test on physical devices regularly
- Use Expo's over-the-air updates for quick iterations

### Production
- Build standalone apps for App Store and Google Play
- Implement proper app signing and certificates
- Set up continuous integration/deployment pipeline

## 📞 Support & Resources

### Documentation
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Design System Reference](./docs/design-system.md) *(to be created)*

### Team Communication
- Use clear commit messages
- Document any breaking changes
- Maintain this README with updates

---

**Remember**: This app represents the "Earned Every Day" philosophy. Every decision should reflect authenticity, functionality, and the daily grind that defines true athletes. We're building more than an app - we're building a community platform that honors the work behind the results.
