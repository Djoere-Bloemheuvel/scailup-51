
import { ConvertLeadToContactResponse } from '@/types/rpc';

/**
 * Validates that a value is a valid ConvertLeadToContactResponse
 */
export function isValidConvertLeadResponse(value: unknown): value is ConvertLeadToContactResponse {
  console.log('isValidConvertLeadResponse - Validating:', value);
  
  if (!value || typeof value !== 'object') {
    console.log('isValidConvertLeadResponse - Not an object or falsy');
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Must have a boolean success field
  if (typeof obj.success !== 'boolean') {
    console.log('isValidConvertLeadResponse - Missing or invalid success field:', obj.success);
    return false;
  }

  // If error exists, it should be a string
  if (obj.error !== undefined && typeof obj.error !== 'string') {
    console.log('isValidConvertLeadResponse - Invalid error field:', obj.error);
    return false;
  }

  // If message exists, it should be a string
  if (obj.message !== undefined && typeof obj.message !== 'string') {
    console.log('isValidConvertLeadResponse - Invalid message field:', obj.message);
    return false;
  }

  // If contact exists, it should be an object
  if (obj.contact !== undefined && (typeof obj.contact !== 'object' || obj.contact === null)) {
    console.log('isValidConvertLeadResponse - Invalid contact field:', obj.contact);
    return false;
  }

  console.log('isValidConvertLeadResponse - Validation passed');
  return true;
}

/**
 * Safely converts an unknown RPC response to ConvertLeadToContactResponse
 */
export function parseConvertLeadResponse(response: unknown): ConvertLeadToContactResponse {
  console.log('parseConvertLeadResponse - Raw response:', response);
  console.log('parseConvertLeadResponse - Type:', typeof response);
  console.log('parseConvertLeadResponse - Is valid:', isValidConvertLeadResponse(response));

  // Handle null or undefined responses
  if (response === null || response === undefined) {
    console.error('RPC response is null or undefined');
    return {
      success: false,
      error: 'INVALID_RESPONSE_FORMAT',
      message: 'Server returned null or undefined response'
    };
  }

  // Handle non-object responses
  if (typeof response !== 'object') {
    console.error('RPC response is not an object:', response);
    return {
      success: false,
      error: 'INVALID_RESPONSE_FORMAT',
      message: `Server returned invalid response type: ${typeof response}`
    };
  }

  if (!isValidConvertLeadResponse(response)) {
    console.error('Invalid RPC response format:', response);
    
    // Try to extract some meaningful information if possible
    const obj = response as Record<string, unknown>;
    const errorMsg = typeof obj.error === 'string' ? obj.error : 
                     typeof obj.message === 'string' ? obj.message : 
                     'Server returned an invalid response format';
    
    return {
      success: false,
      error: 'INVALID_RESPONSE_FORMAT',
      message: errorMsg
    };
  }
  
  console.log('parseConvertLeadResponse - Successfully validated response');
  return response;
}
