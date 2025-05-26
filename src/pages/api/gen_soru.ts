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

// Her modal verb için cümle şablonları - Daha tutarlı ve mantıklı şablonlar
const sentenceTemplates = {
  'must': [
    'You ______ {action} {timePhrase}. It\'s required by the rules.',
    '{subject} ______ {action} {object} {timePhrase}. There\'s no other option.',
    'According to the regulations, we ______ {action} {timePhrase}.',
    '{subject} ______ be {adjective} because we have clear evidence.',
    '{subject} got 100% on the test. {subject2} ______ have studied very hard.',
    'Look at those dark clouds. It ______ rain soon.',
    'This ______ be the correct address. It matches the description perfectly.',
    'Everyone ______ follow the safety procedures during the emergency drill.'
  ],
  'can\'t': [
    '{subject} ______ {action} {timePhrase}. It\'s physically impossible.',
    'You ______ be serious! That\'s completely absurd.',
    '{subject} ______ have {pastParticiple} {object}. {subject} was with me the whole time.',
    'That ______ be {subject}. {subject} is currently traveling abroad.',
    'It\'s {adjective}. We ______ go outside in this weather.',
    'This ______ be the right solution. I\'ve tried it and it doesn\'t work.',
    'She ______ have finished the project already. It usually takes at least a week.',
    'He ______ be a professional athlete. He doesn\'t have the proper training.'
  ],
  'could': [
    'When I was younger, I ______ {action} for hours without getting tired.',
    'We ______ try again tomorrow if today doesn\'t work out.',
    '______ you help me with this problem, please?',
    'If we had more time, we ______ visit the museum as well.',
    '{subject} ______ speak three languages fluently by the age of ten.',
    'I ______ lend you my car if you need it.',
    'We ______ meet at the coffee shop or the library, whichever you prefer.',
    'The document ______ be in the filing cabinet. Have you checked there?'
  ],
  'may': [
    '______ I borrow your pen for a moment?',
    'We ______ experience some delays due to the weather conditions.',
    'Students ______ use the library until 10 PM on weekdays.',
    '{subject} ______ join us later if {subject} has time.',
    'You ______ leave early today as you\'ve completed all your tasks.',
    'The concert ______ be cancelled if the weather gets worse.',
    '______ we come in now? The meeting is about to start.',
    'Although she studied hard, she ______ not pass the exam.'
  ],
  'might': [
    '{subject} ______ come to the party, but {subject} is not sure yet.',
    'I ______ go to the cinema this weekend, but I haven\'t decided.',
    'It ______ rain later, but the forecast is uncertain.',
    'We ______ be able to help you, but I need to check with my manager first.',
    'The train ______ be delayed due to the bad weather, it\'s possible.',
    'I ______ have left my keys at home. I\'m not certain.',
    'She ______ or ______ not agree with the proposal. It\'s hard to predict.',
    'This solution ______ work, but I\'m not very confident about it.'
  ]
};

// Değişken havuzları - Daha geniş ve anlamlı seçenekler
const variablePools = {
  'subject': ['I', 'you', 'he', 'she', 'they', 'we', 'John', 'Maria', 'the teacher', 'the doctor', 'my brother', 'my sister', 'the students', 'the manager', 'the team'],
  'subject2': ['he', 'she', 'they', 'John', 'Maria'],
  'action': ['visit Paris', 'finish the project', 'attend the meeting', 'submit the assignment', 'learn Spanish', 'solve this problem', 'complete the task', 'pass the exam', 'read this book', 'clean the house', 'prepare for the presentation'],
  'timePhrase': ['by tomorrow', 'next week', 'before the deadline', 'in two hours', 'this weekend', 'by the end of the month', 'during the holiday', 'every day', 'when necessary', 'soon'],
  'object': ['the report', 'the assignment', 'the project', 'those books', 'the contract', 'the presentation', 'this application', 'the task', 'these documents'],
  'adjective': ['tired', 'excited', 'nervous', 'happy', 'worried', 'busy', 'ill', 'successful', 'responsible', 'creative', 'professional', 'experienced'],
  'reason': ['the evidence is clear', 'all signs point to it', 'there\'s no other explanation', 'it\'s the only possibility', 'that\'s what the rules state', 'we have proof'],
  'pastParticiple': ['completed', 'finished', 'written', 'read', 'eaten', 'seen', 'visited', 'solved', 'delivered', 'prepared'],
  'language': ['French', 'Spanish', 'German', 'Mandarin', 'Arabic', 'Japanese', 'Italian', 'Russian', 'Portuguese'],
  'country': ['France', 'Spain', 'Germany', 'China', 'Japan', 'Italy', 'Brazil', 'Mexico', 'Canada', 'Australia']
};

