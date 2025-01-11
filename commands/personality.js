const axios = require('axios');

const questions = [
  {
    id: 1,
    text: "How do you prefer to spend your free time?",
    options: [
      { text: "Hosting large, energetic social events with many people", type: "E" },
      { text: "Networking and meeting new, interesting connections", type: "E/I" },
      { text: "Deep conversations with close, trusted friends", type: "I" },
      { text: "Solitary creative or intellectual pursuits", type: "I" }
    ]
  },
  {
    id: 2,
    text: "When making critical decisions, you primarily:",
    options: [
      { text: "Use cold, pure logical analysis and statistical data", type: "T" },
      { text: "Consider logical outcomes with empathetic understanding", type: "T/F" },
      { text: "Prioritize emotional impact and interpersonal harmony", type: "F" },
      { text: "Balance emotional intuition with rational assessment", type: "F/T" }
    ]
  },
  {
    id: 3,
    text: "Your approach to life's structure is best described as:",
    options: [
      { text: "Rigid, meticulously planned schedules with zero deviation", type: "J" },
      { text: "Structured frameworks with strategic flexibility", type: "J/P" },
      { text: "Spontaneous, adaptable, and open-ended lifestyle", type: "P" },
      { text: "Controlled chaos with periodic strategic planning", type: "P/J" }
    ]
  },
  {
    id: 4,
    text: "When processing new information, you are most attracted to:",
    options: [
      { text: "Concrete, immediately applicable practical facts", type: "S" },
      { text: "Potential future implications and abstract patterns", type: "N" },
      { text: "Innovative concepts that challenge existing paradigms", type: "N/S" },
      { text: "Theoretical frameworks with real-world testing", type: "S/N" }
    ]
  },
  {
    id: 5,
    text: "In social gatherings, you typically:",
    options: [
      { text: "Become the center of attention and energize the room", type: "E" },
      { text: "Engage selectively with interesting conversations", type: "E/I" },
      { text: "Observe and listen more than actively participate", type: "I" },
      { text: "Prefer deep one-on-one interactions", type: "I" }
    ]
  },
  {
    id: 6,
    text: "When resolving conflicts, you most likely:",
    options: [
      { text: "Analyze the situation with pure logical reasoning", type: "T" },
      { text: "Seek a fair solution that considers everyone's feelings", type: "T/F" },
      { text: "Prioritize emotional healing and relationship preservation", type: "F" },
      { text: "Mediate with empathy while maintaining objective standards", type: "F/T" }
    ]
  },
  {
    id: 7,
    text: "Your approach to deadlines and projects is:",
    options: [
      { text: "Completed well ahead of time, perfectly organized", type: "J" },
      { text: "Planned with buffer time for unexpected challenges", type: "J/P" },
      { text: "Often working intensely right before the deadline", type: "P" },
      { text: "Flexible approach with bursts of focused productivity", type: "P/J" }
    ]
  },
  {
    id: 8,
    text: "When exploring new ideas or concepts, you:",
    options: [
      { text: "Prefer proven, practical methodologies", type: "S" },
      { text: "Seek revolutionary, transformative perspectives", type: "N" },
      { text: "Blend innovative thinking with practical application", type: "N/S" },
      { text: "Analyze potential through both theoretical and practical lens", type: "S/N" }
    ]
  },
  {
    id: 9,
    text: "At a party or social event, your energy level:",
    options: [
      { text: "Increases dramatically, becoming more animated", type: "E" },
      { text: "Fluctuates between engagement and needing breaks", type: "E/I" },
      { text: "Gradually depletes, feeling overwhelmed", type: "I" },
      { text: "Remains steady with selective, meaningful interactions", type: "I" }
    ]
  },
  {
    id: 10,
    text: "When providing feedback or critique, you:",
    options: [
      { text: "Deliver direct, unfiltered analytical assessment", type: "T" },
      { text: "Balance honesty with compassionate delivery", type: "T/F" },
      { text: "Prioritize emotional support and positive reinforcement", type: "F" },
      { text: "Wrap constructive criticism in empathetic understanding", type: "F/T" }
    ]
  },
  {
    id: 11,
    text: "Your ideal workspace is:",
    options: [
      { text: "Meticulously organized with everything in its place", type: "J" },
      { text: "Structured but with creative flexibility", type: "J/P" },
      { text: "Dynamic and adaptable, minimal rigid structures", type: "P" },
      { text: "Organized chaos with strategic creative zones", type: "P/J" }
    ]
  },
  {
    id: 12,
    text: "When encountering complex problems, you:",
    options: [
      { text: "Apply systematic, proven problem-solving techniques", type: "S" },
      { text: "Explore innovative, unconventional solution paths", type: "N" },
      { text: "Combine practical insights with creative thinking", type: "N/S" },
      { text: "Analyze from multiple theoretical and practical angles", type: "S/N" }
    ]
  },
  {
    id: 13,
    text: "In group discussions, your communication style is:",
    options: [
      { text: "Assertive and direct leadership", type: "E" },
      { text: "Strategic, selective engagement", type: "E/I" },
      { text: "Thoughtful, measured contributions", type: "I" },
      { text: "Reflective listening with occasional insights", type: "I" }
    ]
  },
  {
    id: 14,
    text: "Your decision-making process prioritizes:",
    options: [
      { text: "Objective, data-driven rational analysis", type: "T" },
      { text: "Logical reasoning with emotional intelligence", type: "T/F" },
      { text: "Emotional resonance and interpersonal harmony", type: "F" },
      { text: "Empathetic understanding with logical framework", type: "F/T" }
    ]
  },
  {
    id: 15,
    text: "When planning a trip or project, you prefer:",
    options: [
      { text: "Comprehensive, detailed itinerary with no surprises", type: "J" },
      { text: "Structured plan with room for spontaneous exploration", type: "J/P" },
      { text: "Minimal planning, embracing unexpected opportunities", type: "P" },
      { text: "Flexible framework with strategic checkpoints", type: "P/J" }
    ]
  },
  {
    id: 16,
    text: "Your intellectual curiosity is most driven by:",
    options: [
      { text: "Tangible, immediately applicable knowledge", type: "S" },
      { text: "Abstract, transformative conceptual frameworks", type: "N" },
      { text: "Innovative ideas with practical potential", type: "N/S" },
      { text: "Comprehensive understanding bridging theory and practice", type: "S/N" }
    ]
  },
  {
    id: 17,
    text: "In collaborative environments, you typically:",
    options: [ 
      { text: "Take charge and lead the group towards a common goal", type: "E" },
      { text: "Facilitate discussions while contributing ideas", type: "E/I" },
      { text: "Support others' ideas and provide thoughtful feedback", type: "I" },
      { text: "Prefer to work independently but contribute when needed", type: "I" }
    ]
  },
  {
    id: 18,
    text: "When faced with a new challenge, you tend to:",
    options: [
      { text: "Dive in headfirst, eager to tackle it immediately", type: "E" },
      { text: "Assess the situation before taking action", type: "E/I" },
      { text: "Reflect on the implications and potential outcomes", type: "I" },
      { text: "Analyze the challenge from multiple perspectives", type: "I" }
    ]
  },
  {
    id: 19,
    text: "Your preferred method of learning is:",
    options: [
      { text: "Hands-on experience and practical application", type: "S" },
      { text: "Exploring theories and abstract concepts", type: "N" },
      { text: "Combining practical exercises with theoretical insights", type: "N/S" },
      { text: "Understanding concepts through real-world examples", type: "S/N" }
    ]
  },
  {
    id: 20,
    text: "In your relationships, you value:",
    options: [
      { text: "Open communication and shared experiences", type: "E" },
      { text: "Meaningful connections and deep understanding", type: "E/I" },
      { text: "Emotional support and mutual respect", type: "I" },
      { text: "A balance of independence and togetherness", type: "I" }
    ]
  }
];

