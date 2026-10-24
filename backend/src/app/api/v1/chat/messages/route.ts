import { z } from "zod";
import { ok, parseBody, publicRoute } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { chatbotService } from "@/modules/chatbot/chatbot.service";

export const OPTIONS = handleOptions;

const schema = z.object({
  sessionId: z.string().uuid().optional(),
  userId: z.string().uuid().optional().nullable(),
  message: z.string().min(1).max(1000),
  citySlug: z.string().optional()
});

export const POST = publicRoute(async (req) => {
  const body = await parseBody(req, schema);
  const res = await chatbotService.sendMessage(body);
  return ok(req, res);
});
