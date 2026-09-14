import { test, expect } from "@playwright/test";

test.describe("Personal Meal OS - Core User Flows", () => {
  test("1. Opens Today page, displays greeting, date, and meals", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("สวัสดี 👋");
    await expect(page.locator("text=ความคืบหน้าวันนี้")).toBeVisible();
    await expect(page.locator("text=มื้ออาหารของวันนี้")).toBeVisible();
  });

  test("2. Navigates to Meal Detail, toggles completion, and refreshes", async ({ page }) => {
    await page.goto("/");
    
    // Click on the first meal card link
    const firstMeal = page.locator("a[href^='/meals/']").first();
    await expect(firstMeal).toBeVisible();
    await firstMeal.click();

    // Verify on detail page
    await expect(page).toHaveURL(/\/meals\/.+/);
    await expect(page.locator("text=วัตถุดิบที่ต้องใช้")).toBeVisible();

    // Toggle complete button
    const completeButton = page.locator("button:has-text('กินแล้ว')").first();
    await expect(completeButton).toBeVisible();
    await completeButton.click();

    // Refresh page and ensure state remains
    await page.reload();
    await expect(page.locator("button:has-text('กินแล้ว ✓')").first()).toBeVisible();
  });

  test("3. Opens Weekly Schedule and switches between Weekly and Daily views", async ({ page }) => {
    await page.goto("/schedule");
    await expect(page.locator("h1")).toContainText("ตารางอาหาร");
    
    // Switch to Daily view
    await page.click("button:has-text('รายวัน (Daily)')");
    await expect(page.locator("text=วันจันทร์")).toBeVisible();

    // Switch back to Weekly view
    await page.click("button:has-text('รายสัปดาห์ (Weekly)')");
    await expect(page.locator("text=วันอังคาร")).toBeVisible();
  });

  test("4. Opens Ingredients & Shopping List and updates status", async ({ page }) => {
    await page.goto("/ingredients");
    await expect(page.locator("h1")).toContainText("วัตถุดิบ");
    
    // Find item and mark 'มีแล้ว'
    const haveButton = page.locator("button:has-text('มีแล้ว')").first();
    if (await haveButton.isVisible()) {
      await haveButton.click();
      await expect(page.locator("button:has-text('มีแล้ว ✓')").first()).toBeVisible();
    }
  });

  test("5. Validates and Imports JSON Meal Plan", async ({ page }) => {
    await page.goto("/settings/import");
    await expect(page.locator("h1")).toContainText("นำเข้าตารางอาหารด้วย JSON");

    // Click Load Example
    await page.click("button:has-text('โหลดตัวอย่าง JSON สัปดาห์นี้')");
    
    // Click Validate
    await page.click("button:has-text('ตรวจข้อมูล (Validate)')");
    await expect(page.locator("text=✓ JSON Valid")).toBeVisible();

    // Click Import
    await page.click("button:has-text('ยืนยันนำเข้า (Import)')");
    await expect(page).toHaveURL("/");
  });
});