const personalityTypes = {
  'ISTJ': {
    title: 'The Logistician',
    description: 'ISTJ (Logistician) is a personality type with the Introverted, Observant, Thinking, and Judging traits. These people tend to be reserved yet willful, with a rational outlook on life. They compose their actions carefully and carry them out with methodical purpose.',
    imageUrl: 'https://i.ibb.co/3MdNhmJ/IMG-20250111-235613.jpg',
    traits: [
      'Organized and methodical',
      'Reliable and responsible',
      'Practical and fact-minded',
      'Value tradition and stability'
    ]
  },
  'ISFJ': {
    title: 'The Defender',
    description: 'ISFJ (Defender) is a personality type with the Introverted, Observant, Feeling, and Judging traits. These people tend to be warm and unassuming in their own steady way. They’re efficient and responsible, giving careful attention to practical details in their daily lives.',
    imageUrl: 'https://i.ibb.co/10S2JgG/IMG-20250112-000041.jpg',
    traits: [
      'Caring and nurturing',
      'Detail-oriented',
      'Traditional and loyal',
      'Patient and devoted'
    ]
  },
  'INFJ': {
    title: 'The Advocate',
    description: 'INFJ (Advocate) is a personality type with the Introverted, Intuitive, Feeling, and Judging traits. They tend to approach life with deep thoughtfulness and imagination. Their inner vision, personal values, and a quiet, principled version of humanism guide them in all things.',
    imageUrl: 'https://i.ibb.co/Wxn5L8y/IMG-20250112-000219.jpg',
    traits: [
      'Insightful and intuitive',
      'Idealistic and principled',
      'Complex and deep',
      'Creative and inspiring'
    ]
  },
  'INTJ': {
    title: 'The Architect',
    description: 'INTJ (Architect) is a personality type with the Introverted, Intuitive, Thinking, and Judging traits. These thoughtful tacticians love perfecting the details of life, applying creativity and rationality to everything they do. Their inner world is often a private, complex one.',
    imageUrl: 'https://i.ibb.co/CHbwmXp/IMG-20250112-001201.jpg',
    traits: [
      'Strategic Thinking',
      'Independence',
      'Rationality',
      'Ambition'
    ]
  },
  'INTP': {
    title: 'The Logician',
    description: 'INTP (Logician) is a personality type with the Introverted, Intuitive, Thinking, and Prospecting traits. These flexible thinkers enjoy taking an unconventional approach to many aspects of life. They often seek out unlikely paths, mixing willingness to experiment with personal creativity.',
    imageUrl: 'https://i.ibb.co/4gRvrQs/IMG-20250112-001440.jpg',
    traits: [
      'Curiosity',
      'Analytical Thinking',
      'Independence',
      'Creativity'
    ]
  },
  'ENTJ': {
    title: 'The Commander',
    description: 'ENTJ (Commander) is a personality type with the Extraverted, Intuitive, Thinking, and Judging traits. They are decisive people who love momentum and accomplishment. They gather information to construct their creative visions but rarely hesitate for long before acting on them.',
    imageUrl: 'https://i.ibb.co/cvtpy95/IMG-20250112-001804.jpg',
    traits: [
      'Leadership',
      'Decisiveness',
      'Strategic Vision',
      'Charisma'
    ]
  },
  'INFP': {
    title: 'The Mediator',
    description: 'INFP (Mediator) is a personality type with the Introverted, Intuitive, Feeling, and Prospecting traits. These rare personality types tend to be quiet, open-minded, and imaginative, and they apply a caring and creative approach to everything they do.',
    imageUrl: 'https://i.ibb.co/0QgNyWB/IMG-20250112-002016.jpg',
    traits: [
      'Empathy',
      'Idealism',
      'Creativity',
      'Introversion'
    ]
  },
  'ENFJ': {
    title: 'The Protagonist',
    description: 'ENFJ (Protagonist) is a personality type with the Extraverted, Intuitive, Feeling, and Judging traits. These warm, forthright types love helping others, and they tend to have strong ideas and values. They back their perspective with the creative energy to achieve their goals.',
    imageUrl: 'https://i.ibb.co/4pJy3w9/IMG-20250112-002313.jpg',
    traits: [
      'Charisma',
      'Empathy',
      'Visionary Thinking',
      'Social Connectivity'
    ]
  },
  'ENFP': {
    title: 'The Campaigner',
    description: 'ENFP (Campaigner) is a personality type with the Extraverted, Intuitive, Feeling, and Prospecting traits. These people tend to embrace big ideas and actions that reflect their sense of hope and goodwill toward others. Their vibrant energy can flow in many directions.',
    imageUrl: 'https://i.ibb.co/RSWPZdR/IMG-20250112-002703.jpg',
    traits: [
      'Curiosity',
      'Enthusiasm',
      'Empathy',
      'Creativity'
    ]
  },
  'ESTJ': {
    title: 'The Executive',
    description: 'ESTJ (Executive) is a personality type with the Extraverted, Observant, Thinking, and Judging traits. They possess great fortitude, emphatically following their own sensible judgment. They often serve as a stabilizing force among others, able to offer solid direction amid adversity.',
    imageUrl: 'https://i.ibb.co/f1TpMNz/IMG-20250112-003124.jpg',
    traits: [
      'Leadership',
      'Practicality',
      'Strong Sense of Duty',
      'Decisiveness'
    ]
  },
  'ESFJ': {
    title: 'The Consul',
    description: 'ESFJ (Consul) is a personality type with the Extraverted, Observant, Feeling, and Judging traits. They are attentive and people-focused, and they enjoy taking part in their social community. Their achievements are guided by decisive values, and they willingly offer guidance to others.',
    imageUrl: 'https://i.ibb.co/r5ZpmxJ/IMG-20250112-003733.jpg',
    traits: [
      'Empathy',
      'Sociability',
      'Practicality',
      'Altruism'
    ]
  },
  'ISTP': {
    title: 'The Virtuoso',
    description: 'ISTP (Virtuoso) is a personality type with the Introverted, Observant, Thinking, and Prospecting traits. They tend to have an individualistic mindset, pursuing goals without needing much external connection. They engage in life with inquisitiveness and personal skill, varying their approach as needed.',
    imageUrl: 'https://i.ibb.co/FVWvxzW/IMG-20250112-003955.jpg',
    traits: [
      'Practicality',
      'Adaptability',
      'Curiosity',
      'Independence'
    ]
  },
  'ISFP': {
    title: 'The Adveturer',
    description: 'ISFP (Adventurer) is a personality type with the Introverted, Observant, Feeling, and Prospecting traits. They tend to have open minds, approaching life, new experiences, and people with grounded warmth. Their ability to stay in the moment helps them uncover exciting potentials.',
    imageUrl: 'https://i.ibb.co/7J2kFLx/IMG-20250112-004232.jpg',
    traits: [
      'creativity',
      'Empathy',
      'Spontaneity',
      'Individuality'
    ]
  },
  'ESTP': {
    title: 'The Entrepreneur',
    description: 'ESTP (Entrepreneur) is a personality type with the Extraverted, Observant, Thinking, and Prospecting traits. They tend to be energetic and action-oriented, deftly navigating whatever is in front of them. They love uncovering life’s opportunities, whether socializing with others or in more personal pursuits.',
    imageUrl: 'https://i.ibb.co/0fmJzCz/IMG-20250112-004521.jpg',
    traits: [
      'Adventurous',
      'Pragmatic',
      'Charismatic',
      'Problem-Solvers'
    ]
  },
  'ESFP': {
    title: 'The Entrepreneur',
    description: 'ESFP (Entertainer) is a personality type with the Extraverted, Observant, Feeling, and Prospecting traits. These people love vibrant experiences, engaging in life eagerly and taking pleasure in discovering the unknown. They can be very social, often encouraging others into shared activities.',
    imageUrl: 'https://i.ibb.co/LZ9DrtY/IMG-20250112-004803.jpg',
    traits: [
      'Sociability',
      'Spontaneity',
      'Empathy',
      'Creativity'
    ]
  },
  'ENTP': {
    title: 'The Debater',
    description: 'ENTP (Debater) is a personality type with the Extraverted, Intuitive, Thinking, and Prospecting traits. They tend to be bold and creative, deconstructing and rebuilding ideas with great mental agility. They pursue their goals vigorously despite any resistance they might encounter.',
    imageUrl: 'https://i.ibb.co/VNRNzhb/IMG-20250112-000402.jpg',
    traits: [
      'Innovative and creative',
      'Enthusiastic and energetic',
      'Analytical and logical',
      'Adaptable and resourceful'
    ]
  }
};

