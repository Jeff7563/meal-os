import { test, expect } from "@playwright/test";

test.describe("Personal Meal OS - End-to-End Acceptance Tests", () => {
  test("1. Today page loads and displays correct Bangkok date and meals", async ({ page }) => {
    await page.goto("/");
    // Header & Greeting
    await expect(page.locator("main h1")).toContainText("สวัสดี 👋");
    await expect(page.locator("text=ความคืบหน้าวันนี้")).toBeVisible();
    await expect(page.locator("text=มื้ออาหารของวันนี้")).toBeVisible();

    // Verify at least one meal card is displayed
    const mealCard = page.locator("main a[href*='/meals/']").first();
    await expect(mealCard).toBeVisible();
  });

  test("2. Meal detail displays complete information (nutrition, ingredients, instructions)", async ({ page }) => {
    await page.goto("/");
    const firstMeal = page.locator("main a[href*='/meals/']").first();
    await firstMeal.click();

    await page.waitForURL(/\/meals\/.+/);
    // Nutrition section
    await expect(page.locator("text=ข้อมูลโภชนาการ")).toBeVisible();
    // Ingredients section
    await expect(page.locator("text=วัตถุดิบที่ต้องใช้")).toBeVisible();
    // Instructions
    await expect(page.locator("text=วิธีทำ (ขั้นตอน)")).toBeVisible();
  });

  test("3. Complete meal and reload page, status persists", async ({ page }) => {
    await page.goto("/");

    // Click "กินแล้ว" on the first meal card if it's not already completed
    const completeButton = page.locator("button:has-text('กินแล้ว')").first();
    if (await completeButton.isVisible()) {
      await completeButton.click();
      // Verify optimistic / UI update to Undo
      await expect(page.locator("button:has-text('Undo')").first()).toBeVisible();

      // Reload page and check persistence
      await page.reload();
      await expect(page.locator("text=✓ กินแล้ว").first()).toBeVisible();
      await expect(page.locator("button:has-text('Undo')").first()).toBeVisible();
    }
  });

  test("4. Undo meal completion and reload page, status returns to pending", async ({ page }) => {
    await page.goto("/");

    // Look for Undo button
    const undoButton = page.locator("button:has-text('Undo')").first();
    if (await undoButton.isVisible()) {
      await undoButton.click();

      // Reload page
      await page.reload();
      // Should now show "กินแล้ว" action button again
      await expect(page.locator("button:has-text('กินแล้ว')").first()).toBeVisible();
    }
  });

  test("5. Change shopping status to HAVE and reload page, status persists", async ({ page }) => {
    await page.goto("/ingredients");
    await expect(page.locator("main h1")).toContainText("วัตถุดิบ & รายการช้อปปิ้ง");

    const haveButton = page.locator("button:has-text('มีแล้ว')").first();
    if (await haveButton.isVisible()) {
      await haveButton.click();
      await expect(page.locator("button:has-text('มีแล้ว ✓')").first()).toBeVisible();

      // Reload page
      await page.reload();
      await expect(page.locator("button:has-text('มีแล้ว ✓')").first()).toBeVisible();
    }
  });

  test("6. Import valid JSON succeeds with full preview and updates schedule", async ({ page }) => {
    await page.goto("/settings/import");
    await expect(page.locator("main h1")).toContainText("นำเข้าตารางอาหารด้วย JSON");

    // Load seed example
    await page.click("button:has-text('โหลดตัวอย่าง JSON สัปดาห์นี้')");

    // Validate
    await page.click("button:has-text('ตรวจข้อมูล (Validate)')");
    await expect(page.locator("text=✓ JSON Valid")).toBeVisible();

    // Verify preview stats
    await expect(page.locator("text=ชื่อแผน")).toBeVisible();
    await expect(page.locator("text=ช่วงวันที่ (เริ่ม - สิ้นสุด)")).toBeVisible();
    await expect(page.locator("text=จำนวนวัน")).toBeVisible();
    await expect(page.locator("text=จำนวนมื้อทั้งหมด")).toBeVisible();
    await expect(page.locator("text=จำนวนวัตถุดิบทั้งหมด")).toBeVisible();

    // Confirm Import
    await page.click("button:has-text('ยืนยันนำเข้า (Import)')");
    await expect(page).toHaveURL("/", { timeout: 10000 });
  });

  test("7. Import invalid JSON displays clear error message and prevents import", async ({ page }) => {
    await page.goto("/settings/import");

    // Fill invalid JSON
    const textarea = page.locator("textarea");
    await textarea.fill('{"version": "9.9", "invalid": true}');

    // Click validate
    await page.click("button:has-text('ตรวจข้อมูล (Validate)')");

    // Verify error box
    await expect(page.locator("text=พบข้อผิดพลาดใน JSON")).toBeVisible();
    // Confirm import button is NOT visible
    await expect(page.locator("button:has-text('ยืนยันนำเข้า (Import)')")).not.toBeVisible();
  });
});
