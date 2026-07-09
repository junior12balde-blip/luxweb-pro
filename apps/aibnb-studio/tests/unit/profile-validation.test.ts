import { describe, expect, it } from "vitest";
import { profileSchema, DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/validations/profile";

const validInput = {
  fullName: "Ana Host",
  locale: "es",
  timezone: "Europe/Madrid",
  notificationPrefs: DEFAULT_NOTIFICATION_PREFERENCES,
};

describe("profileSchema", () => {
  it("accepts valid profile data", () => {
    const result = profileSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = profileSchema.safeParse({ ...validInput, fullName: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects an unsupported locale", () => {
    const result = profileSchema.safeParse({ ...validInput, locale: "xx" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid IANA timezone", () => {
    const result = profileSchema.safeParse({ ...validInput, timezone: "Not/AZone" });
    expect(result.success).toBe(false);
  });

  it("rejects malformed notification preferences", () => {
    const result = profileSchema.safeParse({
      ...validInput,
      notificationPrefs: { emailOnNewMessage: "yes" },
    });
    expect(result.success).toBe(false);
  });
});