class PersonalityTest {
  constructor(bot, chatId, userId, userName) {
    this.bot = bot;
    this.chatId = chatId;
    this.userId = userId;
    this.userName = userName;
    this.currentQuestionIndex = 0;
    this.answers = {
      E: 0, I: 0,
      S: 0, N: 0,
      T: 0, F: 0,
      J: 0, P: 0
    };
    this.messageId = null;
  }

  async start() {
    try {
      await this.sendNextQuestion();
    } catch (error) {
      console.error('Error starting test:', error);
    }
  }

  async sendNextQuestion() {
    if (this.currentQuestionIndex >= questions.length) {
      await this.sendResults();
      return;
    }

    const question = questions[this.currentQuestionIndex];
    
    const questionText = `
📝 Question ${this.currentQuestionIndex + 1}/20
Personality Test for: @${this.userName}

${question.text}

Options:
A. ${question.options[0].text}
B. ${question.options[1].text}
C. ${question.options[2].text}
D. ${question.options[3].text}

⚠️ Simply reply to this message with A, B, C, or D`;

    try {
      const sentMessage = await this.bot.sendMessage(this.chatId, questionText, {
        reply_markup: {
          force_reply: true,
          selective: true
        }
      });
      this.messageId = sentMessage.message_id;
    } catch (error) {
      console.error('Error sending question:', error);
    }
  }

