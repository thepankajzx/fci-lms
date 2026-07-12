/**
 * Results Controller
 * Fetches answers, calculates scores, and displays profile/recommendations.
 */
window.ResultController = class ResultController {
  
  static async init() {
    // Get score from previous screen
    const percentage = window.StorageHelper.get('latestScore') || 0;
    
    // Generate Profile
    const profile = window.ProfileEngine.generateProfile(percentage);
    
    // Get Recommendations
    const recs = window.ProfileEngine.getRecommendations(profile.level);

    this.renderScore(percentage);
    this.renderProfile(profile);
    this.renderRecommendations(recs);
  }

  static renderScore(percentage) {
    const circle = document.getElementById('scoreCircle');
    const value = document.getElementById('scoreValue');
    
    // Determine color based on score
    let color = 'var(--color-danger)';
    if (percentage >= 50) color = 'var(--color-warning)';
    if (percentage >= 80) color = 'var(--color-success)';

    circle.style.background = `conic-gradient(${color} ${percentage}%, rgba(0,0,0,0.05) 0)`;
    value.textContent = `${percentage}%`;
    value.style.color = color;
  }

  static renderProfile(profile) {
    document.getElementById('profileName').textContent = profile.profileName;
    document.getElementById('profileDesc').textContent = profile.description;
  }

  static renderRecommendations(recs) {
    const list = document.getElementById('recsList');
    list.innerHTML = '';
    
    recs.forEach(rec => {
      const div = document.createElement('div');
      div.className = 'rec-card';
      
      const priorityClass = `badge-${rec.priority.toLowerCase()}`;
      
      div.innerHTML = `
        <div class="rec-header">
          <h4 class="rec-title">${rec.title}</h4>
          <span class="badge ${priorityClass}">${rec.priority} Priority</span>
        </div>
        <p class="rec-desc">${rec.description}</p>
      `;
      list.appendChild(div);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.ResultController.init();
});
