/**
 * Profile Engine
 * Generates user profile and recommendations based on scores.
 */
window.ProfileEngine = class ProfileEngine {
  
  /**
   * Generates a profile from a percentage score
   * @param {number} scorePercentage 
   * @returns {Object} { profileName, description, level }
   */
  static generateProfile(scorePercentage) {
    if (scorePercentage >= 80) {
      return {
        level: 'High',
        profileName: 'Financial Strategist',
        description: 'You have a strong grasp of financial concepts, excellent budgeting habits, and a solid emergency plan.'
      };
    } else if (scorePercentage >= 50) {
      return {
        level: 'Medium',
        profileName: 'Financial Explorer',
        description: 'You have a good foundation, but there is room to grow in your savings and debt management strategies.'
      };
    } else {
      return {
        level: 'Low',
        profileName: 'Financial Beginner',
        description: 'You are just starting out. It is important to focus on building an emergency fund and tracking your monthly budget.'
      };
    }
  }

  /**
   * Generates tailored recommendations based on the profile level
   * @param {string} profileLevel (High, Medium, Low)
   * @returns {Array} List of recommendations
   */
  static getRecommendations(profileLevel) {
    // In production, this would be fetched from Google Sheets based on the profile
    const recs = {
      'Low': [
        { title: 'Start an Emergency Fund', description: 'Aim to save at least $500 as a starting buffer.', priority: 'High' },
        { title: 'Track Expenses', description: 'Use a simple budgeting app to see exactly where your money goes for one month.', priority: 'High' }
      ],
      'Medium': [
        { title: 'Increase Savings Rate', description: 'Try to save 10-15% of your monthly income.', priority: 'Medium' },
        { title: 'Pay Down High Interest Debt', description: 'Focus on credit cards with the highest APR first.', priority: 'High' }
      ],
      'High': [
        { title: 'Diversify Investments', description: 'Look into index funds or retirement accounts to grow your wealth.', priority: 'Medium' },
        { title: 'Estate Planning', description: 'Ensure your will and beneficiaries are up to date.', priority: 'Low' }
      ]
    };

    return recs[profileLevel] || [];
  }
}