  processAnswer(answer) {
    try {
      const answerIndex = answer.toUpperCase().charCodeAt(0) - 65;
      
      if (answerIndex < 0 || answerIndex >= 4) {
        return false;
      }

      const question = questions[this.currentQuestionIndex];
      const selectedOption = question.options[answerIndex];
      
      // Increment the corresponding personality trait
      this.answers[selectedOption.type]++;
      
      // Move to next question
      this.currentQuestionIndex++;

      return this.currentQuestionIndex < questions.length;
    } catch (error) {
      console.error('Error processing answer:', error);
      return false;
    }
  }

  determinePersonalityType() {
    return [
      this.answers.E > this.answers.I ? 'E' : 'I',
      this.answers.S > this.answers.N ? 'S' : 'N',
      this.answers.T > this.answers.F ? 'T' : 'F',
      this.answers.J > this.answers.P ? 'J' : 'P'
    ].join('');
  }

  async sendResults() {
    try {
      const type = this.determinePersonalityType();
      const typeInfo = personalityTypes[type];

      const resultMessage = `
🎯 Personality Test Results for @${this.userName}

Your Type: ${type} - ${typeInfo.title}

📊 Type Breakdown:
• Extraversion (E) vs Introversion (I): ${this.answers.E}-${this.answers.I}
• Sensing (S) vs Intuition (N): ${this.answers.S}-${this.answers.N}
• Thinking (T) vs Feeling (F): ${this.answers.T}-${this.answers.F}
• Judging (J) vs Perceiving (P): ${this.answers.J}-${this.answers.P}

✨ Key Traits:
${typeInfo.traits.map(trait => `• ${trait}`).join('\n')}

📝 Description:
${typeInfo.description}

Want to learn more? Visit: www.16personalities.com/${type.toLowerCase()}-personality`;

      try {
        await this.bot.sendPhoto(this.chatId, typeInfo.imageUrl, {
          caption: resultMessage
        });
      } catch (imageError) {
        console.error('Error sending image:', imageError);
        await this.bot.sendMessage(this.chatId, resultMessage);
      }
    } catch (error) {
      console.error('Error sending results:', error);
    }
  }
}

