# Personal Meal OS — UI Redesign Specification v1

## 1. เป้าหมายของการ Redesign

ปรับหน้าตา Personal Meal OS จากรูปแบบ:

> Dark AI Dashboard / SaaS Admin Panel

ให้กลายเป็น:

> **Warm Minimal Personal Meal Planner**

ความรู้สึกเมื่อเปิดแอปควรเป็น:

**อบอุ่น / สบาย / สะอาด / เป็นธรรมชาติ / ใช้งานง่าย / เหมือนแอปอาหารส่วนตัว**

ไม่ควรรู้สึกเหมือน:

- AI dashboard
- enterprise software
- admin panel
- analytics dashboard
- developer tool

ฟังก์ชันเดิมทั้งหมดต้องทำงานเหมือนเดิม

การ Redesign รอบนี้เป็น **UI / UX redesign เท่านั้น** ห้ามเปลี่ยน business logic โดยไม่จำเป็น

---

## 2. Design Direction

ชื่อ Design Direction:

**Warm Minimal + Friendly Food App**

Visual keywords:

```text
Warm
Soft
Natural
Healthy
Personal
Friendly
Calm
Clean
Cozy
Food-focused
```

Reference mood คือภาพที่เลือก:

- พื้นหลัง warm cream
- card สีขาว
- green + warm orange accent
- ภาพอาหารเด่น
- typography อ่านง่าย
- rounded UI
- element ไม่แน่น
- ดูเป็น consumer app

---

## 3. Design Principles

ทุกหน้าต้องยึดหลักนี้:

### Food first

ชื่อเมนูและอาหารต้องเด่นกว่าตัวเลข analytics

### Human first

ใช้ข้อความแบบภาษาคน เช่น:

```text
วันนี้กินอะไร
มื้อของวันนี้
กินแล้ว
ของที่ต้องซื้อ
ของที่มีอยู่
สัปดาห์นี้
```

หลีกเลี่ยงคำแนวระบบ เช่น:

```text
AI Meal Plan
Completion Status
Meal Adherence Dashboard
System Progress
```

ถ้าจำเป็นต้องมีคำเชิงระบบ ให้เอาไว้ใน Settings หรือ Developer-related feature เท่านั้น

### Less dashboard

ไม่ต้องทำทุกอย่างเป็น:

- badge
- chip
- progress card
- analytics widget

### Calm interface

ทุกหน้าต้องมี whitespace มากพอ

---

## 4. Color System

ให้สร้าง CSS variables / design tokens กลาง

Light Theme เป็น theme หลัก

```css
--background: #F7F3EB;
--background-soft: #FBF8F2;

--surface: #FFFDF9;
--surface-white: #FFFFFF;

--border: #E9E2D8;
--border-soft: #F0EBE4;

--text-primary: #252522;
--text-secondary: #716D66;
--text-muted: #99938B;

--green-primary: #668A62;
--green-dark: #496746;
--green-soft: #E6EEE2;
--green-extra-soft: #F1F6EE;

--orange-primary: #EBAA42;
--orange-soft: #F7DFB5;
--orange-extra-soft: #FFF5E3;

--red-soft: #F9E6E2;
--red-text: #A35448;
```

ห้ามใช้:

- neon green
- electric blue
- gradient สด
- pure black background
- saturated purple เป็นสีหลัก

---

## 5. Dark Mode

ยังรองรับ Dark Mode ได้

แต่ Dark Mode ต้องเป็น:

**Warm Dark**

ไม่ใช่ navy AI dashboard

ตัวอย่าง:

```css
--background: #181A17;
--surface: #22251F;
--border: #34382F;

--text-primary: #F5F3ED;
--text-secondary: #BCB8AE;

--green-primary: #8AAA82;
--orange-primary: #E7AD55;
```

Dark Mode เป็น secondary experience

Light Mode เป็น default visual identity

---

## 6. Typography

ใช้ font ไทยที่อ่านง่าย

Preferred:

```text
Noto Sans Thai
หรือ
IBM Plex Sans Thai
```

สามารถใช้ system fallback ได้

Typography hierarchy:

```text
Page Hero
32–38px
font-weight: 700

Page Title
26–30px
700

Section Title
20–22px
600–700

Meal Title
18–20px
600

Body
15–16px
400

Meta
13–14px
400–500

Small
12–13px
```

ไม่ควรใช้ font-weight 700–800 กับทุกอย่าง

หัวข้อใหญ่เท่านั้นที่ควรหนัก

---

## 7. Border Radius

