/**
 * Helper function to clean and validate API keys
 */
export function cleanApiKey(apiKey: any): string {
  if (!apiKey) {
    return '';
  }
  
  // Convert to string and remove quotes and whitespace
  const cleaned = apiKey.toString().replace(/['"]/g, '').trim();
  return cleaned;
}

/**
 * Validates if an API key is valid
 */
export function isValidApiKey(apiKey: string): boolean {
  return apiKey && apiKey.length > 0;
}
