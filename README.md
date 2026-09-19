# United Holidays — Website + Admin CMS

A simple content-managed version of your United Holidays website. The public
site looks and behaves exactly like your original `index.html` — same
design, layout, colours, fonts, animations and navigation — but its content
now comes from a small SQLite database that you edit through a password
protected `/admin` dashboard.

## What's inside

```
united-holidays-cms/
├── server.js              Express app entry point
├── package.json
├── .env.example            copy to .env and fill in
├── db/
│   ├── schema.sql          table definitions
│   ├── seed.js              default content (your original site's copy)
│   └── database.js          opens/creates data/united_holidays.db
├── middleware/auth.js       session auth guard
├── routes/
│   ├── auth.js              /admin/login, /admin/logout
│   ├── publicApi.js         GET /api/content (public, read-only)
│   └── adminApi.js          all CRUD endpoints, protected
├── admin/
│   ├── login.html
│   ├── dashboard.html
│   └── assets/               admin.css, dashboard.js
├── public/
│   ├── index.html            your original site, now data-driven
│   ├── assets/logo.png
│   └── js/site.js            fetches /api/content and fills the page
└── data/                     united_holidays.db is created here on first run
```

## 1. Install & configure

```bash
npm install
cp .env.example .env
```

Open `.env` and set:

- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — used **once**, the first time the
  server starts, to create your admin login (it's hashed before being
  stored — change the password from the dashboard afterwards if you like).
- `SESSION_SECRET` — any long random string. Generate one with:
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `COOKIE_SECURE` — leave `false` for local testing; set to `true` once
  you deploy behind HTTPS.

## 2. Run it

```bash
npm start
```

- Website: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin

The first time the server starts it will create `data/united_holidays.db`,
seed it with your site's original content, and create your admin account.
After that, everything you edit in the dashboard is saved to that file —
back it up like you would any important document.

## 3. Using the admin dashboard

Log in at `/admin` and use the sidebar to edit:

- **Homepage** — hero heading/description/background/buttons, and the
  scrolling marquee strip.
- **Destinations** — add, edit, delete, enable/disable. The "Show in
  Popular Destinations" checkbox controls whether a destination also
  appears on the homepage; every active destination appears on the full
  Destinations page.
- **Visa Services**, **Testimonials**, **FAQs** — standard add/edit/
  delete/enable-disable lists.
- **About** — the About page text, checklist, and the "Our Numbers" stats.
- **Contact** — office hours. Phone/WhatsApp/email/address live under
  **Site Settings** since they're reused across the whole site (header,
  footer, hero buttons, contact page, floating WhatsApp button, etc.) —
  edit them once there and they update everywhere.
- **Footer** — the footer's about text and copyright line.
- **Site Settings** — also has a Change Password form for your own login.

Changes save immediately and appear on the public site on next page load
(no rebuild step).

## A couple of simplifications, so you know what to expect

- The FAQs are a single shared list — the same set appears on both the
  homepage and the Contact page (your original site had two overlapping
  but slightly different FAQ lists there; this CMS treats it as one list
  with all of those questions merged in, so you only maintain it once).
- The "Why Choose Us" feature cards and trust badges on the About page,
  and the footer's Quick Links / Destinations / Services link columns,
  are still static (not database-driven) — they rarely change and this
  keeps the system simple, per your instructions.
- New York and Dubai only had short "popular destinations" cards on your
  original homepage (no full detail page). They now have full destination
  records like the others, with reasonable starter copy you should review
  and edit.

## Deploying to Render

Render runs your Node server continuously and supports a persistent disk,
so your SQLite database survives restarts and redeploys. This project
includes a `render.yaml` blueprint that sets it up automatically.

**Important:** a persistent disk requires Render's **Starter plan or
higher** (not the free tier). Without a persistent disk, your database
would reset every time the service restarts or redeploys — not safe for
a real admin panel where you rely on saved content.

### Steps

1. **Push this project to a GitHub (or GitLab) repository.** Don't commit
   `.env`, `node_modules/`, or the `data/` folder — `.gitignore` already
   excludes them.

2. **In the Render dashboard**, click **New +** → **Blueprint**, and
   connect the repository. Render will detect `render.yaml` and set up:
   - A Web Service running `npm install` then `npm start`
   - A 1GB persistent disk mounted at `data/`, so your database survives
   - An auto-generated `SESSION_SECRET`
   - Placeholders for `ADMIN_EMAIL` and `ADMIN_PASSWORD` (see next step)

   If you'd rather set it up by hand instead of using the blueprint:
   New + → Web Service → connect repo → Build Command `npm install` →
   Start Command `npm start` → add a Disk (name anything, mount path
   `/opt/render/project/src/data`, size 1GB).

3. **Set your admin credentials.** In the service's **Environment** tab,
   fill in `ADMIN_EMAIL` and `ADMIN_PASSWORD` (Render leaves these blank
   for you to fill in since they're secrets, not stored in the repo).
   These are only used once, to create your admin account on first boot.

4. **Deploy.** Render will build and start the service. Once it's live:
   - Visit `https://your-service.onrender.com` for the public site
   - Visit `https://your-service.onrender.com/admin` and log in with the
     email/password you set in step 3
   - Change your password from **Site Settings** in the dashboard —
     the `ADMIN_PASSWORD` env var is only read the very first time the
     database is created, so changing the env var later won't do anything

5. **Custom domain (optional):** Render's dashboard lets you add your own
   domain under the service's **Settings → Custom Domains** tab, with
   free SSL included.

That's it — no separate frontend deployment needed, since Express serves
the public site, the admin dashboard, and the API all from one service.

