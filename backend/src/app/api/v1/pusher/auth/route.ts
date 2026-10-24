import { z } from "zod";
import { AppError, ErrorCode } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { pusherService } from "@/lib/pusher";
import { ok, parseBody } from "@/lib/http";

export const OPTIONS = handleOptions;

const schema = z.object({
  socket_id: z.string().min(1),
  channel_name: z.string().min(1)
});

export const POST = withAuth(async (req, user) => {
  const body = await parseBody(req, schema);
  const channel = body.channel_name;

  const allowedUserChannel = `private-user-${user.id}`;
  const allowedMitraChannel = user.mitraProfile ? `private-mitra-${user.mitraProfile.id}` : null;

  if (channel !== allowedUserChannel && channel !== allowedMitraChannel) {
    throw new AppError(ErrorCode.FORBIDDEN, "Anda tidak diizinkan mengakses channel privat ini.");
  }

  const authData = pusherService.authenticateChannel(body.socket_id, channel);
  return ok(req, authData);
});
