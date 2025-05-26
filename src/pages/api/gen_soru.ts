import type { NextApiRequest, NextApiResponse } from 'next';

// Yapay Zeka tabanlı soru üretimi için kullanılacak veri havuzları
// Bu havuzlar kullanılarak her seferinde benzersiz sorular oluşturulacak

const modalVerbs = ['must', 'can\'t', 'could', 'may', 'might'];

// Her modal verb için olası kullanım amaçları ve açıklamalar
const modalVerbUsages = {
  'must': {
    usages: ['obligation', 'logical deduction', 'certainty', 'requirement', 'necessity'],
    explanations: [
      'MUST - Zorunluluk ifade eder.',
      'MUST - Kesin çıkarım ifade eder.',
      'MUST - Güçlü bir ihtimal veya zorunluluk anlatır.',
      'MUST - Kural veya gereklilik bildirir.',
      'MUST - Mantıksal olarak kesin olan durum ifade eder.'
    ]
  },
  'can\'t': {
    usages: ['impossibility', 'logical impossibility', 'prohibition', 'disbelief', 'certainty that something is not true'],
    explanations: [
      'CAN\'T - İmkansızlık ifade eder.',
      'CAN\'T - Mantıksal olarak imkansız durum ifade eder.',
      'CAN\'T - Yasak veya kısıtlama ifade eder.',
      'CAN\'T - İnanılmazlık veya şaşkınlık ifade eder.',
      'CAN\'T - Bir şeyin doğru olmadığından emin olma durumunu ifade eder.'
    ]
  },
  'could': {
    usages: ['past ability', 'possibility', 'polite request', 'suggestion', 'conditional possibility'],
    explanations: [
      'COULD - Geçmişteki yetenek ifade eder.',
      'COULD - Olasılık ifade eder.',
      'COULD - Kibarca istek ifade eder.',
      'COULD - Öneri veya tavsiye ifade eder.',
      'COULD - Koşullu olasılık ifade eder.'
    ]
  },
  'may': {
    usages: ['permission', 'possibility', 'formal request', 'wish', 'concession'],
    explanations: [
      'MAY - İzin verme ifade eder.',
      'MAY - Olasılık ifade eder.',
      'MAY - Resmi istek ifade eder.',
      'MAY - Dilek veya temenni ifade eder.',
      'MAY - Taviz verme ifade eder.'
    ]
  },
  'might': {
    usages: ['lower possibility', 'tentative suggestion', 'uncertainty', 'hypothetical situation', 'polite opinion'],
    explanations: [
      'MIGHT - Düşük olasılık ifade eder.',
      'MIGHT - Belirsiz öneri ifade eder.',
      'MIGHT - Belirsizlik veya kesin olmama durumu ifade eder.',
      'MIGHT - Varsayımsal durum ifade eder.',
      'MIGHT - Kibar bir şekilde görüş ifade eder.'
    ]
  }
};

// Her modal verb için cümle şablonları
const sentenceTemplates = {
  'must': [
    'You ______ {action} {timePhrase}.',
    '{subject} ______ {action} {object} {timePhrase}.',
    'According to the rules, we ______ {action} {timePhrase}.',
    '{subject} ______ be {adjective} because {reason}.',
    '{subject} speaks {language} perfectly. {subject2} ______ have lived in {country}.'
  ],
  'can\'t': [
    '{subject} ______ {action} {timePhrase}. {reason}',
    'You ______ be serious! {reason}',
    '{subject} ______ have {pastParticiple} {object}. {reason}',
    'That ______ be {subject}. {reason}',
    'It\'s {adjective}. We ______ {action} {timePhrase}.'
  ],
  'could': [
    'When {subject} was young, {subject} ______ {action} {adverb}.',
    'We ______ {action} {timePhrase} if {condition}.',
    '{subject} ______ {action} {object} if {subject2} wanted to.',
    '{subject} ______ {action}, but I\'m not sure if {subject2} will.',
    '{question} ______ you help me with this problem?'
  ],
  'may': [
    '______ I {action} {object}, please?',
    '{subject} ______ {action} {timePhrase}.',
    'You ______ {action} early today.',
    'According to the forecast, it ______ rain {timePhrase}.',
    '{subject} ______ not come to the meeting. {reason}'
  ],
  'might': [
    '{subject} ______ {action} {timePhrase}, but {subject2}\'s not sure yet.',
    'I ______ be late for the meeting.',
    '{subject} ______ know the answer, but I\'m not sure.',
    'Take an umbrella. It ______ rain later.',
    'The package ______ arrive {timePhrase}, but there\'s no guarantee.'
  ]
};

