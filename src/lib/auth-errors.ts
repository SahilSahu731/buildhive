export type AuthOperation = "send-code" | "verify-code" | "oauth";

/** Public messages are controlled here; raw provider responses never enter the UI. */
export function authFailure(error: unknown, operation: AuthOperation) {
  const value = error && typeof error === "object" ? error : {};
  const code =
    "code" in value &&
    typeof value.code === "string" &&
    /^[a-z_]+$/.test(value.code)
      ? value.code
      : "unknown";
  const status =
    "status" in value && typeof value.status === "number"
      ? value.status
      : undefined;
  const reason =
    "message" in value && typeof value.message === "string"
      ? value.message
      : "";
  const name =
    "name" in value && typeof value.name === "string" ? value.name : "";
  let message = "Sign-in couldn't be completed. Please try again.";
  let hint = "Check the failed request in Supabase Authentication logs.";

  if (code === "otp_expired") {
    message =
      "That code is incorrect or has expired. Try again or request a new one.";
    hint = "Request a fresh code and use the latest email.";
  } else if (code.includes("rate_limit") || status === 429) {
    message =
      "The email or sign-in request limit has been reached. Please wait before trying again.";
    hint =
      "Check Authentication → Rate Limits. Supabase's built-in email service has a low project-wide limit.";
  } else if (code === "email_address_not_authorized") {
    message =
      "Email delivery is restricted to approved test addresses. The site owner needs to connect an email provider.";
    hint =
      "Configure custom SMTP in Supabase to send codes to other addresses.";
  } else if (["email_provider_disabled", "otp_disabled"].includes(code)) {
    message =
      "Email sign-in isn't enabled for this app yet. Please use Google or GitHub.";
    hint =
      "Enable the Email provider and email OTP in Supabase Authentication settings.";
  } else if (code === "signup_disabled") {
    message = "New accounts aren't enabled right now. Try an existing account.";
    hint = "Enable new user signups in Supabase Authentication settings.";
  } else if (code === "email_address_invalid") {
    message =
      "This email address can't receive sign-in codes. Please use a real email address.";
    hint = "Supabase does not accept some example or disposable email domains.";
  } else if (
    /error sending (confirmation|magic link|recovery|email)|smtp|email.*(send|deliver).*fail/i.test(
      reason,
    )
  ) {
    message =
      "We couldn't send your verification email. The email service needs attention; please use Google or GitHub for now.";
    hint =
      "Check Supabase Authentication logs and Email → SMTP Settings. Verify the Resend sender domain and SMTP credentials.";
  } else if (
    /database error (saving|creating|updating) (new )?user/i.test(reason)
  ) {
    message =
      "We couldn't finish setting up your account. Please contact the site owner.";
    hint =
      "Check Supabase Auth/Postgres logs and the auth.users profile-creation trigger.";
  } else if (
    name === "AuthRetryableFetchError" ||
    /failed to fetch|fetch failed|networkerror|network request failed/i.test(
      reason,
    )
  ) {
    message =
      "Couldn't reach the sign-in service. Check your internet connection and try again.";
    hint =
      "Check the Supabase project URL, project availability, and browser network response.";
  } else if (status === 401 || (status === 403 && /api.?key/i.test(reason))) {
    message =
      "Sign-in isn't configured correctly. Please contact the site owner.";
    hint =
      "Check that the public Supabase URL and publishable key belong to the same project, then restart Next.js.";
  } else if (code === "captcha_failed") {
    message = "Sign-in verification failed. Please try again.";
    hint =
      "CAPTCHA is enabled in Supabase; a valid captchaToken must be supplied by the sign-in form.";
  } else if (operation === "send-code" && status && status >= 500) {
    message =
      "The sign-in service couldn't send your code. Please try again shortly.";
    hint =
      "Check Supabase Authentication logs for the email provider or database error.";
  }
  return { message, hint, code, status, operation };
}
