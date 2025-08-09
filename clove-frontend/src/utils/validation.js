/**
 * Email validation utilities
 */

// RFC 5322 compliant email regex (comprehensive)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validates an email address
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  // Trim whitespace
  const trimmedEmail = email.trim();
  
  // Basic checks
  if (trimmedEmail.length === 0) return false;
  if (trimmedEmail.length > 254) return false; // RFC 5321 limit
  
  // Check for multiple @ symbols
  const atCount = (trimmedEmail.match(/@/g) || []).length;
  if (atCount !== 1) return false;
  
  // Split into local and domain parts
  const [localPart, domainPart] = trimmedEmail.split('@');
  
  // Local part validation
  if (!localPart || localPart.length === 0 || localPart.length > 64) return false;
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
  if (localPart.includes('..')) return false; // No consecutive dots
  
  // Domain part validation
  if (!domainPart || domainPart.length === 0 || domainPart.length > 253) return false;
  if (domainPart.startsWith('.') || domainPart.endsWith('.')) return false;
  if (domainPart.startsWith('-') || domainPart.endsWith('-')) return false;
  if (domainPart.includes('..')) return false; // No consecutive dots
  
  // Must have at least one dot in domain (TLD required)
  if (!domainPart.includes('.')) return false;
  
  // Final regex check
  return EMAIL_REGEX.test(trimmedEmail);
};

/**
 * Gets a user-friendly email validation error message
 * @param {string} email - The email to validate
 * @returns {string} - Empty string if valid, error message if invalid
 */
export const getEmailValidationError = (email) => {
  if (!email || email.trim() === '') {
    return "Email is required";
  }
  
  const trimmedEmail = email.trim();
  
  // Check for obvious format issues first
  if (!trimmedEmail.includes('@')) {
    return "Email must contain an @ symbol";
  }
  
  const atCount = (trimmedEmail.match(/@/g) || []).length;
  if (atCount > 1) {
    return "Email can only contain one @ symbol";
  }
  
  const [localPart, domainPart] = trimmedEmail.split('@');
  
  if (!localPart) {
    return "Email must have text before the @ symbol";
  }
  
  if (!domainPart) {
    return "Email must have a domain after the @ symbol";
  }
  
  if (!domainPart.includes('.')) {
    return "Email domain must include a top-level domain (e.g., .com, .org)";
  }
  
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return "Email cannot start or end with a period";
  }
  
  if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
    return "Email domain cannot start or end with a period";
  }
  
  if (trimmedEmail.includes('..')) {
    return "Email cannot contain consecutive periods";
  }
  
  if (!isValidEmail(trimmedEmail)) {
    return "Please enter a valid email address (e.g., user@example.com)";
  }
  
  return ""; // Valid
};

/**
 * Common invalid email examples for testing
 */
export const INVALID_EMAIL_EXAMPLES = [
  'test@corny',           // No TLD
  '@corny.com',          // No local part
  'test@.com',           // Domain starts with period
  'test.@example.com',   // Local part ends with period
  'test..user@example.com', // Consecutive periods
  'test@',               // No domain
  'test@com',            // No domain, just TLD
  'test user@example.com', // Space in local part
  'test@exam ple.com',   // Space in domain
  'test@@example.com',   // Multiple @ symbols
  '',                    // Empty
  'plaintext',           // No @ symbol
];

/**
 * Test function to validate the email validator
 */
export const testEmailValidation = () => {
  console.log('🧪 Testing Email Validation...');
  
  // Valid emails
  const validEmails = [
    'user@example.com',
    'test.email@domain.co.uk',
    'user+tag@example.org',
    'user.name@sub.domain.com',
    'a@b.co'
  ];
  
  validEmails.forEach(email => {
    const isValid = isValidEmail(email);
    const error = getEmailValidationError(email);
    console.log(`✅ ${email}: Valid=${isValid}, Error="${error}"`);
  });
  
  // Invalid emails
  INVALID_EMAIL_EXAMPLES.forEach(email => {
    const isValid = isValidEmail(email);
    const error = getEmailValidationError(email);
    console.log(`❌ "${email}": Valid=${isValid}, Error="${error}"`);
  });
}; 