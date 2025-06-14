# Laravel 12 RESTful API - Sistem Manajemen Reimbursement Karyawan

Sistem backend RESTful API untuk manajemen reimbursement karyawan yang dibangun menggunakan Laravel 12 dengan fitur otentikasi berbasis peran, validasi limit bulanan, notifikasi email asynchronous, dan logging aktivitas.

## 🚀 Keterangan Umum

### 1. **Otentikasi & Manajemen Peran**
- Otentikasi API menggunakan Laravel Sanctum
- Sistem peran bertingkat: `admin`, `manager`, `employee`
- Token-based authentication untuk keamanan API

### 2. **Manajemen Kategori Reimbursement**
- Kategori dengan limit bulanan (Transportasi, Kesehatan, Makan)
- Validasi otomatis terhadap limit per kategori per bulan
- Fleksibilitas penambahan kategori baru

### 3. **Workflow Reimbursement**
- **Employee**: Membuat pengajuan dengan upload bukti transaksi
- **Manager**: Approve/reject pengajuan dengan alasan
- **Admin**: Akses penuh termasuk data yang sudah dihapus

### 4. **File Management**
- Upload bukti transaksi (PDF, JPG, JPEG, PNG)
- Maksimal ukuran file 2MB
- Penyimpanan aman dengan Laravel Storage

### 5. **Soft Delete**
- Data reimbursement tidak benar-benar dihapus
- Admin dapat melihat data yang sudah di-soft delete
- Kemungkinan restore data jika diperlukan

### 6. **Activity Logging**
- Pencatatan semua aktivitas (create, approve, reject)
- Audit trail untuk keperluan compliance
- Tracking perubahan status dengan timestamp

### 7. **Notifikasi Email Asynchronous**
- Email otomatis ke manager saat ada pengajuan baru
- Queue system untuk performa optimal
- Template email yang dapat dikustomisasi

## 🛠 Teknologi & Library

### Core Framework
- **Laravel 12** - PHP Framework
- **PHP 8.2+** - Programming Language
- **MySQL 8.0+** - Database

### Authentication & Security
- **Laravel Sanctum** - API Authentication
- **bcrypt** - Password Hashing
<!-- - **CSRF Protection** - Built-in Laravel Security -->

### File Storage
- **Laravel Storage** - File Management
- **Symbolic Links** - Public File Access

### Queue & Jobs
- **Laravel Queue** - Background Job Processing
- **Database Driver** - Queue Storage

### Email
- **Laravel Mail** - Email System
- **Mailtrap/SMTP** - Email Testing/Delivery

### Development Tools
- **Artisan CLI** - Laravel Command Line Interface
- **Migration & Seeder** - Database Management
- **Eloquent ORM** - Database Abstraction

## 📋 Persyaratan Sistem

- PHP >= 8.3
- Composer
- MySQL >= 8.0 atau MariaDB >= 10.3
- Git

## 🔧 Instalasi & Setup

### 1. Clone Project

```bash
git clone <repository-url> reimbursement-api
cd reimbursement-api
```

### 2. Install Dependencies
```bash
composer install
```

### 3. Install Laravel Sanctum
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\\Sanctum\\SanctumServiceProvider"
```

### 4. Setup Environment
```bash
cp .env.example .env
php artisan key:generate
```

### 5. Buat Database
```sql
CREATE DATABASE db_reimbursement CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 6. Konfigurasi Database & Email
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
DB_USERNAME=your_userbane
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

### 7. Generate APP_KEY
```bash
php artisan key:generate
```

### 7. Jalankan Migration & Seeder
```bash
php artisan migrate
php artisan db:seed
```

### 8. Buat Storage Link
```bash
php artisan storage:link
```

### 9. Set Permissions (Linux/Mac)
```bash
chmod -R 775 storage bootstrap/cache
```

## 🚀 Menjalankan Aplikasi

### 1. Start Laravel Server
```bash
php artisan serve
```
Server akan berjalan di: http://localhost:8000

### 2. Start Queue Worker (Terminal Baru)
```bash
php artisan queue:work
```

## 🗄 Struktur Database

