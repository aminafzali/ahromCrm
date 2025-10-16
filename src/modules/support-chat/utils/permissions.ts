/**
 * Support Chat Permission Utilities
 *
 * این فایل برای مدیریت دسترسی‌ها به Support Chat است
 * در آینده می‌توان از permission system پیچیده‌تری استفاده کرد
 */

/**
 * Check if user has support agent access
 * Currently: All Admin users have access
 * Future: Can be expanded to check specific permissions
 */
export function canAccessSupportChat(
  userRole?: { name: string } | null
): boolean {
  if (!userRole) return false;

  // فعلاً همه ادمین‌ها دسترسی دارند
  // در آینده می‌توان permission های دقیق‌تری اضافه کرد
  const allowedRoles = ["Admin"];

  return allowedRoles.includes(userRole.name);
}

/**
 * Check if user can assign tickets
 */
export function canAssignTickets(userRole?: { name: string } | null): boolean {
  return canAccessSupportChat(userRole);
}

/**
 * Check if user can update ticket status
 */
export function canUpdateTicketStatus(
  userRole?: { name: string } | null
): boolean {
  return canAccessSupportChat(userRole);
}

/**
 * Check if user can view all tickets
 */
export function canViewAllTickets(userRole?: { name: string } | null): boolean {
  return canAccessSupportChat(userRole);
}
