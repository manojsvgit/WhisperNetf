"use server";

import { moderateText } from "@/ai/flows/ai-moderator";

export async function checkMessageForModeration(message: string) {
  try {
    const result = await moderateText({ text: message });
    return result;
  } catch (error) {
    console.error("Error moderating text:", error);
    // In case of an error with the moderation service, default to safe to avoid disrupting user experience.
    return { isSafe: true, reason: "" };
  }
}