Tabel yang ditampilkan disini hanya tabel yang berkenaan langsung dengan proses bisnis utama. Untuk struktur tabel lainnya bisa langsung dilihat di folder `database/migration`.

### Users Table
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | Primary Key |
| name | varchar(255) | Nama lengkap |
| email | varchar(255) | Email (unique) |
| email_verified_at | timestamp | Waktu verifikasi email (belum diimplementasikan)
| password | varchar(255) | Password (hashed) |
| role | enum | admin, manager, employee |
| remember_token | varchar(255) | Token (belum diimplementasikan) |
| created_at | timestamp | Waktu dibuat |
| updated_at | timestamp | Waktu diupdate |

### Categories Table
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | Primary Key |
| name | varchar(255) | Nama kategori |
| limit_per_month | decimal(10,2) | Limit bulanan |
| created_at | timestamp | Waktu dibuat |
| updated_at | timestamp | Waktu diupdate |

### Reimbursements Table
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | Primary Key |
| user_id | bigint | Foreign Key ke users |
| category_id | bigint | Foreign Key ke categories |
| title | varchar(255) | Judul pengajuan |
| description | text | Deskripsi |
| amount | decimal(10,2) | Jumlah uang |
| status | enum | pending, approved, rejected |
| receipt_path | varchar(255) | Path file bukti |
| submitted_at | timestamp | Waktu pengajuan |
| approved_at | timestamp | Waktu persetujuan |
| created_at | timestamp | Waktu dibuat |
| updated_at | timestamp | Waktu diupdate |
| deleted_at | timestamp | Soft delete |

### Activity Logs Table
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | Primary Key |
| user_id | bigint | Foreign Key ke users |
| reimbursement_id | bigint | Foreign Key ke reimbursements |
| action | varchar(255) | Jenis aksi |
| description | text | Deskripsi aktivitas |
| created_at | timestamp | Waktu dibuat |
| updated_at | timestamp | Waktu diupdate |

## 📚 API Documentation

### Postman
Dokumentasi telah disusun dengan menggunakan Postman. Klik link di bawah ini untuk melihat dokumentasi lengkap.
https://documenter.getpostman.com/view/11847155/2sB2x6nCjp

## 🔧 Troubleshooting

### Common Issues

#### 1. Token Mismatch Error
```bash
php artisan config:clear

php artisan cache:clear
```

#### 2. Route Error / Not Found
```bash
php artisan cache:clear

php artisan route:cache
```

#### 3. Storage Permission Error
```bash
chmod -R 775 storage bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache
```

#### 4. Queue Not Processing
```bash
php artisan queue:restart

php artisan queue:work --verbose
```

#### 5. Email Not Sending
- Periksa konfigurasi MAIL di .env
- Cek kembali kredensial SMTP
- Pastikan queue worker berjalan

#### 6. File Upload Error
- Pastikan folder storage/app/public sudah ada
- Jalankan perintah: `php artisan storage:link`
- Periksa kembali file dan folder permission

### Debug Commands
```bash
# Check routes
php artisan route:list

# Check config
php artisan config:show

# Check queue status
php artisan queue:monitor

# Check logs
tail -f storage/logs/laravel.log
```

## 📝 Development Notes

### Adding New Features
1. Buat migration baru: `php artisan make:migration`
2. Buat model baru: `php artisan make:model`
3. Buat controller baru: `php artisan make:controller`
4. Membuat route baru di `routes/api.php`
5. Lakukan testing pada endpoint

### Code Standards
- Mengikuti standar kode PSR-12
- Menggunakan nama variabel yang sesuai dengan konteks
- Menambahkan komentar pada kode yang dibuat
- Input telah dipastikan divalidasi terlebih dahulu
- Exception sudah dikontrol dengan baik

## 🤝 Contributing

1. Fork repository
2. Buat fitur branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push ke branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

Projek ini terlisensi dibawah MIT License.

## 📞 Support

Untuk pertanyaan atau bantuan:
- Email: iamcupsky@gmail.com
- Issues: [GitHub Issues]

---

**Happy Coding! 🚀**