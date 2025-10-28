import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Navigation State Context
const NavigationStateContext = createContext();

// Action Types
const NAVIGATION_ACTIONS = {
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  SET_MOBILE_MENU_EXPANDED: 'SET_MOBILE_MENU_EXPANDED',
  SET_AUTHENTICATION_STATE: 'SET_AUTHENTICATION_STATE',
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
  SET_BREADCRUMBS: 'SET_BREADCRUMBS',
  SET_PAGE_LOADING: 'SET_PAGE_LOADING',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  TOGGLE_SIDEBAR_COLLAPSED: 'TOGGLE_SIDEBAR_COLLAPSED'
};

// Initial State
const initialState = {
  activeTab: '/artist-dashboard',
  navigationHistory: [],
  authenticationState: {
    isAuthenticated: false,
    user: null,
    loading: true
  },
  mobileMenuExpanded: false,
  sidebarCollapsed: false,
  breadcrumbs: [],
  pageLoading: false,
  notifications: {
    unreadCount: 0,
    items: []
  }
};

// Reducer
const navigationReducer = (state, action) => {
  switch (action?.type) {
    case NAVIGATION_ACTIONS?.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action?.payload
      };

    case NAVIGATION_ACTIONS?.SET_MOBILE_MENU_EXPANDED:
      return {
        ...state,
        mobileMenuExpanded: action?.payload
      };

    case NAVIGATION_ACTIONS?.SET_AUTHENTICATION_STATE:
      return {
        ...state,
        authenticationState: {
          ...state?.authenticationState,
          ...action?.payload
        }
      };

    case NAVIGATION_ACTIONS?.ADD_TO_HISTORY:
      return {
        ...state,
        navigationHistory: [
          ...state?.navigationHistory?.slice(-9), // Keep last 10 items
          {
            path: action?.payload?.path,
            timestamp: Date.now(),
            title: action?.payload?.title
          }
        ]
      };

    case NAVIGATION_ACTIONS?.SET_BREADCRUMBS:
      return {
        ...state,
        breadcrumbs: action?.payload
      };

    case NAVIGATION_ACTIONS?.SET_PAGE_LOADING:
      return {
        ...state,
        pageLoading: action?.payload
      };

    case NAVIGATION_ACTIONS?.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action?.payload
      };

    case NAVIGATION_ACTIONS?.TOGGLE_SIDEBAR_COLLAPSED:
      return {
        ...state,
        sidebarCollapsed: !state?.sidebarCollapsed
      };

    default:
      return state;
  }
};

