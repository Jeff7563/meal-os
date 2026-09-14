# 🥗 Personal Meal OS

**Personal Meal OS** เป็นเว็บแอปพลิเคชันสำหรับจัดตารางอาหารเพื่อลดน้ำหนัก ออกแบบภายใต้แนวคิด **Personal Health Dashboard** ใช้งานง่ายมาก เปิดแอปแล้วตอบคำถามได้ทันทีภายใน 3 วินาทีว่า **“วันนี้ต้องกินอะไร”** ผู้ใช้สามารถทำอาหารเองจากวัตถุดิบในตู้เย็น ติ๊กมื้ออาหารที่กินแล้ว มี Shopping List รวมวัตถุดิบอัตโนมัติ และรองรับการนำเข้าตารางอาหารจาก AI (เช่น ChatGPT) ผ่าน JSON

---

## 🌟 จุดเด่นของระบบ (Key Features)

1. **หน้าวันนี้ (Today - `/`):**
   - ทักทายด้วยชื่อและวันที่ภาษาไทยแบบอ่านง่าย เช่น *วันจันทร์ที่ 14 กันยายน*
   - Progress Bar แสดงความก้าวหน้าทันที เช่น *วันนี้ 2 / 3 มื้อ (67%)*
   - รายการมื้ออาหาร (เช้า, กลางวัน, เย็น, ของว่าง) พร้อมปุ่มติ๊ก **"กินแล้ว"** แบบ Optimistic Update และเอฟเฟกต์ Confetti ฉลองความสำเร็จ
2. **ตารางอาหารรายสัปดาห์ (Schedule - `/schedule`):**
   - เลือกดูได้ทั้งแบบ **รายสัปดาห์ (Weekly View 7 วัน)** และ **รายวัน (Daily View)**
   - สลับดูสัปดาห์ก่อนหน้า ปัจจุบัน และสัปดาห์ถัดไปได้สะดวกรวดเร็ว
3. **รายละเอียดเมนูอาหาร (Meal Detail - `/meals/[id]`):**
   - แสดงเวลาเตรียม (Prep Time), แคลอรี (Calories), โปรตีน (Protein), คาร์บ (Carbs), ไขมัน (Fat)
   - วัตถุดิบและปริมาณ พร้อมหน่วยที่ชัดเจน
   - วิธีทำเป็นขั้นตอน (Step-by-step instructions)
   - ปุ่มใหญ่ด้านล่าง **"✓ กินแล้ว"** พร้อมความสามารถในการ Undo
4. **วัตถุดิบ & รายการช้อปปิ้ง (Ingredients - `/ingredients`):**
   - รวบรวมวัตถุดิบจากทั้งสัปดาห์ จัดกลุ่มเป็นหมวดหมู่ (โปรตีน, ผักสด, คาร์บ, เครื่องปรุง)
   - รวมวัตถุดิบที่ **ชื่อเดียวกันและหน่วยเดียวกัน** เข้าด้วยกันอย่างแม่นยำ (เช่น อกไก่ 200g + 180g + 200g = 580g) และแยกรายการเมื่อหน่วยต่างกัน
   - ติ๊กสถานะได้ 3 รูปแบบ: **ต้องซื้อ (Needed)**, **มีอยู่แล้ว (Have)**, **ซื้อแล้ว (Purchased)**
5. **ติดตามผล & น้ำหนัก (Progress - `/progress`):**
   - สถิติความสม่ำเสมอในการกิน (Meal Adherence) ทั้งรายวันและรายสัปดาห์
   - นับจำนวนวันต่อเนื่อง (Current Streak) และปฏิทินแสดงผล 7 วัน
   - ติดตามน้ำหนักตัว (Starting, Current, Goal Weight, Weight Change)
6. **ระบบนำเข้าและส่งออก AI JSON (Import / Export - `/settings/import` & `/api/export`):**
   - นำเข้าตารางอาหารจาก ChatGPT ด้วยโครงสร้าง JSON มาตรฐาน v1.0
   - ตรวจสอบความถูกต้องด้วย **Zod Schema** พร้อมแสดงข้อความเตือนภาษาไทยที่ระบุจุดผิดพลาดชัดเจน (Friendly Path Error)
   - บันทึกแบบ **Database Transaction** ป้องกันข้อมูลเสียหายนแบบ Atomic (Rollback ทันทีหากล้มเหลว)
   - เลือกระหว่างโหมด **Replace Existing** หรือ **Create New Plan**
   - ปุ่มส่งออก JSON สำหรับนำไปให้ AI ช่วยปรับแต่งต่อ
7. **สถาปัตยกรรมรองรับระบบออกกำลังกายในอนาคต (Exercise Ready):**
   - รองรับ Data Model สำหรับ `ExercisePlan`, `ExerciseSession`, `ExerciseLog` (การเดินสวนสาธารณะ 20-45 นาที) โดยไม่ต้องออกแบบฐานข้อมูลใหม่

---

## 🛠️ Tech Stack

- **Frontend / Full Stack:** Next.js (App Router), React 19, TypeScript, Tailwind CSS v4
- **UI Components & Icons:** shadcn/ui pattern, Lucide Icons, `canvas-confetti`
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Validation:** Zod
- **Form & State:** React Hook Form, Server Actions, Optimistic Updates
- **Timezone:** `Asia/Bangkok` (คำนวณและจัดเก็บวันที่แบบ Calendar Date ป้องกันปัญหา UTC Offset Shift)
- **Testing:** Vitest, Testing Library, Playwright
- **Deployment:** Vercel

---

## 🗄️ Database Schema & Data Models

