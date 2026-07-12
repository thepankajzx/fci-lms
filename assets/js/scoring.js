/**
 * Scoring Engine
 * Calculates raw scores based on question weights and answers.
 */
window.ScoringEngine = class ScoringEngine {
  
  /**
   * Calculates the overall score for an assessment
   * @param {Object} assessmentData - The assessment config containing questions and options
   * @param {Object} answers - User answers (Map of QuestionID -> Answer)
   * @returns {Object} { rawScore, maxScore, percentage }
   */
  static calculateScore(assessmentData, answers) {
    let rawScore = 0;
    let maxScore = 0;

    assessmentData.questions.forEach(q => {
      // Find max possible weight for this question to calculate percentage
      let qMax = 0;
      q.options.forEach(opt => {
        if (opt.weight > qMax) qMax = opt.weight;
      });
      maxScore += qMax;

      // Calculate user's score
      const userAnswer = answers[q.id];
      if (!userAnswer) return;

      if (q.type === 'single') {
        const selectedOpt = q.options.find(o => o.id === userAnswer);
        if (selectedOpt) rawScore += selectedOpt.weight;
      } else if (q.type === 'multiple') {
        // If multiple, sum the weights of selected options
        userAnswer.forEach(ansId => {
          const selectedOpt = q.options.find(o => o.id === ansId);
          if (selectedOpt) rawScore += selectedOpt.weight;
        });
      }
    });

    const percentage = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;

    return { rawScore, maxScore, percentage };
  }
}