ใช้ radius ที่นุ่ม แต่ไม่ cartoon เกินไป

```text
Large card: 22–24px
Normal card: 18–20px
Input: 14–16px
Small badge: 12px
Button: 16–999px แล้วแต่บริบท
```

Meal Card ใช้ประมาณ:

```text
20px
```

---

## 8. Shadows

ลด shadow อย่างมาก

Default card:

```css
box-shadow:
0 2px 8px rgba(40, 34, 25, 0.03),
0 8px 24px rgba(40, 34, 25, 0.035);
```

หรือใช้ border อย่างเดียวได้

ห้าม:

- shadow ดำหนัก
- glow
- neon glow
- glassmorphism blur หนัก

---

## 9. Application Layout

### Mobile

Mobile คือ primary experience

Width:

- 375
- 390
- 430

Layout:

```text
Header / Content

Content

Bottom Navigation
```

ไม่มี Sidebar

Content padding:

```text
16–20px
```

Bottom navigation fixed

รองรับ:

```css
env(safe-area-inset-bottom)
```

### Desktop

ห้ามเอา mobile card แล้วยืดจนเต็มจอ

ใช้ layout:

```text
Small Sidebar
+
Main Content
```

Sidebar กว้างประมาณ:

```text
220–240px
```

Main content:

```text
max-width: 900–1050px
```

และอยู่กลาง available space

หน้าที่เป็น list เช่น Schedule อาจกว้างได้ถึง:

```text
1100–1200px
```

---

## 10. Desktop Sidebar

Sidebar ใหม่ต้องเรียบมาก

Background ใกล้เคียง app background

ด้านบน:

```text
Meal OS
กินดีในแบบของเรา
```

Logo เล็ก

Navigation:

```text
วันนี้
ตารางอาหาร
วัตถุดิบ
ความคืบหน้า
ตั้งค่า
```

ไม่ต้องมีกรอบ card รอบ navigation

Active item:

```text
soft green background
green-dark text
rounded 14px
```

ตัวอย่าง:

```text
🏠  วันนี้
📅  ตารางอาหาร
🧺  วัตถุดิบ
📈  ความคืบหน้า
⚙️  ตั้งค่า
```

แต่ใช้ Lucide icons จริง ไม่ใช้ emoji

ให้ลบ card:

```text
AI MEAL PLAN
Import from ChatGPT
Export JSON
```

ออกจาก Sidebar

ย้าย Import/Export ไป Settings

---

## 11. Mobile Bottom Navigation

มี 5 tabs:

```text
วันนี้
ตาราง
วัตถุดิบ
ความคืบหน้า
ตั้งค่า
```

Icons:

```text
House
CalendarDays
ShoppingBasket
ChartNoAxesColumnIncreasing
Settings
```

Active:

```text
green-primary
```

Inactive:

```text
text-muted
```

ห้ามใช้ background pill ใหญ่กับ active tab

ใช้สี icon + label ก็พอ

---

## 12. TODAY PAGE — หน้าหลัก

URL:

```text
/
```

Primary question ที่หน้าต้องตอบ:

> วันนี้กินอะไร?

### Page structure

Desktop:

```text
Greeting
Hero Title
Date

Small Daily Summary

Today's Meals
Meal Card
Meal Card
Meal Card
```

Mobile เหมือนกัน

---

## 13. Today Header

ด้านบน:

```text
สวัสดี เจฟ 👋
ดูแลตัวเองดี ๆ ในวันนี้นะ
```

หรือ

```text
สวัสดี 👋
พร้อมสำหรับมื้อวันนี้ไหม
```

ไม่ต้องมีชื่อถ้าระบบไม่มีชื่อ

จากนั้น Hero:

```text
วันนี้กินอะไร
วันจันทร์ที่ 14 กันยายน
```

`วันนี้กินอะไร` ต้องเป็น visual anchor ของหน้า

ไม่ต้องมี logo หรือ AI icon รอบหัวข้อเยอะ

สามารถมี decoration เล็ก ๆ เช่น:

- leaf
- tiny orange line
- small food illustration

แต่ไม่เกิน 1–2 ชิ้น

---

## 14. Daily Summary

แทน progress dashboard ใหญ่

ทำเป็น soft card:

```text
เตรียมไว้ 3 มื้อสำหรับวันนี้

กินแล้ว 1 จาก 3 มื้อ
──────────────
```

Progress bar เล็ก

อาจมีข้อความ:

```text
ดีมาก เริ่มต้นได้ดีแล้ว
```

