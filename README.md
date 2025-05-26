# 🚀 Modal Verbs Quiz - İngilizce Öğrenme Platformu

<div align="center">
  <img src="public/file.svg" alt="Modal Verbs Quiz Logo" width="120" />
  <br><br>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)
  [![HuggingFace](https://img.shields.io/badge/Hugging_Face-AI-FFD21E?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAbwAAAG8B8aLcQwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGHSURBVDiNjZK9S8NAFMXPJWmttiqIGhVEUBR0UHHQVUHr5uIgCK66FMW1s5PqKLoIQnF0F0EE8a+QRbCTiIO2UMWvxKQmud9xaGhis4qnd3m8+91377sYY4gQlFI5ANMARMR2AMwZY4JITBhgrV0GsEZysCSEWARQiNwkBORJPgEgpUy6rvvRarUeAIQRDL3BSCm3AQwD8Ejek7wleei67nmz2TyNBjiOswBgEsC7lHJDCLHt+35YcYT0BjDG3Sqldkku+b5/ZK1dHQS4JHlCckNKuRDP0TPJ87y8UmoEwLox5iwKsNYuknwFcOA4ztogwNdnYuUrCUbLFFgYcpPJZKzb7TaMMQWSpwCu4tDEpbXWLBhjNj3PmwHwRPI4lUotDHTSWvsBIEfyUEo57bouAMQZkXPOIp1OXySTyXUAFZIXwfNgH4wxDyRPAOQBpIbU788qxrhk+LfoA1hrZwE8ReF9vBnezjnnG2POQqgA0G61WrUwxnchhEqn00mi9wOiAuvJwpS/QwAAAABJRU5ErkJggg==)](https://huggingface.co/)

</div>

Modern ve etkileşimli bir İngilizce Modal Verbs (must, can't, could, may, might) öğrenme platformu. Yapay zeka destekli dinamik sorular oluşturur ve anlık sıralama sistemi sunar. Dark Mode destekli, modern arayüzü ile İngilizce öğrenmeyi kolaylaştırır ve eğlenceli hale getirir.

## 🚀 Özellikler

- **AI Destekli Sorular**: Hugging Face kullanarak sürekli yenilenen, çeşitli zorluk seviyelerinde sorular
- **Anlık Sıralama**: Gerçek zamanlı güncellenen kullanıcı sıralaması
- **Responsive Tasarım**: Mobil ve masaüstü cihazlarda mükemmel görünüm
- **Kolay Kullanım**: Sadece kullanıcı adı ile giriş yapabilme
- **Detaylı İstatistikler**: Puan, doğruluk oranı ve grafik analizleri
- **Dark Mode**: Otomatik karanlık/aydınlık tema desteği

## 🛠 Teknolojiler

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **AI**: Hugging Face Inference API
- **Grafik**: Recharts
- **İkonlar**: Lucide React
- **Deployment**: Vercel

## 📱 Ekran Görüntüleri

<div align="center">
  <table>
    <tr>
      <td align="center"><b>Ana Sayfa</b></td>
      <td align="center"><b>Quiz Ekranı</b></td>
      <td align="center"><b>Sıralama</b></td>
    </tr>
    <tr>
      <td><img src="https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Ana+Sayfa" alt="Ana Sayfa" /></td>
      <td><img src="https://via.placeholder.com/300x200/10B981/FFFFFF?text=Quiz+Ekranı" alt="Quiz Ekranı" /></td>
      <td><img src="https://via.placeholder.com/300x200/6366F1/FFFFFF?text=Sıralama" alt="Sıralama" /></td>
    </tr>
  </table>
</div>

## 📥 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18.0 veya daha yeni
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın:**
```bash
git clone https://github.com/kullaniciadi/modal-verbs-quiz.git
cd modal-verbs-quiz
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
# veya
yarn install
```

3. **Environment variables'ları ayarlayın:**
```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin:
```env
HUGGINGFACE_API_TOKEN=your_huggingface_token_here
```

4. **Development server'ı başlatın:**
```bash
npm run dev
# veya
yarn dev
```

5. **Tarayıcıda açın:**
[http://localhost:3000](http://localhost:3000)

### 🐳 Docker ile Çalıştırma (Opsiyonel)

```bash
# Docker imajını oluşturun
docker build -t modal-verbs-quiz .

# Docker konteynerini çalıştırın
docker run -p 3000:3000 -e HUGGINGFACE_API_TOKEN=your_token modal-verbs-quiz
```

## 🌐 Vercel'e Deploy Etme

1. **GitHub'a push edin:**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Vercel'e git:**
- [Vercel.com](https://vercel.com)'a gidin
- GitHub hesabınızla giriş yapın
- "New Project" butonuna tıklayın
- Bu repository'yi seçin

3. **Environment Variables ekleyin:**
Vercel dashboard'da:
- Settings > Environment Variables'a gidin
- `HUGGINGFACE_API_TOKEN` ekleyin
- Hugging Face'den aldığınız token'ı value olarak girin

4. **Deploy edin:**
- Deploy butonuna tıklayın
- Birkaç dakika sonra siteniz hazır!

## 🔑 Hugging Face Token Alma

1. [Hugging Face](https://huggingface.co/join)'e kaydolun
2. [Settings > Access Tokens](https://huggingface.co/settings/tokens)'a gidin
3. "New token" butonuna tıklayın
4. Token'ınızı kopyalayın ve `.env.local`'e ekleyin

## 📚 Öğrenilen Modal Verbs

| Modal Verb | Kullanım | Örnek |
|------------|----------|-------|
| **MUST** | Zorunluluk, Kesin Çıkarım | You must study hard. |
| **CAN'T** | İmkansızlık, Olumsuz Çıkarım | He can't be at home. |
| **COULD** | Geçmiş Yetenek, Nezaket | I could swim when I was young. |
| **MAY** | İzin, Olasılık | May I help you? |
| **MIGHT** | Düşük Olasılık | It might rain tomorrow. |

## 🎮 Nasıl Oynanır

1. **Ana sayfadan "Quiz'e Başla"** butonuna tıklayın
2. **Kullanıcı adınızı** girin
3. **30 saniye içinde** doğru modal verb'ü seçin
4. **Açıklamayı okuyun** ve öğrenin
5. **Sıralamanızı** kontrol edin
6. **Yeni soruya** geçin

## 📊 Sıralama Sistemi

- **10 puan** doğru cevap başına
- **Doğruluk oranı** hesaplanır
- **Gerçek zamanlı** güncelleme
- **Grafik** analizleri

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**🎯 Hedef**: İngilizce modal verbs'leri eğlenceli ve etkileşimli bir şekilde öğrenmek!