// Explicitly create a map outside of the module.exports
const activeSessions = new Map();

module.exports = {
  name: 'personality',
  description: 'MBTI Personality Test',

  async execute(bot, msg) {
    try {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const userName = msg.from.username || msg.from.first_name;

      // Check for existing session
      const existingSession = activeSessions.get(chatId);
      if (existingSession) {
        await bot.sendMessage(chatId, 'A personality test is already in progress. Please wait or cancel the current test.');
        return;
      }

      // Create and start the test
      const test = new PersonalityTest(bot, chatId, userId, userName);
      activeSessions.set(chatId, test);
      
      await bot.sendMessage(chatId, `Welcome, @${userName}! The personality test will begin shortly...`);
      await test.start();
    } catch (error) {
      console.error('Error in personality test execution:', error);
    }
  },

  async handleReply(bot, msg) {
    try {
      const chatId = msg.chat.id;
      const test = activeSessions.get(chatId);

      if (!test) return;

      // Validate the answer
      const validAnswers = ['A', 'B', 'C', 'D'];
      const answer = msg.text.toUpperCase().trim();

      if (!validAnswers.includes(answer)) {
        await bot.sendMessage(chatId, 'Please reply with A, B, C, or D');
        return;
      }

      // Process the answer
      const continueTest = test.processAnswer(answer);

      if (continueTest) {
        await test.sendNextQuestion();
      } else {
        await test.sendResults();
        activeSessions.delete(chatId);
      }
    } catch (error) {
      console.error('Error handling reply:', error);
    }
  }
};
