// SMS verification is disabled. This function is now a placeholder.
// All verification is handled via Firebase email verification.

export default function handler() {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'SMS verification is disabled. Use email verification only.'
    }),
    {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}