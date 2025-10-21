// Accessibility utilities for support chat components

export const generateId = (prefix: string = "chat"): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

export const announceToScreenReader = (
  message: string,
  priority: "polite" | "assertive" = "polite"
) => {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

export const getAriaLabel = (
  message: string,
  sender: string,
  timestamp: string,
  isOwn: boolean
): string => {
  return `${
    isOwn ? "پیام شما" : `پیام از ${sender}`
  }: ${message}. ${timestamp}`;
};

export const getMessageRole = (isOwn: boolean): string => {
  return isOwn ? "status" : "article";
};

export const getChatContainerAriaLabel = (
  ticketNumber: string,
  status: string
): string => {
  return `چت تیکت ${ticketNumber} با وضعیت ${status}`;
};

export const getTypingIndicatorAriaLabel = (users: string[]): string => {
  if (users.length === 0) return "";
  if (users.length === 1) return `${users[0]} در حال تایپ است`;
  if (users.length === 2) return `${users[0]} و ${users[1]} در حال تایپ هستند`;
  return `${users.slice(0, -1).join("، ")} و ${
    users[users.length - 1]
  } در حال تایپ هستند`;
};

export const getFileUploadAriaLabel = (
  fileName: string,
  fileSize: string
): string => {
  return `فایل ${fileName} با حجم ${fileSize}`;
};

export const getButtonAriaLabel = (
  action: string,
  context?: string
): string => {
  return context ? `${action} ${context}` : action;
};

export const getFormFieldAriaDescribedBy = (
  fieldId: string,
  hasError: boolean,
  hasHelp: boolean
): string => {
  const ids: string[] = [];
  if (hasError) ids.push(`${fieldId}-error`);
  if (hasHelp) ids.push(`${fieldId}-help`);
  return ids.join(" ");
};

export const getLiveRegionAriaLabel = (
  type: "messages" | "typing" | "status"
): string => {
  switch (type) {
    case "messages":
      return "لیست پیام‌های چت";
    case "typing":
      return "وضعیت تایپ کاربران";
    case "status":
      return "وضعیت اتصال";
    default:
      return "";
  }
};

export const getKeyboardShortcuts = () => ({
  sendMessage: "Enter",
  newLine: "Shift + Enter",
  focusInput: "Alt + I",
  focusMessages: "Alt + M",
  toggleChat: "Alt + C",
  closeModal: "Escape",
});

export const announceKeyboardShortcuts = () => {
  const shortcuts = getKeyboardShortcuts();
  const message = `کلیدهای میانبر: ارسال پیام ${shortcuts.sendMessage}، خط جدید ${shortcuts.newLine}، فوکوس ورودی ${shortcuts.focusInput}`;
  announceToScreenReader(message);
};

export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    "button:not([disabled])",
    "input:not([disabled])",
    "textarea:not([disabled])",
    "select:not([disabled])",
    "a[href]",
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");

  return Array.from(
    container.querySelectorAll(focusableSelectors)
  ) as HTMLElement[];
};

export const trapFocus = (container: HTMLElement, event: KeyboardEvent) => {
  if (event.key !== "Tab") return;

  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      lastElement?.focus();
      event.preventDefault();
    }
  } else {
    if (document.activeElement === lastElement) {
      firstElement?.focus();
      event.preventDefault();
    }
  }
};

export const getResponsiveBreakpoints = () => ({
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
});

export const getResponsiveClasses = (
  base: string,
  sm?: string,
  md?: string,
  lg?: string,
  xl?: string
) => {
  let classes = base;
  if (sm) classes += ` sm:${sm}`;
  if (md) classes += ` md:${md}`;
  if (lg) classes += ` lg:${lg}`;
  if (xl) classes += ` xl:${xl}`;
  return classes;
};

export const getChatWindowClasses = () => {
  return getResponsiveClasses(
    "h-full flex flex-col",
    "h-screen",
    "h-full",
    "h-full"
  );
};

export const getMessageBubbleClasses = (isOwn: boolean) => {
  return getResponsiveClasses(
    `flex gap-3 group relative mb-4 ${
      isOwn ? "flex-row-reverse justify-end" : "flex-row justify-start"
    }`,
    "gap-2",
    "gap-3",
    "gap-4"
  );
};

export const getInputClasses = () => {
  return getResponsiveClasses(
    "w-full resize-none border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed",
    "px-3 py-2",
    "px-4 py-3",
    "px-4 py-3"
  );
};

export const getButtonClasses = (
  variant: "primary" | "secondary" | "danger" = "primary"
) => {
  const baseClasses =
    "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500",
    secondary: "bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
  };

  return `${baseClasses} ${variantClasses[variant]}`;
};

export const getAccessibilityProps = () => ({
  // Screen reader only class
  srOnly: "sr-only",

  // Focus visible
  focusVisible:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",

  // High contrast mode support
  highContrast: "forced-color-adjust-auto",

  // Reduced motion support
  reducedMotion: "motion-reduce:transition-none motion-reduce:transform-none",

  // Print styles
  printHidden: "print:hidden",
});

export const getColorContrast = (
  backgroundColor: string,
  textColor: string
): number => {
  // This is a simplified contrast calculation
  // In a real implementation, you'd use a proper color contrast library
  return 4.5; // Placeholder value
};

export const validateColorContrast = (
  backgroundColor: string,
  textColor: string
): boolean => {
  const contrast = getColorContrast(backgroundColor, textColor);
  return contrast >= 4.5; // WCAG AA standard
};
