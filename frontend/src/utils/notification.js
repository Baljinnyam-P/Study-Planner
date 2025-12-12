// Utility to extract inviteId from notification message (if present)
export function extractInviteIdFromMessage(message) {
  // Example: "You were invited to join 'GroupName' by User (inviteId: 123)"
  const match = message && message.match(/inviteId\s*[:=]\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}
