import { prisma } from "@/lib/db";
import { UserProfile } from "@/types/meal";

export const DEFAULT_USER_ID = "default-user";

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: DEFAULT_USER_ID,
  name: "คุณเจฟฟี่",
  height: 175,
  currentWeight: 76.5,
  goalWeight: 68.0,
  breakfastTime: "07:30",
  lunchTime: "12:00",
  dinnerTime: "18:30",
};

/**
 * Single User Strategy for V1:
 * Abstracted utility so that V2 can easily switch to Auth.js / Clerk / Supabase Auth
 * without refactoring components or server actions.
 */
export async function getCurrentUser(): Promise<UserProfile> {
  // If in production without valid database, throw an explicit error
  const isProd = process.env.NODE_ENV === "production";

  try {
    const user = await prisma.user.findUnique({
      where: { id: DEFAULT_USER_ID },
    });

    if (user) {
      return {
        id: user.id,
        name: user.name,
        height: user.height,
        currentWeight: user.currentWeight,
        goalWeight: user.goalWeight,
        breakfastTime: user.breakfastTime,
        lunchTime: user.lunchTime,
        dinnerTime: user.dinnerTime,
      };
    }

    // Auto-create default user in PostgreSQL if it doesn't exist yet
    const created = await prisma.user.create({
      data: {
        id: DEFAULT_USER_ID,
        name: DEFAULT_USER_PROFILE.name,
        height: DEFAULT_USER_PROFILE.height,
        currentWeight: DEFAULT_USER_PROFILE.currentWeight,
        goalWeight: DEFAULT_USER_PROFILE.goalWeight,
        breakfastTime: DEFAULT_USER_PROFILE.breakfastTime,
        lunchTime: DEFAULT_USER_PROFILE.lunchTime,
        dinnerTime: DEFAULT_USER_PROFILE.dinnerTime,
      },
    });

    return {
      id: created.id,
      name: created.name,
      height: created.height,
      currentWeight: created.currentWeight,
      goalWeight: created.goalWeight,
      breakfastTime: created.breakfastTime,
      lunchTime: created.lunchTime,
      dinnerTime: created.dinnerTime,
    };
  } catch {
    if (isProd) {
      throw new Error(
        "ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบ DATABASE_URL ใน Production"
      );
    }
    // In local development fallback only
    return DEFAULT_USER_PROFILE;
  }
}
