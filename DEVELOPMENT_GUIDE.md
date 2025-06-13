# Justin Medeiros App - Development Guide
**Building the "Earned Every Day" Experience**

This guide provides detailed technical instructions for developers working on the Justin Medeiros Training App. Follow these guidelines to ensure consistent code quality, maintainable architecture, and alignment with our brand philosophy.

---

## 🏗️ Project Architecture

### Technology Stack
- **Framework**: React Native 0.79.3 with Expo SDK 53
- **Language**: TypeScript (recommended) / JavaScript
- **State Management**: Context API + Hooks (simple) or Redux Toolkit (complex)
- **Navigation**: React Navigation v6
- **Styling**: StyleSheet with design tokens
- **Backend**: [TBD - Firebase/Supabase/Custom API]
- **Testing**: Jest + React Native Testing Library

### Project Structure
```
MedeirosMethod/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Basic UI elements (Button, Card, Input)
│   │   ├── forms/           # Form-specific components
│   │   ├── navigation/      # Navigation components
│   │   └── layout/          # Layout components
│   ├── screens/             # Screen components
│   │   ├── Home/
│   │   ├── Workouts/
│   │   ├── Store/
│   │   ├── Community/
│   │   └── Profile/
│   ├── navigation/          # Navigation configuration
│   ├── services/            # API calls and external services
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Helper functions
│   ├── constants/           # App constants and design tokens
│   ├── types/               # TypeScript type definitions
│   └── assets/              # Images, fonts, static files
├── __tests__/               # Test files
├── docs/                    # Documentation
└── config/                  # Configuration files
```

---

## 🎨 Design Token Implementation

### Color Constants
Create `src/constants/colors.ts`:
```typescript
export const Colors = {
  // Primary Colors
  slate: {
    blue: '#3A506B',
    light: '#4A6A85',
    dark: '#2A3B51',
  },
  burnt: {
    orange: '#E07A5F',
    light: '#E89B85',
    dark: '#C25A3F',
  },
  
  // Neutral Colors
  bone: '#F4F1DE',
  sand: '#D8C3A5',
  graphite: '#2F2F2F',
  
  // Semantic Colors
  success: '#4F772D',
  error: '#C44536',
  warning: '#F4A261',
  info: '#6B8CAE',
  
  // Aliases for easy use
  primary: '#3A506B',
  accent: '#E07A5F',
  background: '#F4F1DE',
  text: '#2F2F2F',
  textSecondary: '#6B8CAE',
} as const;
```

### Typography Constants
Create `src/constants/typography.ts`:
```typescript
export const Typography = {
  fontFamily: {
    primary: 'Poppins',
    secondary: 'Roboto',
  },
  
  fontSize: {
    h1: 32,
    h2: 24,
    h3: 20,
    h4: 18,
    bodyLarge: 16,
    body: 14,
    caption: 12,
    small: 10,
  },
  
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;
```

### Spacing Constants
Create `src/constants/spacing.ts`:
```typescript
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Layout = {
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
  },
} as const;
```

---

## 🧱 Component Development

### Base Component Structure
Every component should follow this pattern:

```typescript
// src/components/ui/Button/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Typography, Spacing, Layout } from '../../../constants';

interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onPress,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
  ];

  const textStyle = [
    styles.text,
    styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : Colors.primary} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.lg,
    ...Layout.shadow.md,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  
  // Sizes
  small: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
  },
  medium: {
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.lg,
  },
  large: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  
  // States
  disabled: {
    opacity: 0.6,
  },
  
  // Text styles
  text: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily.secondary,
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textSecondary: {
    color: Colors.primary,
  },
  textGhost: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});
```

### Component Export Pattern
Create `src/components/ui/Button/index.ts`:
```typescript
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

---

## 🚀 Screen Development

### Screen Component Template
```typescript
// src/screens/Home/HomeScreen.tsx
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../constants';
import { Header, Button, WorkoutCard } from '../../components';

export const HomeScreen: React.FC = () => {
  const handleStartWorkout = () => {
    // Navigation logic
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Today's Training" />
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          {/* Screen content */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  section: {
    marginVertical: Spacing.lg,
  },
});
```

---

## 🧪 Testing Standards

### Component Testing
```typescript
// src/components/ui/Button/__tests__/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} disabled />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});
```

### Test Configuration
Update `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "preset": "react-native",
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
    "transformIgnorePatterns": [
      "node_modules/(?!(react-native|@react-native|expo|@expo)/)"
    ]
  }
}
```

---

## 🎯 Navigation Setup

### Navigation Structure
```typescript
// src/navigation/types.ts
export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  Onboarding: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Workouts: undefined;
  Store: undefined;
  Community: undefined;
  Profile: undefined;
};