- **`User`**: ข้อมูลโปรไฟล์ผู้ใช้ ส่วนสูง น้ำหนักปัจจุบัน น้ำหนักเป้าหมาย และเวลาอาหาร
- **`MealPlan`**: แผนอาหารประจำสัปดาห์ วันที่เริ่มต้นและสิ้นสุด
- **`MealPlanDay`**: วันในแผนอาหาร (1-7, จันทร์-อาทิตย์)
- **`Meal`**: แม่แบบเมนูอาหาร (Breakfast, Lunch, Dinner, Snack)
- **`MealIngredient`**: วัตถุดิบ ปริมาณ หน่วย และหมวดหมู่
- **`MealInstruction`**: ขั้นตอนการประกอบอาหาร
- **`MealTag`**: แท็กของเมนู (เช่น High Protein, Quick)
- **`MealLog`**: บันทึกการกินจริง (`mealId + date` มี Unique Constraint ไม่ปนกับ Meal Template)
- **`ShoppingItem`**: รายการวัตถุดิบรวบรวมสำหรับช้อปปิ้งพร้อมสถานะ (`NEEDED`, `HAVE`, `PURCHASED`)
- **`WeightLog`**: ประวัติการบันทึกน้ำหนักตัว
- **`ExercisePlan` / `ExerciseSession` / `ExerciseLog`**: รองรับระบบออกกำลังกายและการเดินในอนาคต

---

## 🚀 Local Setup & Installation

### 1. โคลนและติดตั้ง Dependencies

```bash
git clone <repository-url>
cd cacl
npm install
```

### 2. กำหนดค่า Environment Variables

คัดลอกไฟล์ `.env.example` ไปเป็น `.env`:

```bash
cp .env.example .env
```

แก้ไขค่าใน `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/meal_os?schema=public"
NEXT_PUBLIC_TIMEZONE="Asia/Bangkok"
AUTH_SECRET="your-secret-key-at-least-32-chars"
```

> **หมายเหตุ:** ระบบมี **Resilient Storage Layer** ในตัว หากยังไม่ได้เชื่อมต่อฐานข้อมูล PostgreSQL ทันที แอปจะเริ่มต้นทำงานด้วย In-Memory Seed Data 7 วันโดยอัตโนมัติ ทำให้สามารถทดสอบและเปิดดูแอปได้ทันทีโดยไม่เกิด Error ขัดจังหวะ

### 3. เตรียมฐานข้อมูล Prisma

```bash
# สร้าง Prisma Client
npx prisma generate

# ปรับปรุงโครงสร้างตารางเข้า PostgreSQL
npx prisma db push
```

### 4. รัน Development Server

```bash
npm run dev
```

เปิดบราวเซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

---

## 🧪 การทดสอบ (Testing)

### Unit Tests (Vitest)
ทดสอบ Zod Schema Validation, อัลกอริทึมรวมวัตถุดิบ (Ingredient Aggregation) และการคำนวณ Progress/Streak:

```bash
npm test
```

### E2E Tests (Playwright)
ทดสอบ User Flow หลักทั้งหมดบนบราวเซอร์จริง (Desktop และ Mobile):

```bash
npx playwright test
```

---

## 📦 ตัวอย่าง JSON สำหรับ Import ตารางอาหาร

คุณสามารถคัดลอกข้อความด้านล่างไปให้ ChatGPT เพื่อให้สร้างแผนอาหารใหม่ แล้วนำกลับมาวางในหน้า `/settings/import`:

```json
{
  "version": "1.0",
  "plan": {
    "name": "ลดน้ำหนัก - สัปดาห์ 1",
    "description": "Meal plan อาหารคลีนโปรตีนสูง",
    "startDate": "2026-09-14",
    "days": [
      {
        "day": 1,
        "label": "จันทร์",
        "date": "2026-09-14",
        "meals": [
          {
            "externalId": "d1-breakfast",
            "type": "breakfast",
            "time": "07:30",
            "name": "ไข่ต้ม + ข้าว + แตงกวา",
            "description": "มื้อเช้าเน้นโปรตีน ทำง่าย",
            "prepTime": 10,
            "nutrition": {
              "calories": 420,
              "protein": 25,
              "carbs": 40,
              "fat": 15
            },
            "ingredients": [
              { "name": "ไข่", "amount": 2, "unit": "ฟอง", "category": "protein" },
              { "name": "ข้าวสวย", "amount": 1, "unit": "ทัพพี", "category": "carb" },
              { "name": "แตงกวา", "amount": 1, "unit": "ลูก", "category": "vegetable" }
            ],
            "instructions": [
              "ต้มไข่ประมาณ 7-8 นาที",
              "เสิร์ฟพร้อมข้าวและแตงกวา"
            ],
            "tags": [
              "high-protein",
              "quick"
            ]
          }
        ]
      }
    ]
  }
}
```

---

## 🌐 การ Deploy บน Vercel

1. สร้างฐานข้อมูล PostgreSQL บน **Neon**, **Supabase**, หรือ **Vercel Postgres**
2. นำโปรเจกต์ขึ้น GitHub
3. สร้างโปรเจกต์ใหม่บน [Vercel](https://vercel.com/)
4. เพิ่ม Environment Variable บน Vercel Dashboard:
   - `DATABASE_URL`: Connection string ของ PostgreSQL (เช่น `postgresql://...`)
   - `NEXT_PUBLIC_TIMEZONE`: `Asia/Bangkok`
   - `AUTH_SECRET`: สตริงสุ่มความยาว 32 ตัวอักษร
5. สั่ง Deploy — Vercel จะรัน `prisma generate` และ `next build` ให้พร้อมใช้งานทันที
