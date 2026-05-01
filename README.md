# AnimeStream

AnimeStream adalah aplikasi web full-stack untuk streaming anime dengan arsitektur modular dan dukungan multi-server (Iframe & HLS).

## Fitur Utama

- 🏠 **Home Page**: Menampilkan anime Populer & Terbaru.
- 🔍 **Search Page**: Pencarian real-time dengan filter status.
- 📖 **Detail Anime**: Informasi lengkap anime beserta daftar episode.
- 📺 **Video Player**: Mendukung pemutaran dari server Iframe (embed) maupun HLS (`.m3u8`) menggunakan `video.js` + `hls.js`.
- 🔄 **Auto Server Switch**: Jika server utama gagal dimuat, player otomatis beralih ke server cadangan.
- 💾 **Watch Progress**: Menyimpan durasi tontonan terakhir di `localStorage`.
- 🌗 **UI Modern**: Dark theme responsif dengan Next.js App Router dan Tailwind CSS.

## Teknologi

- **Frontend**: Next.js 14, React, Tailwind CSS, Zustand, video.js, hls.js, Axios.
- **Backend**: Node.js, Express, MongoDB, Mongoose.

## Cara Menjalankan Project

Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) dan [MongoDB](https://www.mongodb.com/try/download/community).

### 1. Setup Backend
1. Buka terminal dan masuk ke folder `backend`:
   ```bash
   cd backend
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Seed database dengan data contoh (Anime & Episode dummy):
   ```bash
   npm run seed
   ```
4. Jalankan server backend (secara default berjalan di `http://localhost:5000`):
   ```bash
   npm run dev
   ```

### 2. Setup Frontend
1. Buka terminal baru dan masuk ke folder `frontend`:
   ```bash
   cd frontend
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan server frontend (secara default berjalan di `http://localhost:3000`):
   ```bash
   npm run dev
   ```

Aplikasi web sekarang bisa diakses di [http://localhost:3000](http://localhost:3000).

## Arsitektur Modular Source Adapter
Backend mendukung penambahan provider video baru tanpa mengubah kode frontend.
Anda bisa menambahkan file adapter baru di `backend/src/adapters/` dengan meng-extend `BaseAdapter`.
Saat ini terdapat dua adapter bawaan:
- `IframeAdapter`: Menangani URL embed eksternal.
- `HLSAdapter`: Menangani streaming berkas `.m3u8` dengan resolusi dinamis.
