// Admin notifications via a private Telegram bot. Set TELEGRAM_BOT_TOKEN (from
// @BotFather) and TELEGRAM_CHAT_ID (your own user id, e.g. from @userinfobot) in
// Vercel. Without them this is a no-op, so the site works the same either way.
// Never throws: a failed notification must not break the request that sent it.

export async function notifyAdmin(lines: (string | null | undefined | false)[]): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = lines.filter(Boolean).join('\n').slice(0, 3500);
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      cache: 'no-store',
    });
  } catch {
    // Ignore: notifications are best effort.
  }
}
