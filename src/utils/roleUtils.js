// src/utils/roleUtils.js

/**
 * All available user roles in the system
 * MUST match backend UserRole enum exactly
 */
export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  TENANT_OWNER: 'TENANT_OWNER',
  TENANT_ADMIN: 'TENANT_ADMIN',
  USER: 'USER',
  VIEWER: 'VIEWER'
};

/**
 * Role display names for UI
 */
export const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  TENANT_OWNER: 'Tenant Owner',
  TENANT_ADMIN: 'Tenant Admin',
  USER: 'User',
  VIEWER: 'Viewer'
};

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS = {
  SUPER_ADMIN: 'Platform administrator with full access across all tenants',
  TENANT_OWNER: 'Full control over tenant settings and users',
  TENANT_ADMIN: 'Can manage users within the tenant',
  USER: 'Standard user with basic access',
  VIEWER: 'Read-only access'
};

/**
 * Role colors for badges
 */
export const ROLE_COLORS = {
  SUPER_ADMIN: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',
  TENANT_OWNER: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300',
  TENANT_ADMIN: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300',
  USER: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
  VIEWER: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
};

/**
 * Get roles that current user can assign
 * Based on role hierarchy rules from backend
 */
export const getAssignableRoles = (currentUserRole) => {
  switch (currentUserRole) {
    case USER_ROLES.SUPER_ADMIN:
      // Super admin can assign any role
      return [
        USER_ROLES.SUPER_ADMIN,
        USER_ROLES.TENANT_OWNER,
        USER_ROLES.TENANT_ADMIN,
        USER_ROLES.USER,
        USER_ROLES.VIEWER
      ];
    
    case USER_ROLES.TENANT_OWNER:
      // Tenant owner can assign any role except SUPER_ADMIN
      return [
        USER_ROLES.TENANT_OWNER,
        USER_ROLES.TENANT_ADMIN,
        USER_ROLES.USER,
        USER_ROLES.VIEWER
      ];
    
    case USER_ROLES.TENANT_ADMIN:
      // Tenant admin can only assign USER and VIEWER
      return [
        USER_ROLES.USER,
        USER_ROLES.VIEWER
      ];
    
    default:
      // Regular users and viewers cannot assign roles
      return [];
  }
};

/**
 * Check if user can manage users
 */
export const canManageUsers = (role) => {
  return [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.TENANT_OWNER,
    USER_ROLES.TENANT_ADMIN
  ].includes(role);
};

/**
 * Check if user is admin (any admin role)
 */
export const isAdmin = (role) => {
  return [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.TENANT_OWNER,
    USER_ROLES.TENANT_ADMIN
  ].includes(role);
};

/**
 * Check if user can modify tenant settings
 */
export const canModifyTenantSettings = (role) => {
  return [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.TENANT_OWNER
  ].includes(role);
};

/**
 * Get role badge color
 */
export const getRoleBadgeColor = (role) => {
  return ROLE_COLORS[role] || ROLE_COLORS.VIEWER;
};

/**
 * Get role display label
 */
export const getRoleLabel = (role) => {
  return ROLE_LABELS[role] || role;
};

/**
 * Get role description
 */
export const getRoleDescription = (role) => {
  return ROLE_DESCRIPTIONS[role] || '';
};

/**
 * Convert role options for select dropdown
 */
export const getRoleOptions = (currentUserRole) => {
  const assignableRoles = getAssignableRoles(currentUserRole);
  
  return assignableRoles.map(role => ({
    value: role,
    label: ROLE_LABELS[role],
    description: ROLE_DESCRIPTIONS[role]
  }));
};

/**
 * Get all roles for filter dropdown
 */
export const getAllRoleFilterOptions = () => {
  return [
    { value: 'all', label: 'All Roles' },
    { value: USER_ROLES.SUPER_ADMIN, label: ROLE_LABELS.SUPER_ADMIN },
    { value: USER_ROLES.TENANT_OWNER, label: ROLE_LABELS.TENANT_OWNER },
    { value: USER_ROLES.TENANT_ADMIN, label: ROLE_LABELS.TENANT_ADMIN },
    { value: USER_ROLES.USER, label: ROLE_LABELS.USER },
    { value: USER_ROLES.VIEWER, label: ROLE_LABELS.VIEWER }
  ];
};

/**
 * Validate if role exists
 */
export const isValidRole = (role) => {
  return Object.values(USER_ROLES).includes(role);
};

/**
 * Get role hierarchy level (higher = more permissions)
 */
export const getRoleLevel = (role) => {
  const levels = {
    SUPER_ADMIN: 5,
    TENANT_OWNER: 4,
    TENANT_ADMIN: 3,
    USER: 2,
    VIEWER: 1
  };
  return levels[role] || 0;
};

/**
 * Check if user can create or manage webhooks
 */
export const canManageWebhooks = (role) => {
  return [
    USER_ROLES.TENANT_OWNER,
    USER_ROLES.TENANT_ADMIN,
    USER_ROLES.SUPER_ADMIN // optional, remove if super admin shouldn't touch tenant webhooks
  ].includes(role);
};

/**
 * Check if roleA has higher permissions than roleB
 */
export const hasHigherRole = (roleA, roleB) => {
  return getRoleLevel(roleA) > getRoleLevel(roleB);
};