แต่อย่าทำ gamification เยอะ

Dimensions:

```text
padding 18–20px
border radius 20px
background green-extra-soft
```

---

## 15. Meal Card — สำคัญมาก

Meal Card ต้องเป็น centerpiece

โครง:

```text
┌──────────────────────────────┐

[Meal Type]      [time]

[Food Image]

ชื่อเมนู

คำอธิบายสั้น ๆ

350 kcal · โปรตีน 18 g

[รายละเอียด]      [กินแล้ว]

└──────────────────────────────┘
```

Desktop สามารถใช้:

```text
image | content | action
```

Mobile ใช้:

```text
meal header
image + information
actions
```

---

## 16. Meal Image

เพิ่ม support สำหรับ meal image ใน UI

ถ้ายังไม่มี image ใน database:

ใช้ placeholder ที่สวย

ไม่ใช้:

- gray rectangle
- broken image

Placeholder เช่น:

```text
soft food illustration
meal-type illustration
warm gradient-free colored block
```

Image ratio:

```text
1:1
หรือ
4:3
```

Radius:

```text
16–18px
```

ในอนาคตค่อยเพิ่มจริงใน database

---

## 17. Meal Type Visual

แต่ละมื้อใช้ accent อ่อน

Breakfast:

```text
warm orange
sun icon
```

Lunch:

```text
warm yellow / green
sun icon
```

Dinner:

```text
muted lavender / warm beige
moon icon
```

Snack:

```text
soft green
apple icon
```

ไม่ต้องใช้ badge saturated

ตัวอย่าง:

```text
☀ เช้า
07:30
```

แต่ใน implementation ใช้ Lucide icons

---

## 18. Meal Information

Hierarchy:

1. Meal type
2. Meal name
3. Description
4. Nutrition
5. Actions

ตัวอย่าง:

```text
เช้า · 07:30

ไข่ต้ม + ข้าว + แตงกวา

มื้อเช้าทำง่าย อิ่มนาน และเตรียมเร็ว

350 kcal · โปรตีน 18 g
```

Nutrition ไม่ต้องอยู่ใน colored badges

ใช้ inline text

ตัว separator:

```text
•
```

---

## 19. Meal Actions

สอง action:

Secondary:

```text
รายละเอียด
```

Primary:

```text
กินแล้ว
```

Secondary:

```text
outline
white/transparent
border green-soft
```

Primary:

```text
green-primary
white text
```

ถ้ากินแล้ว:

```text
✓ กินแล้ว
```

และ card สามารถมี:

```text
soft green tint
```

แต่ห้าม opacity ลดจนอ่านยาก

---

## 20. Skip Action

`ข้ามมื้อ` ไม่ควรเด่นเท่า `กินแล้ว`

ให้อยู่:

- Meal Detail
หรือ
- More menu `...`

ไม่ควรวางข้าง primary button ถ้าไม่จำเป็น

---

## 21. Schedule Page

URL:

```text
/schedule
```

Header:

```text
ตารางอาหาร

สัปดาห์นี้
14–20 กันยายน
```

Top controls:

```text
←
สัปดาห์นี้
→
```

Weekly / Daily toggle เป็น segmented control เรียบ

---

## 22. Weekly Schedule Layout

Mobile:

วันเป็น section

```text
จันทร์ 14

เช้า
ไข่ต้ม + ข้าว + แตงกวา

กลางวัน
อกไก่ย่าง + บรอกโคลี

เย็น
หมูสับผัดกะหล่ำปลี
```

ไม่ต้องสร้าง card ใหญ่ทุก meal

ใช้ list row ชัด ๆ

Desktop:

Preferred:

```text
7-day vertical sections
```

หรือ

```text
2-column weekly layout
```

ห้ามสร้างตาราง spreadsheet 7 columns ที่แน่นเกิน

---

## 23. Current Day

Current Day highlight:

```text
soft orange/green accent
```

เช่น:

```text
วันนี้
จันทร์ 14
```

ใช้ label เล็ก

---

## 24. Meal Detail Page

URL:

```text
/meals/[id]
```

หน้าต้องให้ความรู้สึกเหมือน Recipe Page

ไม่ใช่ database record

Header:

- Back button
- Meal type
- title

---

## 25. Meal Hero

ด้านบน:

```text
[Large Food Image]

อกไก่ย่าง + บรอกโคลี

กลางวัน · 12:00
20 นาที
```

Nutrition:

```text
420 kcal
45 g โปรตีน
...
```

