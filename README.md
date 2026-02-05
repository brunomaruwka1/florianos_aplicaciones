# Florianos Aplicaciones

Florianos Aplicaciones to aplikacja webowa oraz mobilna (Android) zbudowana przy użyciu SvelteKit (JavaScript).  
Backend aplikacji oparty jest o Supabase (baza danych + autoryzacja).

Projekt nie zawiera żadnych publicznych kluczy API ani gotowej bazy danych.  
Użytkownik samodzielnie tworzy bazę danych w Supabase na podstawie pliku `db.sql`.

Wersja mobilna została przygotowana z użyciem Capacitor i może być uruchamiana w Android Studio.

---

## Wymagania

- Node.js (zalecana wersja LTS)
- npm lub pnpm
- Git
- Konto w Supabase
- Android Studio (dla wersji mobilnej)
- Android SDK
- Java JDK (zalecane JDK 17)

---

## Instalacja projektu

Sklonuj repozytorium:

```bash
git clone https://github.com/brunomaruwka1/florianos_aplicaciones.git
```
Przejdź do katalogu projektu:

```bash
cd florianos_aplicaciones
```

Zainstaluj zależności:
```bash
npm install
```

## Konfiguracja bazy danych (Supabase)

Projekt korzysta z Supabase, ale nie zawiera gotowej bazy danych ani kluczy API.
Struktura bazy danych znajduje się w pliku: db.sql

Tworzenie projektu Supabase:

* Zaloguj się na https://supabase.com
* Utwórz nowy projekt
* W panelu Supabase przejdź do SQL Editor
* Otwórz plik db.sql i skopiuj całą jego zawartość
* Wklej kod SQL do SQL Editor i uruchom zapytanie

Po wykonaniu skryptu baza danych będzie w pełni gotowa do użycia (tabele, relacje, polityki RLS).

## Konfiguracja zmiennych środowiskowych

Po utworzeniu projektu Supabase:

Przejdź do Project Settings → API

Skopiuj:

Project URL

anon public key

W głównym katalogu projektu utwórz plik .env:

PUBLIC_SUPABASE_URL=twoj_supabase_url
PUBLIC_SUPABASE_ANON_KEY=twoj_anon_public_key


Uwaga:

Prefiks PUBLIC_ jest wymagany w SvelteKit

Plik .env nie powinien być commitowany do repozytorium

Dla wygody dostępny jest plik .env.example

Uruchomienie aplikacji (wersja webowa)

Aby uruchomić aplikację lokalnie:

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem:

```bash
http://localhost:5173
```
Wersja mobilna (Android – Capacitor)
Instalacja Capacitor

Jeśli Capacitor nie jest jeszcze zainstalowany:
```bash
npm install @capacitor/core @capacitor/cli
```
Dodanie platformy Android
```bash
npx cap add android
```
Build i synchronizacja z Androidem

Za każdym razem, gdy zmieniasz kod aplikacji webowej, wykonaj:
```bash
npm run build
npx cap sync android
```
Uruchomienie aplikacji w Android Studio

* Otwórz Android Studio

* Poczekaj na zakończenie synchronizacji Gradle

* Uruchom aplikację na emulatorze lub fizycznym urządzeniu
