import { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Users, ArrowLeft, RefreshCw, BarChart3, PieChart as PieChartIcon, CheckCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface User {
  username: string;
  score: number;
  questionsAnswered: number;
  accuracy: number;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadLeaderboard = () => {
    setLoading(true);
    try {
      const savedUsers = JSON.parse(localStorage.getItem('quizUsers') || '[]');
      const sortedUsers = savedUsers.sort((a: User, b: User) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        return b.questionsAnswered - a.questionsAnswered;
      });
      setUsers(sortedUsers);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setUsers([]); // Clear users on error to avoid displaying stale data
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-7 w-7 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-7 w-7 text-slate-400" />;
    if (rank === 3) return <Medal className="h-7 w-7 text-orange-400" />;
    return <span className="text-lg font-bold text-slate-300">{rank}</span>;
  };

  const getRankRowClass = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20';
    if (rank === 2) return 'bg-slate-500/10 border-slate-500/30 hover:bg-slate-500/20';
    if (rank === 3) return 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20';
    return 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-700/60';
  };

  const chartData = users.slice(0, 10).map(user => ({
    name: user.username.length > 10 ? user.username.substring(0, 10) + '…' : user.username,
    Puan: user.score,
    Doğruluk: user.accuracy,
  }));

  const accuracyDistributionData = [
    { name: 'Harika (90-100%)', value: users.filter(u => u.accuracy >= 90).length, color: '#10B981' }, // green-500
    { name: 'İyi (70-89%)', value: users.filter(u => u.accuracy >= 70 && u.accuracy < 90).length, color: '#3B82F6' }, // blue-500
    { name: 'Orta (50-69%)', value: users.filter(u => u.accuracy >= 50 && u.accuracy < 70).length, color: '#F59E0B' }, // amber-500
    { name: 'Geliştirilmeli (<50%)', value: users.filter(u => u.accuracy < 50).length, color: '#EF4444' }, // red-500
  ].filter(item => item.value > 0);

  const statsCardsData = [
    { icon: <Users className="h-10 w-10 text-blue-400" />, label: "Toplam Katılımcı", value: users.length },
    { icon: <Star className="h-10 w-10 text-yellow-400" />, label: "Toplam Puan Havuzu", value: users.reduce((sum, user) => sum + user.score, 0) },
    { icon: <CheckCircle className="h-10 w-10 text-green-400" />, label: "Ortalama Doğruluk", value: `${users.length > 0 ? Math.round(users.reduce((sum, user) => sum + user.accuracy, 0) / users.length) : 0}%` },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
        <div className="text-center">
          <RefreshCw className="h-16 w-16 text-blue-400 mx-auto mb-6 animate-spin" />
          <p className="text-2xl text-slate-300">Sıralama yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 text-slate-100 p-4 sm:p-6 lg:p-8 selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <header className="mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="group flex items-center space-x-2 text-slate-300 hover:text-blue-400 transition-colors">
            <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-lg">Ana Sayfa</span>
          </Link>
          <div className="flex items-center space-x-3">
            <Trophy className="h-10 w-10 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
              Liderlik Tablosu
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={loadLeaderboard}
              title="Sıralamayı Yenile"
              className="group flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-300'}`} />
              <span>Yenile</span>
            </button>
            <Link
              href="/quiz"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Quize Katıl
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* Stats Overview - Modernized */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {statsCardsData.map((stat, cardIndex) => (
            <div key={cardIndex} className="bg-slate-800/70 backdrop-blur-sm p-6 rounded-xl shadow-xl hover:shadow-blue-500/20 transition-shadow duration-300 flex items-center space-x-4">
              <div className="p-3 bg-slate-700/50 rounded-lg">{stat.icon}</div>
              <div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/50 rounded-xl shadow-xl">
            <Trophy className="h-24 w-24 text-slate-500 mx-auto mb-6" />
            <h2 className="text-3xl font-semibold text-slate-200 mb-3">Liderlik Tablosu Henüz Boş</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Görünüşe göre henüz kimse quizde kendini test etmemiş. İlk sıralarda yerini almak için hemen başla!
            </p>
            <Link
              href="/quiz"
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/40 text-lg"
            > 
              <Zap className="mr-2 h-5 w-5" />
              İlk Quizi Çöz
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Leaderboard Table - Enhanced */}
            <div className="lg:col-span-3 bg-slate-800/70 backdrop-blur-sm p-6 rounded-xl shadow-xl">
              <div className="flex items-center mb-6">
                <BarChart3 className="h-8 w-8 text-blue-400 mr-3" />
                <h2 className="text-2xl font-semibold text-white">En İyi Oyuncular</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="p-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider w-16">Sıra</th>
                      <th className="p-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Kullanıcı</th>
                      <th className="p-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Puan</th>
                      <th className="p-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Soru</th>
                      <th className="p-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Doğruluk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, userIndex) => (
                      <tr key={user.username} className={`border-b border-slate-700/50 transition-colors duration-200 ${getRankRowClass(userIndex + 1)}`}>
                        <td className="p-4 font-medium whitespace-nowrap w-16">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-700/50">
                            {getRankIcon(userIndex + 1)}
                          </div>
                        </td>
                        <td className="p-4 font-medium text-slate-200 whitespace-nowrap">
                          {user.username}
                        </td>
                        <td className="p-4 text-right font-semibold text-blue-400 whitespace-nowrap">{user.score}</td>
                        <td className="p-4 text-right text-slate-300 whitespace-nowrap">{user.questionsAnswered}</td>
                        <td className="p-4 text-right text-slate-300 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${user.accuracy >= 75 ? 'bg-green-500/20 text-green-300' : user.accuracy >= 50 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>
                            {user.accuracy.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Charts Column - Enhanced */}
            <div className="lg:col-span-2 space-y-8">
              {/* Top Users Bar Chart */}
              {chartData.length > 0 && (
                <div className="bg-slate-800/70 backdrop-blur-sm p-6 rounded-xl shadow-xl">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="h-7 w-7 text-blue-400 mr-3" />
                    <h3 className="text-xl font-semibold text-white">Top 10 Puan Dağılımı</h3>
                  </div>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} fontSize={12} />
                        <YAxis tick={{ fill: '#94a3b8' }} fontSize={12} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                          labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                          itemStyle={{ color: '#94a3b8' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '14px', color: '#94a3b8' }} />
                        <Bar dataKey="Puan" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Doğruluk" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Accuracy Distribution Pie Chart */}
              {accuracyDistributionData.length > 0 && (
                <div className="bg-slate-800/70 backdrop-blur-sm p-6 rounded-xl shadow-xl">
                  <div className="flex items-center mb-4">
                    <PieChartIcon className="h-7 w-7 text-green-400 mr-3" />
                    <h3 className="text-xl font-semibold text-white">Doğruluk Oranı Dağılımı</h3>
                  </div>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={accuracyDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                              <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                                {`${name} (${(percent * 100).toFixed(0)}%)`}
                              </text>
                            );
                          }}
                        >
                          {accuracyDistributionData.map((entry, pieCellIndex) => (
                            <Cell key={`cell-${pieCellIndex}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                           contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                           labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer - Minimalist */}
      <footer className="w-full text-center p-6 text-slate-500 text-sm mt-12">
        © {new Date().getFullYear()} Modal Verbs Quiz. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
