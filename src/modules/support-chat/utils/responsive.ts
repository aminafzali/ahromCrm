// Responsive design utilities for support chat components

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export type Breakpoint = keyof typeof breakpoints;

export const getResponsiveValue = <T>(
  values: Partial<Record<Breakpoint, T>>,
  defaultValue: T
): T => {
  // This would be implemented with a proper responsive hook
  // For now, return the largest available value or default
  const sortedBreakpoints: Breakpoint[] = ["2xl", "xl", "lg", "md", "sm"];

  for (const breakpoint of sortedBreakpoints) {
    if (values[breakpoint] !== undefined) {
      return values[breakpoint] as T;
    }
  }

  return defaultValue;
};

export const getChatWindowDimensions = () => ({
  mobile: {
    width: "100vw",
    height: "100vh",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  tablet: {
    width: "90vw",
    height: "80vh",
    maxWidth: "768px",
    maxHeight: "600px",
  },
  desktop: {
    width: "400px",
    height: "600px",
    maxWidth: "400px",
    maxHeight: "600px",
  },
});

export const getMessageListDimensions = () => ({
  mobile: {
    height: "calc(100vh - 200px)",
    maxHeight: "400px",
  },
  tablet: {
    height: "calc(80vh - 200px)",
    maxHeight: "400px",
  },
  desktop: {
    height: "400px",
    maxHeight: "400px",
  },
});

export const getInputDimensions = () => ({
  mobile: {
    minHeight: "44px", // Touch target size
    maxHeight: "120px",
    fontSize: "16px", // Prevent zoom on iOS
  },
  tablet: {
    minHeight: "40px",
    maxHeight: "120px",
    fontSize: "14px",
  },
  desktop: {
    minHeight: "40px",
    maxHeight: "120px",
    fontSize: "14px",
  },
});

export const getButtonDimensions = () => ({
  mobile: {
    minHeight: "44px",
    minWidth: "44px",
    padding: "12px 16px",
    fontSize: "16px",
  },
  tablet: {
    minHeight: "40px",
    minWidth: "40px",
    padding: "10px 14px",
    fontSize: "14px",
  },
  desktop: {
    minHeight: "36px",
    minWidth: "36px",
    padding: "8px 12px",
    fontSize: "14px",
  },
});

export const getSpacing = () => ({
  mobile: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    "2xl": "24px",
  },
  tablet: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    "2xl": "24px",
  },
  desktop: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    "2xl": "24px",
  },
});

export const getTypography = () => ({
  mobile: {
    h1: "text-xl font-bold",
    h2: "text-lg font-semibold",
    h3: "text-base font-medium",
    body: "text-base",
    small: "text-sm",
    caption: "text-xs",
  },
  tablet: {
    h1: "text-xl font-bold",
    h2: "text-lg font-semibold",
    h3: "text-base font-medium",
    body: "text-sm",
    small: "text-xs",
    caption: "text-xs",
  },
  desktop: {
    h1: "text-lg font-bold",
    h2: "text-base font-semibold",
    h3: "text-sm font-medium",
    body: "text-sm",
    small: "text-xs",
    caption: "text-xs",
  },
});

export const getChatLayoutClasses = () => ({
  container: "flex flex-col h-full w-full",
  header: "flex-shrink-0 p-4 border-b",
  messages: "flex-1 overflow-y-auto p-4 space-y-4",
  input: "flex-shrink-0 p-4 border-t",
  typing: "flex-shrink-0 px-4 py-2",
});

export const getMessageBubbleClasses = (isOwn: boolean) => ({
  container: `flex gap-3 group relative mb-4 ${
    isOwn ? "flex-row-reverse justify-end" : "flex-row justify-start"
  }`,
  bubble: `max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
    isOwn
      ? "bg-blue-500 text-white rounded-br-sm"
      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm"
  }`,
  avatar: "w-8 h-8 rounded-full flex-shrink-0",
  time: "text-xs opacity-70 mt-1",
  status: "text-xs opacity-70",
});

export const getInputClasses = () => ({
  container: "relative flex items-end gap-2",
  textarea:
    "flex-1 resize-none border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed",
  button:
    "flex-shrink-0 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed",
  fileButton:
    "flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
});

export const getModalClasses = () => ({
  overlay:
    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50",
  container:
    "bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden",
  header: "px-6 py-4 border-b border-gray-200 dark:border-gray-700",
  body: "px-6 py-4 overflow-y-auto",
  footer:
    "px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2",
});

export const getFormClasses = () => ({
  container: "space-y-4",
  field: "space-y-2",
  label: "block text-sm font-medium text-gray-700 dark:text-gray-300",
  input:
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white",
  textarea:
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none",
  select:
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white",
  error: "text-sm text-red-500",
  help: "text-sm text-gray-500 dark:text-gray-400",
});

export const getAnimationClasses = () => ({
  fadeIn: "animate-fade-in",
  slideIn: "animate-slide-in",
  slideOut: "animate-slide-out",
  bounce: "animate-bounce",
  pulse: "animate-pulse",
  spin: "animate-spin",
});

export const getTransitionClasses = () => ({
  default: "transition-all duration-200 ease-in-out",
  fast: "transition-all duration-150 ease-in-out",
  slow: "transition-all duration-300 ease-in-out",
  colors: "transition-colors duration-200 ease-in-out",
  transform: "transition-transform duration-200 ease-in-out",
  opacity: "transition-opacity duration-200 ease-in-out",
});

export const getFocusClasses = () => ({
  default:
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
  button:
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
  input:
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
  link: "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
});

export const getAccessibilityClasses = () => ({
  srOnly: "sr-only",
  focusVisible:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
  highContrast: "forced-color-adjust-auto",
  reducedMotion: "motion-reduce:transition-none motion-reduce:transform-none",
  printHidden: "print:hidden",
});

export const getResponsiveGrid = (columns: Record<Breakpoint, number>) => {
  const classes = ["grid"];

  Object.entries(columns).forEach(([breakpoint, cols]) => {
    if (breakpoint === "sm") {
      classes.push(`grid-cols-${cols}`);
    } else {
      classes.push(`${breakpoint}:grid-cols-${cols}`);
    }
  });

  return classes.join(" ");
};

export const getResponsiveFlex = (
  direction: Record<Breakpoint, "row" | "col">
) => {
  const classes = ["flex"];

  Object.entries(direction).forEach(([breakpoint, dir]) => {
    if (breakpoint === "sm") {
      classes.push(`flex-${dir}`);
    } else {
      classes.push(`${breakpoint}:flex-${dir}`);
    }
  });

  return classes.join(" ");
};

export const getResponsiveSpacing = (spacing: Record<Breakpoint, string>) => {
  const classes: string[] = [];

  Object.entries(spacing).forEach(([breakpoint, value]) => {
    if (breakpoint === "sm") {
      classes.push(`p-${value}`);
    } else {
      classes.push(`${breakpoint}:p-${value}`);
    }
  });

  return classes.join(" ");
};

export const getResponsiveText = (sizes: Record<Breakpoint, string>) => {
  const classes: string[] = [];

  Object.entries(sizes).forEach(([breakpoint, size]) => {
    if (breakpoint === "sm") {
      classes.push(`text-${size}`);
    } else {
      classes.push(`${breakpoint}:text-${size}`);
    }
  });

  return classes.join(" ");
};
