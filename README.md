# TaskFlow — Kanban Proje Yönetim Tahtası

Trello benzeri, sürükle-bırak destekli görev yönetim uygulaması.

## Canlı Demo

https://taskflow-dusky-beta.vercel.app

## Özellikler

- Email/şifre ile kayıt ve giriş
- Board oluşturma, düzenleme ve silme
- Sütun ekleme, yeniden adlandırma ve silme
- Kart ekleme, başlık/açıklama düzenleme ve silme
- Sürükle-bırak ile kartları sütunlar arasında taşıma
- Sütunları sürükle-bırak ile yeniden sıralama
- Sıralama sayfa yenilemesinde korunur
- Mobil uyumlu tasarım ve dokunmatik sürükle-bırak desteği
- Her kullanıcı sadece kendi board'larını görür (Row Level Security)

## Teknoloji Seçimleri

**React + Vite** — Hızlı geliştirme ortamı, minimal yapılandırma

**dnd-kit** — Modern, aktif geliştirilen sürükle-bırak kütüphanesi. react-beautiful-dnd artık bakım görmüyor, dnd-kit TypeScript desteği ve accessibility özellikleriyle daha sağlam bir seçim.

**Zustand** — Basit ve performanslı state yönetimi

**Supabase** — PostgreSQL tabanlı backend-as-a-service. Auth, veritabanı ve REST API tek pakette. Row Level Security ile kullanıcı verisi izolasyonu sağlanıyor.

**Vercel** — Otomatik GitHub entegrasyonu ile deploy

## Veri Modeli

boards: id, user_id, title, created_at
columns: id, board_id, title, position (float), created_at
cards: id, board_id, column_id, title, description, position (float), created_at

Her kart ve sütun float tipinde bir position değeri taşır. İki öğe arasına yeni bir öğe eklenirken (prev + next) / 2 hesaplanır. Tüm listeyi yeniden sıralamak yerine sadece taşınan öğenin position değeri güncellenir. Değerler çok yaklaştığında otomatik normalize edilir.

## Yerel Kurulum

git clone https://github.com/dolunayozbilgin/taskflow.git
cd taskflow
npm install

.env dosyası oluştur:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

npm run dev

## Mobil ve Dokunmatik Ekran

Sürükle-bırak hem mouse hem de dokunmatik ekran için desteklenir. Dokunmatik ekranlarda (telefon, tablet) kart üzerine uzun basarak sürükleme başlatılır ve daha akıcı çalışır. Laptop touchpad ile sürükleme tarayıcının kendi davranışı nedeniyle beklendiği gibi çalışmayabilir — en iyi deneyim için gerçek bir dokunmatik ekran veya harici mouse kullanılması önerilir.
