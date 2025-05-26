import { BookOpen, Trophy, Users, Brain, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
 
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 text-white flex flex-col p-4 selection:bg-blue-500 selection:text-white">
      {/* Header - Simplified for a more focused landing page */}
      <header className="w-full py-6 px-4 flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-blue-400" />
          <h1 className="text-xl sm:text-2xl font-bold">
            Modal Verbs Quiz
          </h1>
        </div>
        <nav className="flex space-x-4 sm:space-x-6">
          <Link href="/quiz" className="text-gray-300 hover:text-blue-400 transition-colors font-medium">
            Quiz
          </Link>

          <Link href="/leaderboard" className="text-gray-300 hover:text-blue-400 transition-colors font-medium">
            Sıralama
          </Link>
        </nav>
      </header>

      {/* Hero Section - Enhanced for visual impact with improved mobile layout */}
      <main className="text-center flex flex-col items-center justify-center flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 md:pt-20">
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 leading-tight mt-6 sm:mt-0">
          İngilizce <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">Modal Verbs</span> Uzmanı Olun
        </h2>
        <p className="text-lg sm:text-xl text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto">
          Yapay zeka destekli dinamik sorularla must, can&apos;t, could, may, might gibi modal fiilleri öğrenin.
          Anlık sıralamada yerinizi alın ve İngilizce becerilerinizi zirveye taşıyın!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16 w-full sm:w-auto">
          <Link
            href="/quiz"
            className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50 w-full sm:w-auto"
          >
            <Zap className="mr-2 sm:mr-3 h-5 sm:h-6 w-5 sm:w-6 group-hover:animate-pulse" />
            Hemen Quize Başla
            <ArrowRight className="ml-2 sm:ml-3 h-4 sm:h-5 w-4 sm:w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/leaderboard"
            className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gray-700 text-gray-200 font-semibold rounded-lg hover:bg-gray-600 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 border border-gray-600 w-full sm:w-auto"
          >
            <Trophy className="mr-2 sm:mr-3 h-5 sm:h-6 w-5 sm:w-6 group-hover:animate-bounce" />
            Sıralamayı Gör
          </Link>
        </div>

        {/* Features Section - More dynamic and visually appealing, with improved responsive layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 w-full max-w-5xl mb-12 sm:mb-16">
          {[
            { icon: <BookOpen className="h-9 w-9 text-blue-400 mb-3 sm:mb-4" />, title: "AI Destekli Sorular", description: "Sürekli yenilenen, çeşitli zorluk seviyelerinde AI tabanlı sorular." },
            { icon: <Trophy className="h-9 w-9 text-yellow-400 mb-3 sm:mb-4" />, title: "Anlık Sıralama", description: "Gerçek zamanlı güncellenen liderlik tablosu ile rekabet edin." },
            { icon: <Users className="h-9 w-9 text-green-400 mb-3 sm:mb-4" />, title: "Kullanıcı Dostu", description: "Kolayca başlayın ve hemen öğrenmeye odaklanın." },
          ].map((feature, index) => (
            <div key={index} className="bg-gray-800 bg-opacity-50 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl hover:shadow-blue-500/30 transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="flex justify-center mb-3 sm:mb-4">{feature.icon}</div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-3 text-center">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-center text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Modal Verbs Info - Sleeker design with better responsive layout */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-5xl">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
            Öğreneceğin Temel Modal Verbs
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {[
              { verb: 'MUST', description: 'Zorunluluk', color: 'bg-red-500/20 text-red-300 border-red-500/50', icon: '❗' },
              { verb: "CAN\'T", description: 'Kesinlik (olumsuz)', color: 'bg-orange-500/20 text-orange-300 border-orange-500/50', icon: '❌' },
              { verb: 'COULD', description: 'Olasılık/Geçmiş', color: 'bg-sky-500/20 text-sky-300 border-sky-500/50', icon: '🤔' },
              { verb: 'MAY', description: 'İzin/Olasılık', color: 'bg-green-500/20 text-green-300 border-green-500/50', icon: '✅' },
              { verb: 'MIGHT', description: 'Daha az olasılık', color: 'bg-purple-500/20 text-purple-300 border-purple-500/50', icon: '❓' },
            ].map((item) => (
              <div key={item.verb} className={`text-center p-4 sm:p-6 rounded-lg border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 ${item.color}`}>
                <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">{item.icon}</div>
                <div className="font-bold text-lg sm:text-xl mb-0.5 sm:mb-1">{item.verb}</div>
                <div className="text-xs opacity-80">{item.description}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer - Minimalist */}
      <footer className="w-full text-center p-4 sm:p-6 text-gray-500 text-sm mt-8">
        © {new Date().getFullYear()} Modal Verbs Quiz. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
