# 🧾 Sistem Manajemen Reimbursement Karyawan

Dokumentasi ini menjelaskan arsitektur, desain, fitur utama, dan panduan instalasi untuk proyek **Sistem Manajemen Reimbursement** berbasis **Laravel 12.1 (Backend)** dan **Next.js (Frontend)**.

---

## 📁 Struktur Proyek

```
.
├── backend/    # Laravel API untuk manajemen reimbursement
├── frontend/   # Next.js untuk antarmuka pengguna
└── README.md   # Dokumentasi proyek
```

---

## ✨ Fitur

- ✅ Login dan autentikasi berbasis token (Sanctum)
- 🧾 Pengajuan reimbursement berdasarkan kategori dan limit bulanan
- 🔎 Riwayat reimbursement per user
- 🧮 Validasi otomatis agar tidak melebihi limit kategori
- 📬 Notifikasi email ke manajer secara asynchronous
- 👤 Manajemen role: Employee & Manager
- 📁 Upload bukti pengeluaran
- 📊 Dashboard pengajuan dan status
- ⚙️ Admin seeding otomatis: user & kategori

---

## 📌 API Endpoint

Dokumentasi lengkap endpoint API tersedia di Postman:
👉 [https://documenter.getpostman.com/view/11847155/2sB2x6nCjp](https://documenter.getpostman.com/view/11847155/2sB2x6nCjp)

---

## 🏗️ Arsitektur Solusi

### 🔄 Diagram Alur Data

```
+-------------+       +------------------+       +-------------------+       +-----------------+
|             |------>|   Laravel API    |------>|   Laravel Queue   |------>|   Mail Server   |
|  Next.js    |       |   (Backend)      |       | (Background Job)  |       | (SMTP/Mailtrap) |
| (Frontend)  |<------|                  |<------|                   |       +-----------------+
|             |       +--------+---------+       +-------------------+
+-------------+                |
                               |
                               v
                        +-------+--------+
                        |   Database     |
                        |   (MySQL)      |
                        +----------------+
```

## 🧠 Penjelasan Desain

Bagian ini merinci alasan di balik pemilihan teknologi dan pendekatan desain, dengan penekanan pada bagaimana validasi limit pengajuan bulanan diintegrasikan ke dalam sistem.

### a. 🔢 Integrasi Perhitungan Remunerasi (Validasi Limit Bulanan)

Sistem ini mengimplementasikan **validasi otomatis** terhadap jumlah reimbursement yang dapat diajukan oleh karyawan berdasarkan kategori dan batas bulanan.

#### 📐 Alur Logika Validasi:

1. **Menerima Data**  
   Menerima request dari user dengan `user_id`, `category_id`, dan `amount`.

2. **Ambil Limit Kategori**  
   Ambil nilai `limit_per_month` dari tabel `categories` sesuai `category_id`.

3. **Hitung Total Pengajuan Terdahulu**  
   Query ke `reimbursements` untuk menjumlahkan (`SUM`) semua `amount`:
   - Dengan `status = approved`
   - Pada kategori yang sama
   - Dalam bulan dan tahun yang sama

4. **Validasi**  
   Bandingkan:
   ```
   (Total Disetujui Bulan Ini + Jumlah Baru) <= Limit Bulanan
   ```

5. **Respon**  
   - ✅ **Valid**: Data disimpan
   - ❌ **Tidak Valid**: Sistem mengembalikan error `422` dengan pesan seperti:  
     `"Monthly limit exceeded for this category."`

Pendekatan ini memastikan logika bisnis tetap **konsisten**, **terpusat**, dan **terjamin** di backend sebelum terjadi perubahan data di database.

---

### b. 🧱 Pemilihan Teknologi

- **Laravel 12**  
  Dipilih karena kestabilannya, ekosistem yang lengkap, dan integrasi native terhadap fitur-fitur penting seperti Queue, Auth, dan Validasi.

- **MySQL**  
  Digunakan karena keandalannya, kesederhanaannya, skalabilitasnya, dan integrasi penuh dengan Laravel Eloquent ORM.

---

### c. 🔐 Desain Otentikasi

- **Laravel Sanctum**  
  Dipilih ukarena ringan dan efisien, tanpa memerlukan server OAuth2.  
  Memberikan keamanan berbasis token dan cocok untuk aplikasi Next.js sebagai frontend.

---

## ⚙️ Instalasi dan Setup

### 🔧 Persyaratan Umum

- PHP >= 8.3  
- Composer  
- MySQL >= 8.0
- Node.js >= 18  
- Git

### 🚀 Backend (`/backend`)
```bash
git clone https://github.com/yusufwdn/reimverse.git
```

Setelah projek di-clone, pastikan masuk ke direktori projek tersebut.
```bash
cd reimverse
```

Masuk ke folder backend, lalu instal dependensi bawaan Laravel dengan Composer.
```bash
cd backend

composer install
```

Instal juga `laravel/sanctum` dengan perintah berikut (jika belum).
```bash
composer require laravel/sanctum

php artisan vendor:publish --provider="Laravel\\Sanctum\\SanctumServiceProvider"
```

Buat database di MySQL dengan nama `db_reimbursement` atau bisa langsung dilakukan dengan menyalin dan menjalankan perintah berikut.
```sql
CREATE DATABASE db_reimbursement;
```

Copy file `env.example` menjadi file `.env`.
```bash
cp .env.example .env
```

Edit file `.env`:
```env
APP_NAME="Reimbursement API"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_reimbursement
DB_USERNAME=your_username
DB_PASSWORD=your_password

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@example.com"
MAIL_FROM_NAME="\${APP_NAME}"

QUEUE_CONNECTION=database
```

Jalankan perintah `key:generate` untuk menggenerate key untuk aplikasi ini.
```bash
php artisan key:generate
```

Jalankan comand untuk seeder dan storage
```bash
php artisan migrate --seed

php artisan storage:link
```

Jalankan perintah ini berbarengan di dua terminal berbeda
```
php artisan serve        # Terminal 1

php artisan queue:work   # Terminal 2
```

### 💻 Frontend (`/frontend`)
Masuk ke folder frontend, atau bisa dengan perintah ini (jika dari folder backend).
```bash
cd ../frontend
```

Jalankan perintah ini untuk menginstall seluruh dependensi yang dibutuhkan oleh Next.js.
```bash
npm install
```

Copy file `.env.local.example` menjadi file `.env.local.example`.
```bash
cp .env.local.example .env.local.example
```

Setelah itu, jalankan frontend dengan perintah
```bash
npm run dev
```

Akses: [http://localhost:3000](http://localhost:3000)

---

## 🚧 Tantangan & Solusi

### 1. API Lambat karena Kirim Email
Jika mengirimkan email langsung ke manager dalam setiap request API, itu akan membuatnya menjadi terasa berat.

**Solusi**: Menggunakan fitur Laravel Queue (`ShouldQueue`) untuk kirim email di background.

### 2. Format Error Tidak Konsisten
Sejatinya Laravel dibuat untuk kebutuhan web, jadi berbagai konfigurasi defaultnya dirancang untuk web. Salah satu contohnya adalah cara Laravel meng-handle error (error exception). Ini mengharuskan developer untuk mendefinisikan errornya sendiri di file `bootstrap/app.php`.

**Solusi**: Custom `renderable()` agar semua respons error JSON seragam. Contoh implementasinya:
```php
$exceptions->render(function (RouteNotFoundException $e, Request $request) {
    if ($request->is('api/*')) {
        return response()->json([
            'message' => $e->getMessage() ?? 'Route not found.'
        ], 404);
    }
});
```

### 3. Baru Belajar Menggunakan Next.js 
Saya memilih Next.js untuk frontend-nya karena saya juga kebetulan sedang mempelajari Next.js. Banyak konsep-konsep yang belum terlalu dikuasai. Terlebih lagi soal layouting dan design, saya belum terlalu handal di bidan tersebut.

**Solusi**:
Mempelajari dokumentasi dan mencari referensi untuk memahami konsep yang ada di dalam Next.js.
