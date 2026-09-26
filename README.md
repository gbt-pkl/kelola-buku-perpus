# Kelola Buku Perpustakaan

Aplikasi manajemen buku perpustakaan SMA (katalog buku + peminjaman kelas/siswa)
dengan autentikasi admin berbasis Supabase Auth.

## Teknologi

- SvelteKit 2 (Svelte 5, runes) + TypeScript
- Tailwind CSS 4
- Supabase (PostgreSQL, Auth, Row Level Security)

## Menjalankan

```sh
pnpm install
cp .env.example .env   # isi kredensial Supabase
pnpm dev
```

Variabel environment (lihat `.env.example`):

| Variabel                    | Keterangan                                                    |
| --------------------------- | ------------------------------------------------------------- |
| `PUBLIC_SUPABASE_URL`       | URL endpoint Supabase                                         |
| `PUBLIC_SUPABASE_ANON_KEY`  | Kunci anon (dipakai client server-side untuk verifikasi sesi) |
| `SUPABASE_SERVICE_ROLE_KEY` | Kunci service role, hanya dipakai di server                   |

## Akun Admin

Tidak ada halaman registrasi publik, dan halaman **Dashboard → Pengguna** hanya bisa
dibuka admin yang sudah login. Akun admin pertama dibuat di Supabase Dashboard →
Authentication → Users → **Add user** (centang **Auto Confirm User**), lalu daftarkan
role-nya di SQL Editor:

```sql
insert into public.profiles (id, email, role)
select id, email, 'admin' from auth.users
where email = 'admin@perpus.lemper'
on conflict (id) do update set role = 'admin';
```

Setelah admin pertama ada, semua akun berikutnya cukup dibuat dari
**Dashboard → Pengguna**.

## Autentikasi & Otorisasi

| Lokasi                       | Peran                                                          |
| ---------------------------- | -------------------------------------------------------------- |
| `src/hooks.server.ts`        | Verifikasi sesi dari cookie untuk setiap request + route guard |
| `src/lib/server/supabase.ts` | Client per-request (`@supabase/ssr`) dan service-role client   |
| `src/lib/server/users.ts`    | Pembuatan/pembaruan/penghapusan akun dari dashboard            |
| `src/routes/login`           | Halaman masuk admin                                            |
| `src/routes/admin`           | Dashboard, manajemen pengguna, aksi logout                     |

Aturan akses:

- `/admin/*` tanpa sesi → `303` ke `/login?redirectTo=...`
- `/admin/*` dengan role selain `admin` → `403 Unauthorized Access`
- Admin yang membuka `/login` → `303` ke `/admin/dashboard`
- Sesi disimpan di cookie `HttpOnly` (+ `Secure` di production, `SameSite=Lax`),
  tidak ada token di `localStorage`
- Tidak ada route `/register`; akun hanya dibuat dari dashboard admin

Logout memakai form action `?/logout` yang hapus cookie sesi lalu mengarah ke
`/login`. Karena SvelteKit hanya mengizinkan action di `+page.server.ts`, action
tersebut berada di `src/routes/admin/dashboard/+page.server.ts` dan dipanggil dari
layout admin.

## Perintah

```sh
pnpm dev      # server pengembangan
pnpm build    # build produksi
pnpm preview  # pratinjau build
pnpm check    # svelte-check (TypeScript)
pnpm lint     # prettier + eslint
pnpm format   # rapikan format
```
