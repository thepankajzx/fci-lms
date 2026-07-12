/**
 * API Endpoints Configuration
 * 
 * Replace APPS_SCRIPT_WEB_APP_URL with your actual deployed Google Apps Script URL.
 */

window.CONFIG = {
  // Update this URL with your Google Apps Script Web App URL after deployment
  APPS_SCRIPT_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbwFm7sbsbdb19BPW1pmoEu0mK9o_Fem3qtMUrBe1YlhiNObaEfya1eP--84jwx5JhRb/exec'
};

window.API_ENDPOINTS = {
  LOGIN: "?action=login",
  LOGOUT: "?action=logout",
  GET_USER: "?action=getUser",
  GET_DASHBOARD: "?action=getDashboard",
  GET_ASSESSMENTS: "?action=getAssessments",
  GET_QUESTIONS: "?action=getQuestions",
  SAVE_RESPONSES: "?action=saveResponses",
  GET_RESULTS: "?action=getResults",
  GET_RECOMMENDATIONS: "?action=getRecommendations"
};