สามารถใช้ small stat blocks ได้ที่นี่

เพราะ detail page เหมาะกว่า Today

---

## 26. Ingredients Section

หัวข้อ:

```text
วัตถุดิบ
```

Rows:

```text
อกไก่                 200 g
บรอกโคลี              150 g
ซีอิ๊วขาว        1 ช้อนโต๊ะ
พริกไทย          1 ช้อนชา
```

ไม่ต้องทำ table border

ใช้ divider บาง ๆ

---

## 27. Instructions Section

```text
วิธีทำ
```

แต่ละขั้นตอน:

```text
1
หมักอกไก่ด้วยซีอิ๊วและพริกไทยประมาณ 10 นาที
```

เลขอยู่ใน circle soft green

---

## 28. Meal Detail Bottom Action

บน Mobile:

Sticky bottom action:

```text
[ข้ามมื้อ]       [✓ กินแล้ว]
```

Primary button กว้างกว่า

---

## 29. Ingredients Page

เปลี่ยนชื่อหน้า UI เป็น:

```text
วัตถุดิบ
```

Subheading:

```text
ของที่ต้องใช้สำหรับสัปดาห์นี้
```

ด้านบน Summary:

```text
ต้องซื้อ 8 รายการ
มีแล้ว 5 รายการ
```

ไม่ต้องใช้ dashboard cards หลายใบ

---

## 30. Ingredient Categories

Categories:

```text
โปรตีน
ผัก
คาร์บ
เครื่องปรุง
อื่น ๆ
```

แต่ละ section ใช้ simple list

ตัวอย่าง:

```text
โปรตีน

○ อกไก่           1.4 kg
○ หมูสันนอก       900 g
✓ ไข่             18 ฟอง
```

---

## 31. Ingredient Status

Interaction แบบ simple

สถานะ:

```text
ต้องซื้อ
มีแล้ว
ซื้อแล้ว
```

ไม่ต้องแสดง 3 ปุ่มในทุก row

Preferred interaction:

Click item
→ small dropdown / bottom sheet

หรือ:

```text
○ = needed
✓ = have/purchased
```

และ action menu สำหรับรายละเอียด

---

## 32. Search Ingredients

Search bar:

```text
ค้นหาวัตถุดิบ
```

Style:

```text
soft surface
no heavy border
search icon left
```

---

## 33. Future Pantry Preparation

UI ไม่จำเป็นต้อง implement รอบนี้

แต่ Ingredients page ให้เผื่อ tabs:

```text
ต้องซื้อ
ของที่มี
```

ยังสามารถ disable `ของที่มี` หรือไม่แสดงจนกว่า feature พร้อม

---

## 34. Progress Page

เปลี่ยน mood จาก Analytics Dashboard เป็น:

> สุขภาพของฉัน

Header:

```text
ความคืบหน้า
```

Subheading:

```text
ค่อย ๆ ดีขึ้นในแบบของเรา
```

---

## 35. Progress Summary

Top section:

```text
สัปดาห์นี้

18 / 21 มื้อ
86%
```

สามารถมี circular / horizontal indicator เล็ก ๆ

แต่ห้ามมี chart เยอะใน viewport แรก

---

## 36. Weekly Meal History

ใช้ 7-day row:

```text
จ   อ   พ   พฤ   ศ   ส   อา
✓   ✓   ✓   2/3  ✓   -   -
```

simple

---

## 37. Weight Section

Title:

```text
น้ำหนัก
```

แสดง:

```text
ตอนนี้
120.4 kg

เริ่มต้น
122.0 kg

เปลี่ยนแปลง
-1.6 kg
```

ใช้ cards 2–3 ใบเล็กได้

---

## 38. Weight Graph

Graph style:

- line thin
- no filled neon chart
- soft axis
- minimal grid
- green line
- no gradient

---

## 39. Add Weight

Button:

```text
+ บันทึกน้ำหนัก
```

กดแล้วใช้ Modal / Bottom Sheet

fields:

```text
น้ำหนัก
วันที่
หมายเหตุ
```

---

## 40. Settings Page

Settings ไม่ต้องเหมือน admin config

Header:

```text
ตั้งค่า
```

Sections:

```text
โปรไฟล์
ตารางเวลา
หน้าตา
ข้อมูล
```

---

## 41. Profile

Fields:

```text
ชื่อ
ส่วนสูง
น้ำหนักเป้าหมาย
```

Simple form

---

## 42. Meal Times

```text
เวลาอาหาร

เช้า        07:30
กลางวัน     12:00
เย็น        18:30
```