export type WorkoutStackParamList = {
  WorkoutList: undefined;
  WorkoutDetail: { workoutId: string };
  Exercise: { exerciseId: string };
};
```

### Tab Navigator
```typescript
// src/navigation/MainTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors, Typography } from '../constants';
import { HomeScreen, WorkoutsScreen, StoreScreen, CommunityScreen, ProfileScreen } from '../screens';
import { TabIcon } from '../components';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.sand,
          paddingVertical: 8,
        },
        tabBarLabelStyle: {
          fontSize: Typography.fontSize.caption,
          fontWeight: Typography.fontWeight.medium,
          fontFamily: Typography.fontFamily.secondary,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.graphite,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <TabIcon name="home" color={color} size={size} />,
        }}
      />
      {/* Add other tabs */}
    </Tab.Navigator>
  );
};
```

---

## 🔧 State Management

### Context API Pattern (Simple State)
```typescript
// src/context/AuthContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR' }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
      };
    case 'AUTH_ERROR':
      return { ...state, isLoading: false };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
};

const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
} | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      // API call logic
      const user = { id: '1', name: 'User', email };
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

---

## 🌐 API Integration

### Service Layer Pattern
```typescript
// src/services/api.ts
const API_BASE_URL = 'https://api.medeirosmethod.com';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Workouts
  async getWorkouts() {
    return this.request<Workout[]>('/workouts');
  }

  async getWorkout(id: string) {
    return this.request<Workout>(`/workouts/${id}`);
  }

  // User
  async getUser(id: string) {
    return this.request<User>(`/users/${id}`);
  }

  async updateUser(id: string, data: Partial<User>) {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
```

### Custom Hooks for Data Fetching
```typescript
// src/hooks/useWorkouts.ts
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Workout } from '../types';

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        const data = await apiService.getWorkouts();
        setWorkouts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch workouts');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  const refreshWorkouts = async () => {
    setError(null);
    await fetchWorkouts();
  };

  return { workouts, loading, error, refreshWorkouts };
};
```

---

## 📱 Platform-Specific Considerations

### Safe Area Handling
```typescript
// Always use SafeAreaView for screen containers
import { SafeAreaView } from 'react-native-safe-area-context';

const ScreenComponent = () => (
  <SafeAreaView style={{ flex: 1 }}>
    {/* Screen content */}
  </SafeAreaView>
);
```

### Platform-Specific Styles
```typescript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  button: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});
```

---

## 🚀 Development Workflow

### Git Workflow
1. **Feature Branches**: `feature/workout-tracking`
2. **Bug Fixes**: `fix/login-validation`
3. **Hotfixes**: `hotfix/critical-crash`

### Commit Message Format
```
type(scope): short description

Examples:
feat(workouts): add workout timer functionality
fix(auth): resolve login validation issue
style(ui): update button component styling
docs(readme): update installation instructions
```

### Code Review Checklist
- [ ] Follows design system guidelines
- [ ] Includes appropriate tests
- [ ] Handles error states
- [ ] Follows TypeScript best practices
- [ ] Accessible (proper contrast, touch targets)
- [ ] Performance considerations addressed
- [ ] No console.log statements left in code

---

## 🎯 Performance Guidelines

### Optimization Strategies
1. **Use FlatList for long lists** instead of ScrollView with map
2. **Implement proper image caching** with libraries like react-native-fast-image
3. **Use useMemo and useCallback** for expensive computations
4. **Implement proper loading states** and error boundaries
5. **Bundle size optimization** with proper tree shaking

### Example Optimized List Component
```typescript
const WorkoutList: React.FC = () => {
  const { workouts, loading } = useWorkouts();

  const renderWorkout = useCallback(({ item }: { item: Workout }) => (
    <WorkoutCard key={item.id} workout={item} />
  ), []);

  const keyExtractor = useCallback((item: Workout) => item.id, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <FlatList
      data={workouts}
      renderItem={renderWorkout}
      keyExtractor={keyExtractor}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
    />
  );
};
```

---

## 🔍 Debugging and Development Tools

### React Native Debugger Setup
1. Install React Native Debugger
2. Configure remote debugging
3. Use Redux DevTools (if using Redux)

### Useful Development Commands
```bash
# Clear cache and restart
npm start -- --clear

# iOS simulator
npm run ios

# Android emulator
npm run android

# Generate APK for testing
eas build --platform android --profile preview

# Type checking
npx tsc --noEmit

# Linting
npx eslint src/

# Testing
npm test
```

---

## 📋 Pre-Launch Checklist

### Code Quality
- [ ] All components tested
- [ ] TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Performance profiling completed

### Design Implementation
- [ ] Design system correctly implemented
- [ ] All colors from brand palette
- [ ] Typography consistent
- [ ] Spacing using design tokens
- [ ] Voice and tone guidelines followed

### Functionality
- [ ] All user flows tested
- [ ] Error states handled
- [ ] Loading states implemented
- [ ] Offline functionality (if applicable)
- [ ] Push notifications working

### Platform Testing
- [ ] iOS testing on multiple devices
- [ ] Android testing on multiple devices
- [ ] Different screen sizes tested
- [ ] Dark mode (if implemented)

---

**Remember**: Every line of code should reflect the "Earned Every Day" philosophy. Write code that's honest, functional, and built to last - just like the training principles the app represents. 