// Navigation State Provider
export const NavigationStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(navigationReducer, initialState);
  const location = useLocation();
  const navigate = useNavigate();

  // Route to title mapping
  const routeTitles = {
    '/artist-dashboard': 'Dashboard',
    '/music-upload-management': 'Music Upload',
    '/analytics-revenue-tracking': 'Analytics & Revenue',
    '/artist-profile-management': 'Profile Management',
    '/artist-login': 'Sign In',
    '/artist-registration': 'Sign Up'
  };

  // Update active tab based on current location
  useEffect(() => {
    const currentPath = location?.pathname;
    dispatch({
      type: NAVIGATION_ACTIONS?.SET_ACTIVE_TAB,
      payload: currentPath
    });

    // Add to navigation history
    const title = routeTitles?.[currentPath] || 'Unknown Page';
    dispatch({
      type: NAVIGATION_ACTIONS?.ADD_TO_HISTORY,
      payload: { path: currentPath, title }
    });

    // Generate breadcrumbs
    const breadcrumbs = generateBreadcrumbs(currentPath);
    dispatch({
      type: NAVIGATION_ACTIONS?.SET_BREADCRUMBS,
      payload: breadcrumbs
    });

    // Close mobile menu on navigation
    dispatch({
      type: NAVIGATION_ACTIONS?.SET_MOBILE_MENU_EXPANDED,
      payload: false
    });
  }, [location?.pathname]);

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = (path) => {
    const breadcrumbs = [
      { label: 'Home', path: '/artist-dashboard' }
    ];

    switch (path) {
      case '/artist-dashboard':
        return [{ label: 'Dashboard', path: '/artist-dashboard' }];
      
      case '/music-upload-management':
        breadcrumbs?.push({ label: 'Music Upload', path: '/music-upload-management' });
        break;
      
      case '/analytics-revenue-tracking':
        breadcrumbs?.push({ label: 'Analytics & Revenue', path: '/analytics-revenue-tracking' });
        break;
      
      case '/artist-profile-management':
        breadcrumbs?.push({ label: 'Profile Management', path: '/artist-profile-management' });
        break;
      
      default:
        if (path !== '/artist-dashboard') {
          breadcrumbs?.push({ label: routeTitles?.[path] || 'Page', path });
        }
    }

    return breadcrumbs;
  };

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Simulate auth check
        const token = localStorage.getItem('kentune-auth-token');
        const user = localStorage.getItem('kentune-user');
        
        if (token && user) {
          dispatch({
            type: NAVIGATION_ACTIONS?.SET_AUTHENTICATION_STATE,
            payload: {
              isAuthenticated: true,
              user: JSON.parse(user),
              loading: false
            }
          });
        } else {
          dispatch({
            type: NAVIGATION_ACTIONS?.SET_AUTHENTICATION_STATE,
            payload: {
              isAuthenticated: false,
              user: null,
              loading: false
            }
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({
          type: NAVIGATION_ACTIONS?.SET_AUTHENTICATION_STATE,
          payload: {
            isAuthenticated: false,
            user: null,
            loading: false
          }
        });
      }
    };

    initializeAuth();
  }, []);

  // Navigation actions
  const actions = {
    setActiveTab: (tab) => {
      dispatch({
        type: NAVIGATION_ACTIONS?.SET_ACTIVE_TAB,
        payload: tab
      });
    },

    toggleMobileMenu: () => {
      dispatch({
        type: NAVIGATION_ACTIONS?.SET_MOBILE_MENU_EXPANDED,
        payload: !state?.mobileMenuExpanded
      });
    },

    closeMobileMenu: () => {
      dispatch({
        type: NAVIGATION_ACTIONS?.SET_MOBILE_MENU_EXPANDED,
        payload: false
      });
    },

    setAuthenticationState: (authState) => {
      dispatch({
        type: NAVIGATION_ACTIONS?.SET_AUTHENTICATION_STATE,
        payload: authState
      });
    },

    navigateWithLoading: async (path) => {
      dispatch({
        type: NAVIGATION_ACTIONS?.SET_PAGE_LOADING,
        payload: true
      });

      // Simulate loading delay for better UX
      setTimeout(() => {
        navigate(path);
        dispatch({
          type: NAVIGATION_ACTIONS?.SET_PAGE_LOADING,
          payload: false
        });
      }, 150);
    },

    updateNotifications: (notifications) => {
      dispatch({
        type: NAVIGATION_ACTIONS?.SET_NOTIFICATIONS,
        payload: notifications
      });
    },

    toggleSidebar: () => {
      dispatch({
        type: NAVIGATION_ACTIONS?.TOGGLE_SIDEBAR_COLLAPSED
      });
    },

    // Utility functions
    isActivePath: (path) => {
      return state?.activeTab === path;
    },

    getPageTitle: () => {
      return routeTitles?.[state?.activeTab] || 'KenTune';
    },

    canGoBack: () => {
      return state?.navigationHistory?.length > 1;
    },

    goBack: () => {
      if (state?.navigationHistory?.length > 1) {
        const previousPage = state?.navigationHistory?.[state?.navigationHistory?.length - 2];
        navigate(previousPage?.path);
      }
    }
  };

  const value = {
    state,
    actions,
    dispatch
  };

  return (
    <NavigationStateContext.Provider value={value}>
      {children}
    </NavigationStateContext.Provider>
  );
};

// Custom hook to use navigation state
export const useNavigationState = () => {
  const context = useContext(NavigationStateContext);
  
  if (!context) {
    throw new Error('useNavigationState must be used within a NavigationStateProvider');
  }
  
  return context;
};

// Custom hook for authentication state
export const useAuthState = () => {
  const { state, actions } = useNavigationState();
  
  return {
    isAuthenticated: state?.authenticationState?.isAuthenticated,
    user: state?.authenticationState?.user,
    loading: state?.authenticationState?.loading,
    setAuthState: actions?.setAuthenticationState
  };
};

// Custom hook for navigation actions
export const useNavigation = () => {
  const { actions } = useNavigationState();
  
  return {
    navigateWithLoading: actions?.navigateWithLoading,
    isActivePath: actions?.isActivePath,
    getPageTitle: actions?.getPageTitle,
    canGoBack: actions?.canGoBack,
    goBack: actions?.goBack
  };
};