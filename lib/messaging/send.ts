// The single seam for swapping in a real SMS provider (Twilio, GoHighLevel,
// etc.) later. Nothing outside this file should know how messages actually
// get delivered — callers just await sendMessage() and log/store the result.

export async function sendMessage(to: string, content: string): Promise<void> {
  console.log(`[sendMessage] (not actually sending) to=${to} content=${JSON.stringify(content)}`);
}
