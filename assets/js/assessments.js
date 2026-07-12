/**
 * Assessment Engine
 * Handles rendering questions, tracking progress, and auto-saving.
 */
window.AssessmentController = class AssessmentController {
  
  static async init() {
    this.currentQuestionIndex = 0;
    this.answers = {}; // Map of QuestionID -> Answer
    this.assessmentData = null; // Holds the config for the current assessment

    this.bindEvents();
    
    // Get assessment ID from URL query params (e.g., ?id=A1)
    const urlParams = new URLSearchParams(window.location.search);
    const assessmentId = urlParams.get('id') || 'A1'; 
    
    await this.loadAssessment(assessmentId);
  }

  static bindEvents() {
    document.getElementById('startBtn').addEventListener('click', () => this.startAssessment());
    document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());
    document.getElementById('prevBtn').addEventListener('click', () => this.prevQuestion());
    document.getElementById('viewResultsBtn').addEventListener('click', () => {
      window.location.href = 'result.html';
    });
  }

  static async loadAssessment(id) {
    try {
      // Fetch from API
      const response = await window.ApiService.request(`?action=getAssessment&id=${id}`, 'GET');
      this.assessmentData = response;

      // Check if there is saved progress
      const savedAnswers = window.StorageHelper.get(`assessment_${id}`);
      if (savedAnswers) {
        this.answers = savedAnswers;
        this.currentQuestionIndex = Object.keys(this.answers).length;
        if (this.currentQuestionIndex >= this.assessmentData.questions.length) {
          this.currentQuestionIndex = this.assessmentData.questions.length - 1;
        }
      }

      // Render Intro
      document.getElementById('assessmentTitle').textContent = this.assessmentData.name || 'Assessment';
      document.getElementById('assessmentDesc').textContent = this.assessmentData.description || 'Please complete the following questions.';
      
      document.getElementById('introScreen').style.display = 'block';

    } catch (err) {
      console.error(err);
      alert('Failed to load assessment. Please try again.');
    }
  }

  static startAssessment() {
    document.getElementById('introScreen').style.display = 'none';
    document.getElementById('questionScreen').style.display = 'block';
    this.renderCurrentQuestion();
  }

  static renderCurrentQuestion() {
    const question = this.assessmentData.questions[this.currentQuestionIndex];
    document.getElementById('questionText').textContent = question.text;
    document.getElementById('questionHelper').textContent = question.helper || '';
    
    // Update Progress
    const total = this.assessmentData.questions.length;
    const current = this.currentQuestionIndex + 1;
    const percent = Math.round(((current - 1) / total) * 100);
    
    document.getElementById('questionCounter').textContent = `Question ${current} of ${total}`;
    document.getElementById('progressPercent').textContent = `${percent}%`;
    document.getElementById('progressBar').style.width = `${percent}%`;

    // Render Options
    const container = document.getElementById('optionsContainer');
    container.innerHTML = ''; // clear

    const currentAnswer = this.answers[question.id];

    if (question.type === 'single' || question.type === 'multiple') {
      question.options.forEach(opt => {
        const div = document.createElement('div');
        div.className = 'option-item';
        
        // Restore selected state
        let isSelected = false;
        if (question.type === 'single') {
          isSelected = (currentAnswer === opt.id);
        } else if (question.type === 'multiple') {
          isSelected = (currentAnswer && currentAnswer.includes(opt.id));
        }

        if (isSelected) div.classList.add('selected');

        // Render radio or checkbox internally for accessibility
        const inputType = question.type === 'single' ? 'radio' : 'checkbox';
        div.innerHTML = `
          <input type="${inputType}" name="${question.id}" value="${opt.id}" class="form-${inputType}" style="pointer-events: none;" ${isSelected ? 'checked' : ''}>
          <span class="option-text">${opt.text}</span>
        `;

        // Click handler
        div.addEventListener('click', () => this.handleOptionSelect(question, opt.id, div));
        container.appendChild(div);
      });
    }

    // Toggle Prev Button
    document.getElementById('prevBtn').disabled = (this.currentQuestionIndex === 0);
    
    // Toggle Next Button Text (Next vs Submit)
    const nextBtn = document.getElementById('nextBtn');
    if (this.currentQuestionIndex === total - 1) {
      nextBtn.textContent = 'Submit Assessment';
    } else {
      nextBtn.textContent = 'Next';
    }

    // Hide error
    document.getElementById('questionError').style.display = 'none';
  }

  static handleOptionSelect(question, optionId, element) {
    const isSingle = question.type === 'single';
    
    if (isSingle) {
      // Clear all selected visually
      document.querySelectorAll('.option-item').forEach(el => {
        el.classList.remove('selected');
        el.querySelector('input').checked = false;
      });
      // Select this one
      element.classList.add('selected');
      element.querySelector('input').checked = true;
      this.answers[question.id] = optionId;
    } else {
      // Multiple
      const input = element.querySelector('input');
      const isSelected = element.classList.toggle('selected');
      input.checked = isSelected;
      
      let arr = this.answers[question.id] || [];
      if (isSelected) {
        if (!arr.includes(optionId)) arr.push(optionId);
      } else {
        arr = arr.filter(id => id !== optionId);
      }
      this.answers[question.id] = arr;
    }

    // Auto Save
    this.autoSave();
  }

  static autoSave() {
    window.StorageHelper.set(`assessment_${this.assessmentData.id}`, this.answers);
    const status = document.getElementById('saveStatus');
    status.style.opacity = '1';
    status.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Saved`;
    
    setTimeout(() => {
      status.style.opacity = '0.5';
    }, 2000);
  }

  static async nextQuestion() {
    const question = this.assessmentData.questions[this.currentQuestionIndex];
    const answer = this.answers[question.id];
    
    // Validate
    const validation = window.ValidationEngine.validate(question, answer);
    if (!validation.isValid) {
      const err = document.getElementById('questionError');
      err.textContent = validation.message;
      err.style.display = 'flex';
      return;
    }

    // Proceed or Submit
    if (this.currentQuestionIndex < this.assessmentData.questions.length - 1) {
      this.currentQuestionIndex++;
      this.renderCurrentQuestion();
    } else {
      await this.submitAssessment();
    }
  }

  static prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.renderCurrentQuestion();
    }
  }

  static async submitAssessment() {
    const btn = document.getElementById('nextBtn');
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    try {
      // Calculate local score before sending
      const scoreResult = window.ScoringEngine.calculateScore(this.assessmentData, this.answers);
      const profile = window.ProfileEngine.generateProfile(scoreResult.percentage);
      const user = window.Auth.getUser();

      const payload = {
        userId: user.id,
        assessmentId: this.assessmentData.id,
        score: scoreResult.percentage,
        profile: profile.profileName,
        answers: this.answers
      };

      await window.ApiService.request('?action=saveAssessment', 'POST', payload);
      
      // Pass score to result.js
      window.StorageHelper.set('latestScore', scoreResult.percentage);
      
      // Update progress to 100%
      document.getElementById('progressPercent').textContent = `100%`;
      document.getElementById('progressBar').style.width = `100%`;

      // Clear autosave
      window.StorageHelper.remove(`assessment_${this.assessmentData.id}`);

      // Show completion
      document.getElementById('questionScreen').style.display = 'none';
      document.getElementById('completionScreen').style.display = 'block';

    } catch (err) {
      console.error(err);
      alert('Submission failed. Please try again.');
      btn.textContent = 'Submit Assessment';
      btn.disabled = false;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.AssessmentController.init();
});
