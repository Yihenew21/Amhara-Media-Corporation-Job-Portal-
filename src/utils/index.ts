import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';

/**
 * Format date for display
 */
export const formatDate = (date: string | Date, formatStr: string = 'PPP') => {
  return format(new Date(date), formatStr);
};

/**
 * Format relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Check if a job application deadline has passed
 */
export const isDeadlinePassed = (deadline: string | Date) => {
  return isBefore(new Date(deadline), new Date());
};

/**
 * Check if a date is in the future
 */
export const isFutureDate = (date: string | Date) => {
  return isAfter(new Date(date), new Date());
};

/**
 * Format salary range
 */
export const formatSalary = (min?: number, max?: number, currency: string = 'ETB') => {
  if (!min && !max) return 'Negotiable';
  if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  if (min) return `${currency} ${min.toLocaleString()}+`;
  if (max) return `Up to ${currency} ${max.toLocaleString()}`;
  return 'Negotiable';
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 150) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Convert string to slug (URL-friendly)
 */
export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Generate initials from name
 */
export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Generate random color for avatar
 */
export const getRandomColor = (seed: string) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
  ];
  const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Ethiopian format)
 */
export const isValidPhone = (phone: string) => {
  const phoneRegex = /^(\+251|0)?[9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Format phone number
 */
export const formatPhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('251')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0')) {
    return `+251${cleaned.slice(1)}`;
  }
  return `+251${cleaned}`;
};

/**
 * Calculate matching score between job requirements and user skills
 */
export const calculateSkillMatch = (requirements: string[], userSkills: string[]) => {
  if (!requirements.length || !userSkills.length) return 0;
  
  const normalizedRequirements = requirements.map(req => req.toLowerCase().trim());
  const normalizedSkills = userSkills.map(skill => skill.toLowerCase().trim());
  
  const matches = normalizedRequirements.filter(req => 
    normalizedSkills.some(skill => skill.includes(req) || req.includes(skill))
  );
  
  return Math.round((matches.length / normalizedRequirements.length) * 100);
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

/**
 * Download file from URL
 */
export const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
