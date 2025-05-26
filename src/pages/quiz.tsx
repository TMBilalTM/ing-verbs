import { useState, useEffect } from 'react';
import { Brain, Clock, Star, ArrowRight, Home, Trophy } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  modalVerb: string;
}

interface User {
  username: string;
  score: number;
  questionsAnswered: number;
  accuracy: number;
}

export default function Quiz() {
  const [username, setUsername] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [questionCount, setQuestionCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Timer effect
  useEffect(() => {
    if (currentUser && currentQuestion && !showResult && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleAnswer(-1); // Time's up, wrong answer
    }
  }, [timeLeft, currentUser, currentQuestion, showResult]);

  // Kullanıcı adı localStorage'da varsa otomatik olarak ayarla
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('quizUsers') || '[]');
    const lastUser = storedUsers.length > 0 ? storedUsers[storedUsers.length - 1] : null;
    if (lastUser && lastUser.username) {
      setCurrentUser(lastUser);
      generateQuestion(); // Kullanıcı otomatik gelirse ilk soruyu da otomatik yükle
    }
  }, []);

  const handleLogin = () => {
    if (username.trim()) {
      const user: User = {
        username: username.trim(),
        score: 0,
        questionsAnswered: 0,
        accuracy: 0
      };
      setCurrentUser(user);
      generateQuestion();
    }
  };
  const generateQuestion = async () => {
    setLoading(true);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(30);

    try {
      // Call our API to generate a question
      const response = await fetch('/api/gen_soru', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          difficulty: 'medium'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate question');
      }

      const data = await response.json();
      
      if (data.success && data.question) {
        const newQuestion: Question = {
          id: Date.now().toString(),
          ...data.question
        };
        setCurrentQuestion(newQuestion);
      } else {
        throw new Error('Invalid question data');
      }
    } catch (error) {
      console.error('Error generating question:', error);
      
      // Fallback to pre-made questions if API fails
      const fallbackQuestions: Question[] = [        {
          id: '1',
          question: 'She ______ be at home now. I saw her car in the driveway.',
          options: ['must', 'can&apos;t', 'might', 'could'],
          correctAnswer: 0,
          explanation: 'MUST - Kesin çıkarım. Arabasını gördüğümüz için evde olduğuna eminiz.',
          modalVerb: 'must'
        },
        {
          id: '2',
          question: 'He ______ speak five languages when he was young.',
          options: ['must', 'could', 'can&apos;t', 'might'],
          correctAnswer: 1,
          explanation: 'COULD - Geçmişteki yetenek ifade eder.',
          modalVerb: 'could'
        },{
          id: '3',
          question: 'It&apos;s raining heavily. We ______ go to the beach today.',
          options: ['might', 'must', 'can&apos;t', 'could'],
          correctAnswer: 2,
          explanation: 'CAN&apos;T - Mantıklı olarak imkansız durumu ifade eder.',
          modalVerb: 'can&apos;t'
        },
        {
          id: '4',
          question: '______ I use your phone, please?',
          options: ['Must', 'Can&apos;t', 'May', 'Might'],
          correctAnswer: 2,
          explanation: 'MAY - Kibarca izin istemek için kullanılır.',
          modalVerb: 'may'
        },
        {
          id: '5',
          question: 'She ______ come to the party, but she&apos;s not sure yet.',
          options: ['must', 'can&apos;t', 'might', 'could'],
          correctAnswer: 2,
          explanation: 'MIGHT - Belirsiz olasılık ifade eder.',
          modalVerb: 'might'
        }
      ];

      const randomQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
      setCurrentQuestion(randomQuestion);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || showResult) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === currentQuestion?.correctAnswer;
    const newQuestionCount = questionCount + 1;
    const newCorrectAnswers = correctAnswers + (isCorrect ? 1 : 0);

    setQuestionCount(newQuestionCount);
    setCorrectAnswers(newCorrectAnswers);

    // Update user stats
    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        score: currentUser.score + (isCorrect ? 10 : 0),
        questionsAnswered: newQuestionCount,
        accuracy: Math.round((newCorrectAnswers / newQuestionCount) * 100)
      };
      setCurrentUser(updatedUser);

      // Save to localStorage for leaderboard
      const users = JSON.parse(localStorage.getItem('quizUsers') || '[]');
      const existingUserIndex = users.findIndex((u: User) => u.username === updatedUser.username);
      
      if (existingUserIndex >= 0) {
        users[existingUserIndex] = updatedUser;
      } else {
        users.push(updatedUser);
      }
      
      localStorage.setItem('quizUsers', JSON.stringify(users));
    }
  };

  const nextQuestion = () => {
    generateQuestion();
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Quiz&apos;e Başla
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Kullanıcı adını gir ve Modal Verbs quiz&apos;ine başla!
            </p>
          </div>
            <div className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Kullanıcı adını gir..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button
              onClick={handleLogin}
              disabled={!username.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Quiz&apos;e Başla
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-xl text-gray-600 dark:text-gray-300">Soru hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-300 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex flex-col">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/80 shadow-md sticky top-0 z-20 backdrop-blur-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Home className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-700">Ana Sayfa</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full shadow-sm">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="font-bold text-gray-900 dark:text-white">{currentUser.score}</span>
            </div>
            <Link href="/leaderboard" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors">
              <Trophy className="h-5 w-5" />
              <span>Sıralama</span>
            </Link>
          </div>
        </div>
      </header>
 
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-xl mx-auto bg-white/90 dark:bg-gray-800/90 rounded-3xl shadow-2xl p-8 border border-blue-100 dark:border-blue-900 flex flex-col min-h-[70vh] justify-center">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-blue-600 drop-shadow">{currentUser.score}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 tracking-wide">Puan</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-green-600 drop-shadow">{currentUser.questionsAnswered}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 tracking-wide">Soru</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-purple-600 drop-shadow">{currentUser.accuracy}%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 tracking-wide">Doğruluk</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-5 w-5 text-red-500 animate-pulse" />
                <span className={`text-3xl font-extrabold ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-900 dark:text-white'} drop-shadow`}>{timeLeft}</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 tracking-wide">Saniye</div>
            </div>
          </div>

          {/* Question */}
          {currentQuestion && (
            <div>
              <div className="mb-8">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(timeLeft / 30) * 100}%` }}
                  ></div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-4 leading-snug drop-shadow">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Options */}
              <div className="grid gap-4 mb-8">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showResult}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 shadow-sm text-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-400
                      ${selectedAnswer === index
                        ? index === currentQuestion.correctAnswer
                          ? 'border-green-500 bg-green-50 text-green-800 scale-105 shadow-green-200'
                          : 'border-red-500 bg-red-50 text-red-800 scale-105 shadow-red-200'
                        : showResult && index === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-50 text-green-800 scale-105 shadow-green-200'
                        : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-blue-900/20'}
                      ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className="font-bold text-xl w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                  </button>
                ))}
              </div>

              {/* Result */}
              {showResult && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-blue-900 p-6 rounded-2xl mb-8 border border-blue-100 dark:border-blue-900 shadow-md animate-fade-in flex flex-col items-center justify-center min-h-[220px]">
                  <div className={`flex items-center gap-2 mb-2 ${selectedAnswer === currentQuestion.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="font-bold text-xl">
                      {selectedAnswer === currentQuestion.correctAnswer ? '✓ Doğru!' : '✗ Yanlış!'}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-200 text-base text-center">
                    <strong>Açıklama:</strong> {currentQuestion.explanation}
                  </p>
                  <button
                    onClick={nextQuestion}
                    className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:scale-105 hover:from-blue-700 hover:to-indigo-700 transition-all text-lg"
                    autoFocus
                  >
                    Sonraki Soru
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
