// Navigation Configuration for Medeiros Method App
export const linkingConfig = {
  prefixes: ['medeirosmethod://', 'https://medeirosmethod.com'],
  config: {
    screens: {
      Auth: {
        screens: {
          Splash: 'splash',
          Welcome: 'welcome',
          SignUp: 'signup',
          Login: 'login',
          Confirmation: 'confirmation',
        },
      },
      MainApp: {
        screens: {
          Training: {
            screens: {
              TrainingHome: 'training',
              TrackSelector: 'training/tracks',
              WorkoutPreview: 'training/workout/:workoutId',
              WorkoutPlayer: 'training/workout/:workoutId/play',
              WorkoutComplete: 'training/workout/:workoutId/complete',
              WorkoutHistory: 'training/history',
            },
          },
          Store: {
            screens: {
              StoreHome: 'store',
              ProductDetail: 'store/product/:productId',
              Cart: 'store/cart',
            },
          },
          Community: {
            screens: {
              CommunityFeed: 'community',
              CreatePost: 'community/create',
            },
          },
        },
      },
    },
  },
};

// Route names for type safety and easy reference
export const ROUTES = {
  // Auth Flow
  AUTH: {
    SPLASH: 'Splash',
    WELCOME: 'Welcome',
    SIGN_UP: 'SignUp',
    LOGIN: 'Login',
    CONFIRMATION: 'Confirmation',
  },
  
  // Main App
  MAIN_APP: 'MainApp',
  
  // Training Flow
  TRAINING: {
    HOME: 'TrainingHome',
    TRACK_SELECTOR: 'TrackSelector',
    WORKOUT_PREVIEW: 'WorkoutPreview',
    WORKOUT_PLAYER: 'WorkoutPlayer',
    WORKOUT_COMPLETE: 'WorkoutComplete',
    WORKOUT_HISTORY: 'WorkoutHistory',
  },
  
  // Commerce Flow
  COMMERCE: {
    STORE_HOME: 'StoreHome',
    PRODUCT_DETAIL: 'ProductDetail',
    CART: 'Cart',
  },
  
  // Social Flow
  SOCIAL: {
    COMMUNITY_FEED: 'CommunityFeed',
    CREATE_POST: 'CreatePost',
  },
  
  // Tab Navigation
  TABS: {
    TRAINING: 'Training',
    STORE: 'Store',
    COMMUNITY: 'Community',
  },
};

// Screen options configurations
export const SCREEN_OPTIONS = {
  // Common options
  MODAL: {
    presentation: 'modal',
    gestureEnabled: true,
    headerShown: false,
  },
  
  FULL_SCREEN: {
    headerShown: false,
    gestureEnabled: false,
  },
  
  STANDARD: {
    headerShown: true,
    gestureEnabled: true,
    headerBackTitleVisible: false,
  },
};

export default {
  linkingConfig,
  ROUTES,
  SCREEN_OPTIONS,
}; 