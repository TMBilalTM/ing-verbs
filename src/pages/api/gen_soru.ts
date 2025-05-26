import type { NextApiRequest, NextApiResponse } from 'next';

// Yapay Zeka tabanlı soru üretimi için kullanılacak veri havuzları
// Bu havuzlar kullanılarak her seferinde benzersiz sorular oluşturulacak

const modalVerbs = ['must', 'can\'t', 'could', 'may', 'might'];

// Her modal verb için olası kullanım amaçları ve açıklamalar
const modalVerbUsages = {
  'must': {
    usages: ['obligation', 'logical deduction', 'certainty', 'requirement', 'necessity'],
    explanations: [
      'MUST - Zorunluluk ifade eder. "must" kelimesi zorunluluk anlamındadır ve kaçınılmaz bir durum olduğunu belirtir.',
      'MUST - Kesin çıkarım ifade eder. "must" kelimesi mantıksal bir çıkarım yapıldığını ve bunun kesin olarak doğru olduğunu düşündüğümüzü gösterir.',
      'MUST - Güçlü bir ihtimal veya zorunluluk anlatır. Özellikle kanıtlara dayanarak kesin bir sonuca varmayı ifade eder.',
      'MUST - Kural veya gereklilik bildirir. "According to the rules" veya benzeri ifadeler bir kuralın varlığını işaret eder.',
      'MUST - Mantıksal olarak kesin olan durum ifade eder. İpucu: Cümledeki kanıt veya göstergeye dikkat edin.'
    ],
    clueWords: [
      'certainly', 'definitely', 'surely', 'absolutely', 'no doubt', 'obviously', 'clearly', 
      'according to the rules', 'it is necessary', 'it is required', 'evidence suggests', 
      'we have proof', 'the only explanation', 'I\'m sure that'
    ]
  },
  'can\'t': {
    usages: ['impossibility', 'logical impossibility', 'prohibition', 'disbelief', 'certainty that something is not true'],
    explanations: [
      'CAN\'T - İmkansızlık ifade eder. "can\'t" kelimesi bir şeyin yapılamayacağını veya mantıken mümkün olmadığını belirtir.',
      'CAN\'T - Mantıksal olarak imkansız durum ifade eder. İpucu: Cümledeki mantıksal çelişkiye bakın.',
      'CAN\'T - Yasak veya kısıtlama ifade eder. Bir şeyin yapılmasının yasak olduğunu veya izin verilmediğini belirtir.',
      'CAN\'T - İnanılmazlık veya şaşkınlık ifade eder. Cümledeki "You can\'t be serious" gibi ifadeler şaşkınlık belirtir.',
      'CAN\'T - Bir şeyin doğru olmadığından emin olma durumunu ifade eder. İpucu: "reason" kısmı neden imkansız olduğunu açıklar.'
    ],
    clueWords: [
      'impossible', 'not possible', 'no way', 'doesn\'t make sense', 'contradicts', 'against the rules',
      'forbidden', 'not allowed', 'prohibited', 'unbelievable', 'absurd', 'ridiculous', 'never',
      'in no way', 'under no circumstances'
    ]
  },
  'could': {
    usages: ['past ability', 'possibility', 'polite request', 'suggestion', 'conditional possibility'],
    explanations: [
      'COULD - Geçmişteki yetenek ifade eder. İpucu: "When I was young" veya "used to" gibi geçmişe yönelik ifadeler.',
      'COULD - Olasılık ifade eder. Bir şeyin olabileceğini ama kesin olmadığını belirtir.',
      'COULD - Kibarca istek ifade eder. Özellikle "Could you...?" şeklindeki soru cümleleri kibar bir rica içerir.',
      'COULD - Öneri veya tavsiye ifade eder. Mümkün olan seçenekleri ifade etmek için kullanılır.',
      'COULD - Koşullu olasılık ifade eder. İpucu: Cümlede "if" ile başlayan koşul cümlesine dikkat edin.'
    ],
    clueWords: [
      'when I/he/she was young', 'in the past', 'used to', 'maybe', 'perhaps', 'possibly', 
      'would it be possible', 'if you want', 'suggestion', 'one option', 'alternatively',
      'if', 'condition', 'as a possibility'
    ]
  },
  'may': {
    usages: ['permission', 'possibility', 'formal request', 'wish', 'concession'],
    explanations: [
      'MAY - İzin verme ifade eder. İpucu: "May I...?" şeklindeki soru cümleleri genellikle izin istemek için kullanılır.',
      'MAY - Olasılık ifade eder. Bir şeyin olma ihtimalini belirtir, ancak orta derecede bir ihtimaldir.',
      'MAY - Resmi istek ifade eder. Özellikle formal durumlarda kibarca istek belirtmek için kullanılır.',
      'MAY - Dilek veya temenni ifade eder. İyi dilekleri ifade etmek için kullanılır.',
      'MAY - Taviz verme ifade eder. Karşıt durumları kabul etmek için kullanılır.'
    ],
    clueWords: [
      'permission', 'allow', 'is it ok if', 'possibly', 'perhaps', 'around 50% chance',
      'formal request', 'in formal settings', 'officially', 'wish you all the best', 
      'hope that', 'although', 'despite the fact', 'even though'
    ]
  },
  'might': {
    usages: ['lower possibility', 'tentative suggestion', 'uncertainty', 'hypothetical situation', 'polite opinion'],
    explanations: [
      'MIGHT - Düşük olasılık ifade eder. "Might" kelimesi, bir şeyin olma ihtimalinin düşük olduğunu belirtir.',
      'MIGHT - Belirsiz öneri ifade eder. Kesin olmayan, çekingen önerileri belirtir.',
      'MIGHT - Belirsizlik veya kesin olmama durumu ifade eder. İpucu: "but not sure yet" gibi ifadeler belirsizliği gösterir.',
      'MIGHT - Varsayımsal durum ifade eder. Gerçekleşmesi pek muhtemel olmayan durumları ifade eder.',
      'MIGHT - Kibar bir şekilde görüş ifade eder. Belirsiz veya yumuşatılmış bir görüş belirtmek için kullanılır.'
    ],
    clueWords: [
      'small chance', 'not very likely', 'possible but uncertain', 'not sure yet', 'doubtful',
      'tentative', 'just a suggestion', 'thinking out loud', 'perhaps', 'maybe', 
      'hypothetically speaking', 'in theory', 'if I may say so', 'in my humble opinion'
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
  
  // Cümlenin hangi kısmının ipucu olarak kullanılabileceğini belirleme
  const clueWords = usageType.clueWords;
  const randomClueIndex = Math.floor(Math.random() * clueWords.length);
  const clueWord = clueWords[randomClueIndex];
  
  // Cümleyi parçalara ayrıştırma ve ipucu bölgeyi belirleme
  let questionParts = parseQuestionForClues(question, targetVerb);
  
  // Eğer clue'ları bulamazsak basit bir ipucu oluştur
  if (!questionParts.highlightedPart) {
    // Cümledeki modal boşluk dışındaki kısımları analiz edelim
    const parts = question.split('______');
    if (parts.length >= 2) {
      // Cümlenin boşluktan sonraki kısmını ipucu olarak kullan
      questionParts = {
        beforeHighlight: parts[0] + '______',
        highlightedPart: parts[1].split('.')[0], // İlk nokta işaretine kadar olan kısmı al
        afterHighlight: parts[1].includes('.') ? '.' + parts[1].split('.').slice(1).join('.') : '',
        clueType: usageType.usages[randomUsageIndex]
      };
    }
  }
  
  return {
    question,
    options,
    correctAnswer: correctAnswerIndex,
    explanation,
    modalVerb: targetVerb,
    isAIGenerated: true,
    clueInfo: {
      clueWord,
      clueType: usageType.usages[randomUsageIndex],
      questionParts
    }
  };
};

// Cümledeki ipucu bölgeleri tespit etme
const parseQuestionForClues = (question: string, targetVerb: string) => {
  // Modal verb'in kullanım türüne göre ipucu kelimeleri al
  const usageType = modalVerbUsages[targetVerb as keyof typeof modalVerbUsages];
  const clueWords = usageType.clueWords;
  
  // Cümledeki olası ipucu kelimelerini kontrol edelim
  let highlightedPart = '';
  let beforeHighlight = '';
  let afterHighlight = '';
  let clueType = '';
  
  // Cümleyi boşluk etrafında bölelim
  const parts = question.split('______');
  if (parts.length < 2) {
    return { beforeHighlight: question, highlightedPart: '', afterHighlight: '', clueType: '' };
  }
  
  // Önce ve sonra kısımlarını alalım
  const beforeGap = parts[0];
  const afterGap = parts[1];
  
  // İpucu kelimelerini arayalım
  for (const clueWord of clueWords) {
    // Boşluktan önceki kısımda ipucu var mı?
    if (beforeGap.toLowerCase().includes(clueWord.toLowerCase())) {
      // İpucu önceki kısımda
      const regex = new RegExp(`(.*?)(\\b${clueWord}\\b.*?)(\\s+)`, 'i');
      const match = beforeGap.match(regex);
      
      if (match) {
        beforeHighlight = match[1];        highlightedPart = match[2];
        afterHighlight = match[3] + '______' + afterGap;
        clueType = usageType.usages.find(_ => 
          usageType.clueWords.some(w => w.includes(clueWord))) || '';
        break;
      }
    }
    
    // Boşluktan sonraki kısımda ipucu var mı?
    if (afterGap.toLowerCase().includes(clueWord.toLowerCase())) {
      // İpucu sonraki kısımda
      const regex = new RegExp(`(.*?)(\\b${clueWord}\\b.*?)(\\..*)?$`, 'i');
      const match = afterGap.match(regex);
      
      if (match) {
        beforeHighlight = beforeGap + '______ ' + (match[1] || '');        highlightedPart = match[2];
        afterHighlight = match[3] || '';
        clueType = usageType.usages.find(_ => 
          usageType.clueWords.some(w => w.includes(clueWord))) || '';
        break;
      }
    }
  }
  
  // Eğer ipucu kelimesi bulunamazsa
  if (!highlightedPart) {
    // Cümledeki yapısal ipuçlarını kontrol edelim
    // Örneğin "if" conditional yapısı için ipucu olabilir
    
    // "if" yapısı kontrolü (could için)
    if (targetVerb === 'could' && afterGap.toLowerCase().includes(' if ')) {
      const ifParts = afterGap.split(' if ');
      beforeHighlight = beforeGap + '______ ' + ifParts[0];
      highlightedPart = 'if ' + ifParts[1].split('.')[0];
      afterHighlight = ifParts[1].includes('.') ? '.' + ifParts[1].split('.').slice(1).join('.') : '';
      clueType = 'conditional possibility';
    }
    
    // "when I was young" gibi geçmiş yapılar (could için)
    else if (targetVerb === 'could' && (beforeGap.toLowerCase().includes('when') && beforeGap.toLowerCase().includes('young'))) {
      beforeHighlight = '';
      highlightedPart = beforeGap.trim();
      afterHighlight = '______ ' + afterGap;
      clueType = 'past ability';
    }
    
    // "May I" yapısı izin için
    else if (targetVerb === 'may' && beforeGap.trim() === '') {
      beforeHighlight = '';
      highlightedPart = 'May I';
      afterHighlight = ' ______ ' + afterGap;
      clueType = 'permission';
    }
    
    // "must" için kanıt içeren ifadeler
    else if (targetVerb === 'must' && afterGap.toLowerCase().includes('because')) {
      const becauseParts = afterGap.split('because');
      beforeHighlight = beforeGap + '______ ' + becauseParts[0];
      highlightedPart = 'because' + becauseParts[1];
      afterHighlight = '';
      clueType = 'logical deduction';
    }
    
    // "can't" için reason/sebep içeren ifadeler
    else if (targetVerb === 'can\'t' && afterGap.includes('.')) {
      const reasonParts = afterGap.split('.');
      beforeHighlight = beforeGap + '______ ' + reasonParts[0] + '.';
      highlightedPart = reasonParts.length > 1 ? reasonParts[1].trim() : '';
      afterHighlight = reasonParts.length > 2 ? '.' + reasonParts.slice(2).join('.') : '';
      clueType = 'logical impossibility';
    }
  }
  
  return {
    beforeHighlight,
    highlightedPart,
    afterHighlight,
    clueType
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