// Rastgele ama belirli modal verb dışında seçenekler üretme
const getOtherOptions = (targetVerb: string): string[] => {
  return modalVerbs
    .filter(verb => verb !== targetVerb)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);
};

// Şablon içindeki değişkenleri gerçek değerlerle değiştirme - Geliştirilmiş mantık
const fillTemplate = (template: string): string => {
  // Tüm değişkenleri değiştirelim
  let filledTemplate = template;
  
  // {} içindeki tüm değişkenleri bul
  const variables = template.match(/\{(\w+)\}/g);
  
  if (variables) {
    // Takip edilen değişkenleri tutmak için
    const usedValues: Record<string, string> = {};
    
    variables.forEach(variable => {
      // {} işaretlerini kaldır
      const varName = variable.replace(/[{}]/g, '');
      
      // Değişken havuzundan rastgele bir değer seç
      if (variablePools[varName as keyof typeof variablePools]) {
        const pool = variablePools[varName as keyof typeof variablePools];
        
        // Eğer bu bir subject ise ve daha önce kullanıldıysa, aynı değeri kullan
        // Bu tutarlılık sağlar
        if ((varName === 'subject2' || varName === 'subject') && usedValues['subject']) {
          if (varName === 'subject2' && ['I', 'you', 'we'].includes(usedValues['subject'])) {
            // I, you, we için subject2 olarak farklı bir değer kullan
            const randomValue = pool.filter(v => !['I', 'you', 'we'].includes(v))[Math.floor(Math.random() * (pool.length - 3))];
            filledTemplate = filledTemplate.replace(variable, randomValue);
            usedValues[varName] = randomValue;
          } else {
            // Tutarlılık için aynı değeri kullan
            filledTemplate = filledTemplate.replace(variable, usedValues['subject']);
            usedValues[varName] = usedValues['subject'];
          }
        } else {
          // Rastgele değer seç
          const randomValue = pool[Math.floor(Math.random() * pool.length)];
          filledTemplate = filledTemplate.replace(variable, randomValue);
          usedValues[varName] = randomValue;
        }
      }
    });
  }
  
  // Büyük harfle başlayan cümle olsun
  return filledTemplate.charAt(0).toUpperCase() + filledTemplate.slice(1);
};

