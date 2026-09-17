# Shop Manager — Multi-tenant SaaS (MERN)

Super admin companies banata hai, har company ka apna admin hota hai, aur har admin apni company ki
shops + production areas manage karta hai. **Ek admin dusri company ka data kabhi nahi dekh sakta.**

```
Super Admin (software owner)
   └── Company 1 ── Admin 1 ── Shops, Production Areas, Products, Staff
   └── Company 2 ── Admin 2 ── Shops, Production Areas, Products, Staff
```

Stack: React (Vite) + Express + MongoDB (Mongoose) + JWT auth.

---

## 1. Zaruri cheezein

- Node.js 18 ya us se upar — https://nodejs.org
- MongoDB: ya to local install (MongoDB Community Server) ya free MongoDB Atlas cluster
- Koi bhi code editor (VS Code)

Check karein:
```bash
node -v
npm -v
```

---

## 2. Backend setup

```bash
cd backend
npm install
```

`.env` file pehle se maujood hai (`.env.example` ki copy). Usay apne hisaab se edit karein:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/saas_shop
JWT_SECRET=koi_lamba_random_secret_yahan_likhein
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

SUPER_ADMIN_NAME=Super Admin
SUPER_ADMIN_EMAIL=superadmin@saas.com
SUPER_ADMIN_PASSWORD=Super@123
```

**Atlas use kar rahe hain?** `MONGO_URI` aisa hoga:
```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/saas_shop?retryWrites=true&w=majority
```
Atlas me Network Access → Add IP Address → `0.0.0.0/0` (development ke liye).

### Super admin banayein (sirf pehli dafa)

```bash
npm run seed
```

Yeh command sirf ek super admin user banati hai. Baqi sab kuch UI se banega.

### Server chalayein

```bash
npm run dev      # nodemon ke sath
# ya
npm start
```

Server: http://localhost:5000 — test: http://localhost:5000/api/health

---

## 3. Frontend setup

Naya terminal kholein:

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

Frontend dev server `/api` ki calls khud backend (port 5000) ko forward karta hai (vite proxy),
is liye normally `.env` chherne ki zarurat nahi. Agar backend kisi aur host par ho to
`frontend/.env` me `VITE_API_URL=http://your-server:5000/api` set karein.

---

## 4. Istemal ka tareeqa

1. **Super admin login** — `superadmin@saas.com` / `Super@123` (jo .env me hai)
2. **Companies → Add a company** — company ki detail + us company ke admin ka naam, email, password ek hi form me.
3. Wo email/password company ke admin ko de dein.
4. **Admin login karta hai** — usay sirf apni company nazar aati hai:
   - Shops (multiple shops bana sakta hai)
   - Production areas (industry/unit)
   - Products (har product kisi shop se aur optionally kisi production area se juda hota hai)
   - Team (staff accounts, sirf isi company ke andar)
5. Super admin kisi bhi company ko **suspend** kar sakta hai, admin ka password reset kar sakta hai,
   ya poori company (sara data) delete kar sakta hai.

Test karne ke liye do companies banayein, dono ke admin se login karein — dono ko sirf apna data milega.

---

## 5. Data isolation kaise kaam karta hai

Yeh sab se important hissa hai:

1. Har record (`Shop`, `ProductionArea`, `Product`, `User`) me ek `company` field hai — yehi tenant key hai.
2. Login par JWT token me user ki `company` id chali jati hai.
3. `backend/src/middleware/auth.js` ka **`tenantScope`** middleware har protected route par `req.companyId` set karta hai:
   - admin/staff → hamesha apni hi `user.company`
   - superadmin → `?companyId=...` se kisi bhi company ka data dekh sakta hai
4. Har query me `company: req.companyId` filter lagta hai — sirf list me nahi, `findOne`, `update`, `delete`
   me bhi. Is liye agar koi admin dusri company ki shop ki id manually bhi bheje to "Shop not found" aata hai.
5. Product banate waqt bhi check hota hai ke shop usi company ki hai.

Yaani data alag alag database me nahi, ek hi database me hai magar har query company se bandhi hui hai
(shared database, row-level isolation — SaaS ka sab se common tareeqa).

---

## 6. API endpoints

Sab protected routes me header: `Authorization: Bearer <token>`

| Method | Endpoint | Kaun | Kaam |
|---|---|---|---|
| POST | `/api/auth/login` | sab | login, token milta hai |
| GET | `/api/auth/me` | sab | apni profile |
| PUT | `/api/auth/change-password` | sab | password badlein |
| GET/POST | `/api/companies` | superadmin | companies list / nayi company + admin |
| GET/PUT/DELETE | `/api/companies/:id` | superadmin | detail / update / delete |
| PUT | `/api/companies/:id/admin-password` | superadmin | admin password reset |
| GET/POST | `/api/shops` | admin, staff (read) | shops |
| GET/PUT/DELETE | `/api/shops/:id` | admin | shop detail / update / delete |
| GET/POST | `/api/production-areas` | admin | production areas |
| PUT/DELETE | `/api/production-areas/:id` | admin | update / delete |
| GET/POST | `/api/products` | admin, staff | products |
| PUT/DELETE | `/api/products/:id` | admin, staff | update / delete |
| GET/POST | `/api/users` | admin | company ke users / naya staff |
| PUT | `/api/users/:id/toggle` | admin | enable/disable |
| GET | `/api/dashboard/super` | superadmin | platform stats |
| GET | `/api/dashboard/company` | admin, staff | company stats |

---

## 7. Database collections

- **companies** — name, businessType, phone, address, isActive
- **users** — name, email, password (bcrypt hashed), role (`superadmin` | `admin` | `staff`), company, shop
- **shops** — name, code, phone, address, isActive, **company**
- **productionareas** — name, industryType, location, capacityPerDay, **company**
- **products** — name, sku, price, stock, shop, productionArea, **company**

Bold field hi tenant isolation ki jaan hai.

---

## 8. Production build

```bash
cd frontend
npm run build       # dist/ folder banega
```
`dist` ko Netlify/Vercel par deploy karein aur backend ko Render/Railway par. Backend par
`CLIENT_URL` apne frontend URL par set karein taake CORS chale.

---

## 9. Common masail

| Masla | Hal |
|---|---|
| `MongoDB connection failed` | Mongo service band hai ya `MONGO_URI` ghalat hai. Atlas par IP whitelist check karein. |
| Login par `Email or password is incorrect` | `npm run seed` chalaya? Email lowercase me likhein. |
| Frontend par Network Error | Backend chal raha hai? `http://localhost:5000/api/health` kholein. |
| `Your company is suspended` | Super admin ne company suspend ki hui hai, usay Activate karein. |
| Token expired | Dobara login karein, token 7 din chalta hai. |
PORT=5000
MONGO_URI="mongodb+srv://rehanagill260_db_user:21yAntZ5Mwj3sj1M@cluster0.ixobqko.mongodb.net/?appName=Cluster0"
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Seed ke liye super admin credentials
SUPER_ADMIN_NAME=Super Admin
SUPER_ADMIN_EMAIL=superadmin@saas.com
SUPER_ADMIN_PASSWORD=Super@123

VITE_API_URL=http://localhost:5000/api