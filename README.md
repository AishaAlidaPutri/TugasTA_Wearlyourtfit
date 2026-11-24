# ✨ wearlyourfit – Outfit Planner & Digital Wardrobe

> **Tagline:** *Your wardrobe, planned beautifully.*

**wearlyourfit** adalah aplikasi mobile digital wardrobe modern yang membantu pengguna mengelola koleksi pakaian, membuat kombinasi outfit (mix and match), serta merencanakan pakaian berdasarkan kalender tanggal dan acara tertentu.

---

## 📱 Tech Stack

### Frontend
- **Framework:** React Native dengan **Expo SDK 58** (React Native 0.88.1 & React 19)
- **Bahasa:** JavaScript (ES6+), bukan TypeScript
- **Navigasi:** React Navigation (Bottom Tab Navigation & Native Stack Navigator) dengan **Direct Access (Tanpa Wajib Login)**
- **Image Picker:** `expo-image-picker` (memilih foto pakaian langsung dari galeri smartphone)
- **Styling:** Custom Design System bernuansa modern, minimalis, feminin, dan elegan (*soft cream, warm beige, muted pink, and dark espresso brown*).

### Backend
- **Runtime & Framework:** Node.js & Express.js (JavaScript ES6+)
- **Database:** PostgreSQL (Dioptimalkan untuk Neon Serverless PostgreSQL & Mock SQLite/JSON Fallback)
- **Akses Pengguna:** Direct Access Mode (Auto Guest User) â€“ seluruh fitur dapat langsung digunakan tanpa kewajiban autentikasi / login
- **Media Storage:** Cloudinary untuk upload foto pakaian secara online melalui REST API backend (dengan Data URI offline fallback)
- **Upload Parser:** Multer (memory stream buffer)
- **CORS & Environment:** `cors` & `dotenv`

---

## 🗂️ Struktur Proyek

```text
wearlyourfit/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # Koneksi PostgreSQL (Neon) & fallback engine
│   │   │   ├── schema.sql         # Skrip pembuatan tabel DDL PostgreSQL
│   │   │   └── migrate.js         # Skrip runner migrasi database
│   │   ├── controllers/
│   │   │   ├── authController.js      # Register, Login, Me
│   │   │   ├── wardrobeController.js  # CRUD pakaian & upload foto
│   │   │   ├── outfitController.js    # CRUD outfit & mix and match
│   │   │   ├── scheduleController.js  # CRUD jadwal planner
│   │   │   └── userController.js      # Profil & ringkasan dashboard home
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification & multi-user guard
│   │   │   ├── upload.js          # Multer memory storage
│   │   │   └── errorHandler.js    # Centralized error handler
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── wardrobeRoutes.js
│   │   │   ├── outfitRoutes.js
│   │   │   ├── scheduleRoutes.js
│   │   │   └── userRoutes.js
│   │   └── services/
│   │       └── cloudinaryService.js # Upload & destroy foto di Cloudinary
│   ├── tests/
│   │   └── api.test.js            # Automated backend API test suite
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── assets/                # App icon & grafis
│   │   ├── components/            # Reusable UI (CustomButton, Input, Header, Cards, Calendar)
│   │   ├── constants/             # Theme, Colors, Spacing, Typography
│   │   ├── context/               # AuthContext (login, register, logout, session)
│   │   ├── navigation/            # BottomTabNavigator & RootNavigator
│   │   ├── screens/
│   │   │   ├── auth/              # LoginScreen, RegisterScreen
│   │   │   ├── home/              # HomeScreen (Greeting, Today's Outfit, Counters)
│   │   │   ├── wardrobe/          # WardrobeScreen, AddWardrobe, Detail, Edit
│   │   │   ├── outfits/           # OutfitStudioScreen, SavedOutfits, Detail
│   │   │   ├── planner/           # PlannerScreen (Monthly Calendar), ScheduleOutfit
│   │   │   └── profile/           # ProfileScreen, About wearlyourfit, Logout
│   │   ├── services/              # API client (fetch) & SecureStore wrapper
│   │   └── utils/                 # Helpers (date formatter, categories, color list)
│   ├── App.js
│   ├── app.json
│   ├── index.js
│   └── package.json
│
└── README.md
```

---

## 🗄️ Database Design (PostgreSQL / Neon)

Skema database terdiri dari 5 tabel terelasi:

1. **`users`**
   - `id SERIAL PRIMARY KEY`
   - `name VARCHAR(255) NOT NULL`
   - `email VARCHAR(255) UNIQUE NOT NULL`
   - `password VARCHAR(255) NOT NULL` (Bcrypt hashed)
   - `profile_image TEXT`
   - `created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`

2. **`wardrobe_items`**
   - `id SERIAL PRIMARY KEY`
   - `user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE`
   - `name VARCHAR(255) NOT NULL`
   - `category VARCHAR(100) NOT NULL` (*Tops, Bottoms, Outerwear, Shoes, Accessories*)
   - `color VARCHAR(100) NOT NULL`
   - `image_url TEXT NOT NULL`
   - `cloudinary_public_id VARCHAR(255)`
   - `description TEXT`
   - `created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`

3. **`outfits`**
   - `id SERIAL PRIMARY KEY`
   - `user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE`
   - `name VARCHAR(255) NOT NULL`
   - `occasion VARCHAR(100) NOT NULL` (*Casual, Campus, Work, Party, Formal, dll.*)
   - `description TEXT`
   - `created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`

