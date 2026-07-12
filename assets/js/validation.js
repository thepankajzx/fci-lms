/**
 * Validation Engine
 * Handles requirement validation for all question types.
 */
window.ValidationEngine = class ValidationEngine {
  
  /**
   * Validates a single question's answer
   * @param {Object} question - The question configuration
   * @param {any} answer - The user's provided answer
   * @returns {Object} { isValid: boolean, message: string }
   */
  static validate(question, answer) {
    if (question.required) {
      if (answer === null || answer === undefined || answer === '') {
        return { isValid: false, message: 'This question is required. Please provide an answer.' };
      }
      
      // If array (multiple choice)
      if (Array.isArray(answer) && answer.length === 0) {
        return { isValid: false, message: 'Please select at least one option.' };
      }
    }

    // specific validations based on type
    switch (question.type) {
      case 'number':
        if (answer !== '' && isNaN(Number(answer))) {
          return { isValid: false, message: 'Please enter a valid number.' };
        }
        break;
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (answer !== '' && !emailRegex.test(answer)) {
          return { isValid: false, message: 'Please enter a valid email address.' };
        }
        break;
    }

    return { isValid: true, message: '' };
  }
}
