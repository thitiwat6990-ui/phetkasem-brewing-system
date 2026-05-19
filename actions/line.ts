"use server"

export async function sendLineNotification(message: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const userId = process.env.LINE_USER_ID;

  if (!token || !userId) {
    console.warn("LINE Messaging API: Missing token or user ID");
    return { success: false, error: "Missing config" };
  }

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        to: userId,
        messages: [{
          type: 'text',
          text: message
        }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("LINE API Error:", JSON.stringify(err, null, 2));
      return { success: false, error: err };
    }

    return { success: true };
  } catch (error: any) {
    console.error("LINE Notify Error:", error);
    return { success: false, error: error.message };
  }
}