4. **`outfit_items`**
   - `id SERIAL PRIMARY KEY`
   - `outfit_id INTEGER NOT NULL REFERENCES outfits(id) ON DELETE CASCADE`
   - `wardrobe_item_id INTEGER NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE`

5. **`outfit_schedules`**
   - `id SERIAL PRIMARY KEY`
   - `user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE`
   - `outfit_id INTEGER NOT NULL REFERENCES outfits(id) ON DELETE CASCADE`
   - `event_name VARCHAR(255) NOT NULL`
   - `schedule_date DATE NOT NULL`
   - `notes TEXT`
   - `created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`

---

## 🚀 Panduan Instalasi & Menjalankan

### 1. Menyiapkan Backend

Buka terminal dan masuk ke folder `backend`:
```bash
cd backend
npm install
```

Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Isi konfigurasi di file `.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=wealy_super_jwt_secret_key_2026
JWT_EXPIRES_IN=7d

# Neon PostgreSQL Connection String
DATABASE_URL=postgresql://username:password@ep-sample.region.aws.neon.tech/neondb?sslmode=require

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=wealy_wardrobe
```

Jalankan migrasi database ke Neon:
```bash
npm run migrate
```

Jalankan server backend:
```bash
npm start
# atau dengan auto-reload:
npm run dev
```
Server akan berjalan di: `http://localhost:5000`.

---

### 2. Menyiapkan Frontend (Expo & React Native)

Buka terminal baru dan masuk ke folder `frontend`:
```bash
cd frontend
npm install
```

Jalankan aplikasi Expo:
```bash
# Menjalankan Expo CLI
npm start

# Opsi langsung membuka di browser / emulator:
npm run web      # Menjalankan di browser web
npm run android  # Menjalankan di emulator / HP Android
npm run ios      # Menjalankan di simulator iOS (macOS)
```

> **Catatan Pengujian di HP Fisik:**  
> Jika menggunakan aplikasi **Expo Go** pada perangkat fisik (smartphone), buka file `frontend/src/services/api.js` dan sesuaikan `API_BASE_URL` dengan IP lokal laptop/komputer Anda (misal `http://192.168.1.50:5000`).

---

## 📡 Daftar Endpoint REST API

> **Catatan Autentikasi:**  
> Aplikasi ini menggunakan alur **Direct Access / Tanpa Wajib Login**. Seluruh fitur utama (Wardrobe, Outfits, Planner, Summary) dapat diakses langsung tanpa perlu login. Jika header `Authorization: Bearer <token>` tidak disertakan, backend secara otomatis menetapkan sesi pengguna bawaan (*Default Guest User*).

### 1. Wardrobe (`/api/wardrobe`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/wardrobe` | Mengambil seluruh pakaian milik pengguna (query: `category`, `search`) |
| `GET` | `/api/wardrobe/:id` | Mengambil detail 1 item pakaian |
| `POST` | `/api/wardrobe` | Menambahkan pakaian baru (multipart/form-data: `image`, `name`, `category`, `color`, `description`) |
| `PUT` | `/api/wardrobe/:id` | Memperbarui info/foto pakaian (otomatis menghapus foto lama di Cloudinary) |
| `DELETE` | `/api/wardrobe/:id` | Menghapus pakaian dan foto terkait di Cloudinary |

### 2. Outfits (`/api/outfits`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/outfits` | Mengambil daftar seluruh outfit tersimpan (query: `occasion`, `search`) |
| `GET` | `/api/outfits/:id` | Mengambil detail outfit beserta seluruh item pakaian di dalamnya |
| `POST` | `/api/outfits` | Membuat kombinasi outfit (`name`, `occasion`, `description`, `item_ids`) |
| `PUT` | `/api/outfits/:id` | Memperbarui kombinasi outfit |
| `DELETE` | `/api/outfits/:id` | Menghapus kombinasi outfit |
| `POST` | `/api/outfits/:id/items` | Menambahkan 1 item ke dalam outfit |
| `DELETE` | `/api/outfits/:id/items/:itemId` | Menghapus 1 item dari outfit |

### 3. Schedules / Planner (`/api/schedules`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/schedules` | Mengambil daftar jadwal outfit (query: `date`, `month`) |
| `GET` | `/api/schedules/:id` | Mengambil detail jadwal outfit |
| `POST` | `/api/schedules` | Menambahkan jadwal outfit (`outfit_id`, `event_name`, `schedule_date`, `notes`) |
| `PUT` | `/api/schedules/:id` | Memperbarui jadwal outfit |
| `DELETE` | `/api/schedules/:id` | Menghapus jadwal outfit |

### 4. Profile & Home Summary
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/home/summary` | Dashboard summary (Today's Outfit, Upcoming Outfit, Wardrobe count, Outfits count) |
| `GET` | `/api/users/me` | Mengambil profil pengguna |
| `PUT` | `/api/users/me` | Memperbarui nama dan foto profil |

---

## 🎨 Desain & UI/UX

Aplikasi dirancang dengan estetika feminin, modern, dan elegan:
- **Soft Cream & Warm Beige:** Warna dasar latar belakang dan kartu untuk nuansa hangat dan bersih.
- **Muted Pink & Rose Gold:** Warna primer aksen yang manis dan berkelas.
- **Dark Espresso Brown:** Warna tipografi utama yang lembut di mata namun memiliki kontras yang jelas.
- **Visual-First Layout:** Foto pakaian menjadi fokus utama dengan kartu bersudut melengkung (*rounded corners*) dan bayangan halus (*subtle shadows*).
