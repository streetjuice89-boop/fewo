# VoyageNest - Ferienwohnungs-Plattform

Eine professionelle Ferienwohnungs-Vermietungsplattform mit Laravel Backend und React Frontend.

## 🏗️ Tech Stack

| Komponente | Technologie |
|------------|-------------|
| Backend | Laravel 12, PHP 8.3 |
| Frontend | React 18, Vite, TailwindCSS |
| Datenbank | MySQL 8 |
| Cache | Redis |
| Auth | Laravel Sanctum |

## 📁 Projektstruktur

```
fewo/
├── backend/           # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   └── Services/
│   ├── database/migrations/
│   └── routes/api.php
├── frontend/
│   ├── web/           # Kunden-Website (React + Vite)
│   └── admin/         # Admin Panel (React + Vite)
├── docker-compose.yml
└── README.md
```

## 🚀 Installation

### Voraussetzungen

- PHP 8.3 mit Extensions (xml, dom, mbstring, mysql)
- MySQL 8
- Node.js 20+
- Composer

### 1. PHP Extensions installieren (Linux)

```bash
sudo apt-get install php8.3-xml php8.3-dom php8.3-mbstring php8.3-mysql php8.3-curl
```

### 2. Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Konfiguriere `.env`:
```
DB_CONNECTION=mysql
DB_DATABASE=voyagenest
DB_USERNAME=root
DB_PASSWORD=
```

Datenbank erstellen:
```bash
mysql -u root -e "CREATE DATABASE voyagenest;"
php artisan migrate
php artisan db:seed
```

### 3. Frontend Setup

```bash
# Web Frontend
cd frontend/web
npm install

# Admin Panel
cd ../admin
npm install
```

### 4. Server starten

```bash
# Terminal 1: Backend
cd backend && php artisan serve --port=7000

# Terminal 2: Web Frontend
cd frontend/web && npm run dev

# Terminal 3: Admin Panel
cd frontend/admin && npm run dev -- --port 5174
```

## 🐳 Docker

```bash
docker-compose up -d
```

Services:
- API: http://localhost:7000
- Web: http://localhost:3000
- Admin: http://localhost:3001
- MySQL: localhost:3306
- Redis: localhost:6379

## 🔐 Admin Login

- **Username:** `beetlejuice`
- **Passwort:** `Makatussin911#`

## 📡 API Endpoints

### Public
```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/properties
GET    /api/properties/{id}
GET    /api/properties/featured
GET    /api/countries
```

### Authenticated
```
GET    /api/auth/profile
GET    /api/bookings
POST   /api/bookings
GET    /api/chat/sessions
POST   /api/chat/sessions/{id}/messages
```

### Admin Only
```
GET    /api/admin/dashboard/stats
POST   /api/admin/properties
PUT    /api/admin/properties/{id}
GET    /api/admin/users
PATCH  /api/admin/bookings/{id}/status
GET    /api/admin/airbnb
POST   /api/admin/airbnb/grab
GET    /api/admin/logs
```

## 🎨 Features

### Kunden-Website
- Unterkunfts-Suche mit Filtern
- Detailseiten mit Bildergalerie
- Buchungsprozess
- Kundenkonto mit Buchungsübersicht
- Live-Chat Support

### Admin Panel
- Dashboard mit KPIs und Charts
- Unterkünfte verwalten (CRUD)
- Buchungen bearbeiten
- Kundenverwaltung mit Score
- Live-Chat Monitoring
- Airbnb-Inserate Grabber
- System Logs

## 📝 Lizenz

Proprietär - Alle Rechte vorbehalten.