// Şablonları doldurmak için değişken havuzları
const variablePools = {
  subject: ['I', 'you', 'he', 'she', 'they', 'we', 'John', 'Mary', 'the teacher', 'the doctor', 'the student', 'my friend', 'my boss', 'the manager', 'the children', 'the experts', 'scientists', 'the government'],
  subject2: ['he', 'she', 'they', 'I', 'you', 'we', 'the teacher', 'the doctor'],
  action: ['go', 'study', 'work', 'come', 'finish', 'leave', 'start', 'help', 'call', 'visit', 'meet', 'send', 'prepare', 'clean', 'fix', 'solve', 'read', 'write', 'learn', 'teach'],
  object: ['the homework', 'the project', 'the exam', 'the meeting', 'the report', 'the presentation', 'the book', 'the letter', 'the house', 'the car', 'the problem', 'the question', 'the answer', 'the solution', 'the task', 'the assignment', 'the document', 'the email'],
  timePhrase: ['tomorrow', 'next week', 'yesterday', 'last month', 'today', 'right now', 'soon', 'in the morning', 'in the evening', 'at night', 'on Monday', 'before the deadline', 'within an hour', 'during the weekend', 'by next Friday'],
  reason: ['I saw her there', 'it\'s too late', 'the weather is bad', 'we don\'t have enough time', 'he told me so', 'she has another appointment', 'they aren\'t ready yet', 'the office is closed', 'it\'s impossible', 'that\'s what the rules say', 'I heard the news', 'there\'s no other explanation'],
  adjective: ['tired', 'happy', 'sad', 'angry', 'excited', 'nervous', 'worried', 'surprised', 'confused', 'disappointed', 'satisfied', 'relieved', 'hungry', 'thirsty', 'sick', 'healthy', 'busy', 'free', 'right', 'wrong'],
  adverb: ['quickly', 'slowly', 'easily', 'hardly', 'well', 'badly', 'carefully', 'carelessly', 'perfectly', 'terribly', 'regularly', 'rarely', 'always', 'never', 'sometimes', 'often', 'usually', 'occasionally', 'frequently', 'seldom'],
  language: ['English', 'French', 'Spanish', 'German', 'Italian', 'Chinese', 'Japanese', 'Russian', 'Arabic', 'Portuguese'],
  country: ['England', 'France', 'Spain', 'Germany', 'Italy', 'China', 'Japan', 'Russia', 'USA', 'Canada', 'Australia', 'Brazil', 'Mexico', 'India', 'Egypt', 'Turkey'],
  pastParticiple: ['done', 'seen', 'finished', 'completed', 'written', 'read', 'fixed', 'solved', 'prepared', 'checked'],
  condition: ['you want', 'it\'s necessary', 'you have time', 'the weather is good', 'we finish early', 'everyone agrees', 'there\'s enough money', 'they allow us', 'it\'s possible', 'we plan ahead'],
  question: ['Would', 'Could', 'Do you think']
};

// Diğer modal verb'leri bu modal verb'in seçeneklerinden çıkartalım (doğru cevap her zaman seçeneklerde olmalı)
const getOtherOptions = (correctVerb: string): string[] => {
  const otherOptions = modalVerbs.filter(verb => verb !== correctVerb);
  // Rastgele 3 tane seçelim
  const shuffledOptions = otherOptions.sort(() => 0.5 - Math.random());
  return shuffledOptions.slice(0, 3);
};

// Şablon içindeki değişkenleri gerçek değerlerle değiştirme
const fillTemplate = (template: string): string => {
  // Tüm değişkenleri değiştirelim
  let filledTemplate = template;
  
  // {} içindeki tüm değişkenleri bul
  const variables = template.match(/\{(\w+)\}/g);
  
  if (variables) {
    variables.forEach(variable => {
      // {} işaretlerini kaldır
      const varName = variable.replace(/[{}]/g, '');
      
      // Değişken havuzundan rastgele bir değer seç
      if (variablePools[varName as keyof typeof variablePools]) {
        const pool = variablePools[varName as keyof typeof variablePools];
        const randomValue = pool[Math.floor(Math.random() * pool.length)];
        
        // Şablonda değiştir
        filledTemplate = filledTemplate.replace(variable, randomValue);
      }
    });
  }
  
  return filledTemplate;
};

// AI benzeri soru oluşturucu
const generateAIQuestion = (targetVerb: string) => {
  // İlgili modal verb için şablonları al
  const templates = sentenceTemplates[targetVerb as keyof typeof sentenceTemplates];
  
  // Rastgele bir şablon seç
  const randomTemplateIndex = Math.floor(Math.random() * templates.length);
  const template = templates[randomTemplateIndex];
  
  // Şablonu doldur
  const question = fillTemplate(template);
  
  // Seçenekleri hazırla
  const otherOptions = getOtherOptions(targetVerb);
  const options = [targetVerb, ...otherOptions].sort(() => 0.5 - Math.random());
  
  // Doğru cevabın indeksini bul
  const correctAnswerIndex = options.indexOf(targetVerb);
  
  // Kullanım amacını seç ve açıklama oluştur
  const usageType = modalVerbUsages[targetVerb as keyof typeof modalVerbUsages];
  const randomUsageIndex = Math.floor(Math.random() * usageType.usages.length);
  const explanation = usageType.explanations[randomUsageIndex];
  
  return {
    question,
    options,
    correctAnswer: correctAnswerIndex,
    explanation,
    modalVerb: targetVerb,
    isAIGenerated: true
  };
};

const contexts = [
  'everyday situations',
  'past abilities',
  'probability and deduction',
  'permission and requests',
  'future possibilities'
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Allow both GET and POST requests
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract difficulty from query params (for GET) or body (for POST)
    const difficulty = req.method === 'GET' 
      ? (req.query.difficulty as string || 'medium') 
      : (req.body?.difficulty || 'medium');
    
    // Select random modal verb and context
    const selectedVerb = modalVerbs[Math.floor(Math.random() * modalVerbs.length)];
    const selectedContext = contexts[Math.floor(Math.random() * contexts.length)];

    // AI benzeri soru üret
    const generatedQuestion = generateAIQuestion(selectedVerb);

    // Zorluk seviyesi ve bağlam ekleyelim
    const enhancedQuestion = {
      ...generatedQuestion,
      difficulty,
      context: selectedContext
    };

    return res.status(200).json({
      success: true,
      question: enhancedQuestion,
      source: 'ai_generator'
    });

  } catch (error) {
    console.error('Error generating question:', error);    // Hata durumunda bile bir soru üretmeye çalışalım
    const fallbackVerb = modalVerbs[0];
    const fallbackQuestion = generateAIQuestion(fallbackVerb);
    
    return res.status(200).json({
      success: true,
      question: fallbackQuestion,
      source: 'ai_generator_fallback'
    });
  }
}
 