// Sorunun mantıklı olup olmadığını kontrol et
const isQuestionValid = (question: string, targetVerb: string): boolean => {
  // Temel kontroller
  if (!question || question.length < 10) return false;
  
  // Tekrarlayan kelimeler var mı?
  const words = question.toLowerCase().split(/\s+/);
  const wordCounts: Record<string, number> = {};
  
  words.forEach(word => {
    if (word.length > 3) { // 3 harften uzun kelimeleri kontrol et
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });
  
  // Herhangi bir kelime çok sık tekrarlanıyor mu?
  const repeatedWords = Object.keys(wordCounts).filter(word => wordCounts[word] > 2);
  if (repeatedWords.length > 1) return false; // Birden fazla kelime tekrarlanıyorsa geçersiz
  
  // Modal verb için uygunluk kontrolü
  // Her modal için özel kurallar ekleyebilirsiniz
  switch(targetVerb) {
    case 'must':
      // "must" genelde zorunluluk veya kesin çıkarım içerir
      return question.includes('required') || 
             question.includes('have to') ||
             question.includes('clear evidence') ||
             question.includes('only option') ||
             question.includes('regulation');
    
    case 'can\'t':
      // "can't" genelde imkansızlık veya kesin olmayan durum ifade eder
      return question.includes('impossible') || 
             question.includes('absurd') ||
             question.includes('doesn\'t work') ||
             question.toLowerCase().includes('can\'t be');
    
    case 'could':
      // "could" genelde geçmiş yetenek veya olasılık
      return question.includes('When I was') || 
             question.includes('if') ||
             question.includes('please') ||
             question.includes('by the age of');
    
    case 'may':
      // "may" genelde izin veya olasılık
      return question.toLowerCase().startsWith('may i') || 
             question.includes('experience') ||
             question.includes('Students may') ||
             question.includes('if');
    
    case 'might':
      // "might" düşük olasılık
      return question.includes('but') || 
             question.includes('uncertain') ||
             question.includes('possible') ||
             question.includes('not sure');
    
    default:
      return true;
  }
};

// AI benzeri soru oluşturucu - Geliştirilmiş mantık
const generateAIQuestion = (targetVerb: string, difficulty: string = 'medium') => {
  let attempts = 0;
  let question = '';
  let isValid = false;
  
  // Geçerli bir soru oluşturana kadar dene (maks 5 deneme)
  while (!isValid && attempts < 5) {
    // İlgili modal verb için şablonları al
    const templates = sentenceTemplates[targetVerb as keyof typeof sentenceTemplates];
    
    // Zorluk seviyesine göre şablon seç
    let template;
    if (difficulty === 'easy') {
      // Kolay: Basit ve açık ipucu içeren şablonlar
      template = templates[Math.floor(Math.random() * Math.min(3, templates.length))]; 
    } else if (difficulty === 'hard') {
      // Zor: Daha karmaşık şablonlar
      template = templates[Math.floor(Math.random() * templates.length)];
      if (Math.random() > 0.5) {
        // Zor sorularda %50 olasılıkla ipuçlarını kaldır
        template = template.replace(/\. .*$/, '.');
      }
    } else {
      // Orta: Tüm şablonlar
      template = templates[Math.floor(Math.random() * templates.length)];
    }
    
    // Şablonu doldur
    question = fillTemplate(template);
    
    // Sorunun mantıklı olup olmadığını kontrol et
    isValid = isQuestionValid(question, targetVerb);
    
    attempts++;
  }
  
  // Seçenekleri hazırla
  const otherOptions = getOtherOptions(targetVerb);
  const options = [targetVerb, ...otherOptions];
  
  // Zorluk seviyesine göre seçenekleri karıştır
  if (difficulty !== 'easy') {
    // Kolay olmayan sorularda seçenekleri karıştır
    options.sort(() => 0.5 - Math.random());
  }
  
  // Doğru cevabın indeksini bul
  const correctAnswerIndex = options.indexOf(targetVerb);
  
  // Kullanım amacını seç ve açıklama oluştur
  const usageType = modalVerbUsages[targetVerb as keyof typeof modalVerbUsages];
  const randomUsageIndex = Math.floor(Math.random() * usageType.usages.length);
  const usage = usageType.usages[randomUsageIndex];
  const explanation = usageType.explanations[randomUsageIndex];
  
  // Modal verbi ve onun açıklamasını içeren nesneyi oluştur
  const result = {
    question,
    options,
    correctAnswer: correctAnswerIndex,
    explanation,
    modalVerb: targetVerb,
    usage: usage
  };
    // İpucu oluştur
  const clueInfo = parseQuestionForClues(question, targetVerb);
  
  return { ...result, clueInfo };
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
        clueType = usageType.usages.find(() => 
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
        clueType = usageType.usages.find(() => 
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
    
    // Geçerli zorluk seviyesi kontrolü
    const validDifficulty = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';
    
    // Select random modal verb and context
    const selectedVerb = modalVerbs[Math.floor(Math.random() * modalVerbs.length)];
    const selectedContext = contexts[Math.floor(Math.random() * contexts.length)];

    // AI benzeri soru üret - zorluk seviyesini de gönder
    const generatedQuestion = generateAIQuestion(selectedVerb, validDifficulty);

    // Zorluk seviyesi ve bağlam ekleyelim
    const enhancedQuestion = {
      ...generatedQuestion,
      difficulty: validDifficulty,
      context: selectedContext
    };

    return res.status(200).json({
      success: true,
      question: enhancedQuestion,
      source: 'ai_generator'
    });

  } catch (error) {
    console.error('Error generating question:', error);
    
    // Hata durumunda bile bir soru üretmeye çalışalım
    const fallbackVerb = modalVerbs[0];
    const fallbackQuestion = generateAIQuestion(fallbackVerb, 'medium');
    
    return res.status(200).json({
      success: true,
      question: fallbackQuestion,
      source: 'ai_generator_fallback'
    });
  }
}