กด row เพื่อเปลี่ยน

---

## 43. Appearance

```text
ธีม

○ ระบบ
○ สว่าง
○ มืด
```

---

## 44. Import / Export

ย้ายมา section:

```text
ข้อมูลและตารางอาหาร
```

Rows:

```text
นำเข้าตารางอาหาร
ส่งออกตารางอาหาร
```

ไม่ใช้คำว่า:

```text
Import from ChatGPT
AI Meal Plan
```

ใน Navigation

ใน Import page สามารถบอกได้ว่า:

```text
รองรับ JSON ที่สร้างจาก ChatGPT
```

เป็นคำอธิบายรอง

---

## 45. Import Page

Header:

```text
นำเข้าตารางอาหาร
```

Description:

```text
วางข้อมูล JSON ตารางอาหารของคุณด้านล่าง
```

Textarea ใหญ่

Actions:

```text
ตรวจสอบข้อมูล
ล้าง
```

---

## 46. Import Preview

หลัง Validate:

ใช้ card:

```text
พร้อมนำเข้า

ลดน้ำหนัก - สัปดาห์ 1

14–20 กันยายน

7 วัน
21 มื้อ
48 รายการวัตถุดิบ
```

Actions:

```text
นำเข้าเป็นแผนใหม่
แทนที่แผนปัจจุบัน
```

---

## 47. Empty States

ต้องดูอบอุ่น

Today:

```text
วันนี้ยังไม่มีตารางอาหาร

เพิ่มตารางอาหารเพื่อเริ่มวางแผนมื้อของวันนี้
```

CTA:

```text
เพิ่มตารางอาหาร
```

Ingredients:

```text
ยังไม่มีวัตถุดิบที่ต้องซื้อ 🎉
```

Schedule:

```text
สัปดาห์นี้ยังไม่มีแผนอาหาร
```

---

## 48. Error States

ไม่ใช้ full-screen technical error ถ้าไม่จำเป็น

เช่น database error:

```text
มีบางอย่างผิดพลาด

ตอนนี้ยังโหลดข้อมูลไม่ได้
ลองใหม่อีกครั้งในอีกสักครู่

[ลองใหม่]
```

รายละเอียด technical ให้ส่งไป console/log

---

## 49. Toast Style

Toast:

- bottom / top-right desktop
- simple
- white/cream
- subtle shadow

Messages:

```text
บันทึกมื้อนี้แล้ว ✓
อัปเดตรายการแล้ว
นำเข้าตารางอาหารสำเร็จ
```

---

## 50. Animations

ใช้ animation น้อยมาก

allowed:

```text
150–250ms
fade
small translate
button press
progress transition
```

ห้าม:

- bouncing
- excessive confetti
- AI-like shimmer everywhere

Confetti ถ้ามีอยู่ตอนนี้:

แนะนำเอาออก

หรือให้ใช้เฉพาะ milestone จริง

ไม่ควรยิงทุกครั้งที่กด `กินแล้ว`

---

## 51. Icon System

ใช้ Lucide

Icon stroke:

```text
1.75–2
```

ไม่ mix หลาย icon libraries

ใช้ decorative emoji ได้ใน copy นิดหน่อย

แต่ navigation ใช้ icons จริง

---

## 52. Image Style

ถ้ามี food image:

ให้เป็น:

- natural
- top-down / 3/4
- warm daylight
- neutral plate
- clean background

ห้าม:

- hyper glossy food
- neon
- AI fantasy food styling

---

## 53. Content Density

Mobile meal card ไม่ควรยาวเกินประมาณ:

```text
180–230px
```

ถ้า description ยาว:

- clamp 2 lines

Nutrition:

- 1 line
- ถ้าไม่พอให้ตัดบาง macro ออกบน Today

Detail page ค่อยแสดงทั้งหมด

---

## 54. Responsive Behavior

### Mobile < 768

```text
Bottom nav
single-column
meal cards vertical
full-width cards
```

### Tablet 768–1023

```text
no sidebar or compact sidebar
content max-width 760
```

### Desktop >= 1024

```text
sidebar
content centered
Today max-width 900–1000
```

### Large Desktop >= 1440

ห้าม stretch content

ใช้ max-width

---

## 55. Accessibility

Minimum touch:

```text
44px
```

Contrast ต้องผ่าน

Interactive elements:

- focus state
- aria-label
- keyboard accessible

อย่าใช้สีอย่างเดียวบอกสถานะ

เช่น completed:

```text
✓ กินแล้ว
```

แทนที่จะใช้แค่สีเขียว

---

## 56. Page Priority

ตอน redesign ให้ทำตาม priority:

1. Today
2. Meal Detail
3. Schedule
4. Ingredients
5. Progress
6. Settings
7. Import

เพราะ Today เป็นหน้าที่ผู้ใช้เห็นบ่อยที่สุด

---

## 57. Component Set

ควรมี reusable components:

```text
AppHeader
PageHeader
MealCard
MealTypeLabel
MealImage
NutritionLine
DailySummary
ProgressBar
PrimaryButton
SecondaryButton
IngredientRow
SectionHeader
EmptyState
BottomNav
DesktopSidebar
WeightSummary
StatusPill
```

ห้าม copy CSS ไปทุกหน้า

---

## 58. Important: Existing Functionality

UI Redesign ห้ามทำให้ feature เหล่านี้เสีย:

```text
Meal completion
Meal skip
Meal undo
Meal logs
Schedule navigation
Ingredient aggregation
Shopping status
Weight logging
Import JSON
Export JSON
Dark mode
Timezone Asia/Bangkok
Database persistence
```

Design layer ต้องครอบ business logic เดิม

---

## 59. สิ่งที่ต้อง REMOVE จาก UI ปัจจุบัน

สิ่งที่ควรลบ/เปลี่ยน:

```text
Dark navy เป็น default
Neon green
AI MEAL PLAN panel
Dashboard-like cards
Badge เยอะ
Glow
Heavy shadows
Technical labels
Confetti on basic interaction
Overuse of bordered boxes
```

---

## 60. Final Visual Target

ผู้ใช้เปิดเว็บแล้วควรรู้สึกว่า:

> “นี่คือแอปที่ช่วยให้ฉันรู้ว่าวันนี้ต้องกินอะไร”

ไม่ใช่:

> “นี่คือระบบ dashboard ที่กำลัง track KPI การกินของฉัน”

Priority:

```text
Food
↓
Action
↓
Routine
↓
Progress
↓
Analytics
```

ไม่ใช่:

```text
Analytics
↓
Metrics
↓
Food
```

---

# ภาพรวมหน้า Today ที่ Agent ควรสร้าง

```text
┌─────────────────────────────┐
│ สวัสดี 👋                    │
│ ดูแลตัวเองดี ๆ ในวันนี้นะ     │
│                             │
│ วันนี้กินอะไร                 │
│ จันทร์ที่ 14 กันยายน         │
│                             │
│ ┌─────────────────────────┐ │
│ │ เตรียมไว้ 3 มื้อวันนี้    │ │
│ │ กินแล้ว 0 จาก 3 มื้อ     │ │
│ │ ━━━━━━━━━━━━━━━        │ │
│ └─────────────────────────┘ │
│                             │
│ มื้อของวันนี้                │
│                             │
│ ┌─────────────────────────┐ │
│ │ ☀ เช้า      07:30       │ │
│ │                         │ │
│ │ [IMAGE]                 │ │
│ │                         │ │
│ │ ไข่ต้ม + ข้าว + แตงกวา │ │
│ │ มื้อเช้าทำง่าย อิ่มนาน  │ │
│ │                         │ │
│ │ 350 kcal · โปรตีน 18g  │ │
│ │                         │ │
│ │ [รายละเอียด] [✓ กินแล้ว]│ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ ☀ กลางวัน    12:00      │ │
│ │ ...                     │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ ☾ เย็น       18:30      │ │
│ │ ...                     │ │
│ └─────────────────────────┘ │
│                             │
├─────────────────────────────┤
│ วันนี้ ตาราง วัตถุดิบ สถิติ ⚙ │
└─────────────────────────────┘
```

---

## Implementation Note for Agent

ก่อนเริ่มแก้ UI ให้ Agent ทำดังนี้:

1. ตรวจ component เดิมก่อน
2. Reuse business logic เดิมทั้งหมด
3. แก้เฉพาะ presentation layer เท่าที่จำเป็น
4. ทำ Today page ให้เสร็จก่อน
5. ตรวจ responsive ที่ 375 / 390 / 430 / 1024 / 1440
6. ตรวจ dark mode ว่ายังใช้ได้
7. ตรวจว่า Meal actions ยังใช้งานได้
8. ห้ามแก้ database schema ถ้าไม่จำเป็น
9. ห้ามแก้ import/export contract
10. หลัง Today เสร็จค่อย rollout design system ไปหน้าที่เหลือตาม priority
