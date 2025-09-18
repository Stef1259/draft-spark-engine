import { KeyPoint } from '@/types';

export const mockKeyPoints: KeyPoint[] = [
  {
    id: '1',
    text: 'The company saw a 300% increase in user engagement after implementing the new AI-powered recommendation system.',
    order: 0,
    source: 'Interview Transcript'
  },
  {
    id: '2',
    text: 'Technical challenges included data privacy concerns and the need to process millions of user interactions in real-time.',
    order: 1,
    source: 'Interview Transcript'
  },
  {
    id: '3',
    text: 'The team worked for 18 months to develop the algorithm, with input from machine learning experts and user experience designers.',
    order: 2,
    source: 'Interview Transcript'
  },
  {
    id: '4',
    text: 'Initial user testing showed 85% satisfaction rates, leading to the decision to roll out the feature company-wide.',
    order: 3,
    source: 'Supporting Sources'
  },
  {
    id: '5',
    text: 'The CEO mentioned this innovation positions the company as a leader in personalized technology solutions.',
    order: 4,
    source: 'Interview Transcript'
  }
];

export const mockDraftText = `# Revolutionary AI Recommendation System Transforms User Experience

In an era where personalization drives digital engagement, one company's bold investment in artificial intelligence has yielded remarkable results. After 18 months of intensive development, the new AI-powered recommendation system has delivered a staggering 300% increase in user engagement, fundamentally changing how users interact with the platform.

## The Technical Journey

The path to success was not without its challenges. "We knew we were tackling something ambitious," explained the development team. The primary hurdles centered around data privacy concerns and the technical complexity of processing millions of user interactions in real-time. These challenges required innovative solutions and careful consideration of user trust.

The development process brought together machine learning experts and user experience designers in an unprecedented collaboration. This interdisciplinary approach proved crucial in creating a system that was both technically sophisticated and user-friendly.

## Validation Through Testing

Before the company-wide rollout, extensive user testing revealed promising results. "We achieved 85% satisfaction rates in our initial testing phase," noted the research team. This strong user response provided the confidence needed to expand the feature across the entire platform.

The testing phase validated not only the technical functionality but also the user experience design principles that guided the project from its inception.

## Strategic Impact

Looking toward the future, company leadership sees this innovation as more than just a technical achievement. The CEO emphasized that this breakthrough "positions the company as a leader in personalized technology solutions," highlighting the strategic importance of the investment.

The success of this AI-powered system demonstrates the potential for technology to enhance user experiences while maintaining the trust and privacy that users expect from modern digital platforms.

## Conclusion

This implementation represents a significant milestone in the evolution of personalized technology. With proven results and strong user satisfaction, the company has established a new standard for AI-driven user engagement that will likely influence industry practices for years to come.`;

export const generateMockKeyPoints = (): KeyPoint[] => {
  return mockKeyPoints.map(kp => ({ ...kp, id: Date.now().toString() + Math.random() }));
};

export const generateMockDraft = (tone: string, length: string, angle: string): string => {
  const lengthMultiplier = length === 'short' ? 0.6 : length === 'long' ? 1.4 : 1;
  const words = mockDraftText.split(' ');
  const targetWords = Math.floor(words.length * lengthMultiplier);
  
  let modifiedDraft = mockDraftText;
  
  // Modify based on tone
  if (tone === 'storytelling') {
    modifiedDraft = modifiedDraft
      .replace(/The company/g, 'TechCorp')
      .replace(/one company's/g, 'TechCorp\'s')
      .replace(/company-wide/g, 'across TechCorp');
  } else if (tone === 'press-release') {
    modifiedDraft = `FOR IMMEDIATE RELEASE\n\n` + modifiedDraft
      .replace(/In an era where/g, 'TechCorp announces that in an era where')
      .replace(/This implementation/g, 'This major implementation');
  }
  
  // Adjust length
  if (length === 'short') {
    const paragraphs = modifiedDraft.split('\n\n');
    modifiedDraft = paragraphs.slice(0, Math.ceil(paragraphs.length * 0.6)).join('\n\n');
  } else if (length === 'long') {
    const additionalContent = `\n\n## Market Impact\n\nIndustry analysts predict that this advancement will set new benchmarks for user engagement metrics across the technology sector. The success has already attracted attention from competitors and potential partners, signaling broader implications for the market landscape.\n\n## Future Developments\n\nThe engineering team is already working on the next iteration of the system, with plans to incorporate advanced natural language processing capabilities and expanded personalization features. These developments are expected to further enhance user experience and maintain the company's competitive advantage.`;
    modifiedDraft += additionalContent;
  }
  
  // Add custom angle if provided
  if (angle.trim()) {
    modifiedDraft += `\n\n## Custom Focus\n\n${angle}`;
  }
  
  return modifiedDraft;
};