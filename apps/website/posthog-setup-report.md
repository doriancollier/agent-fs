# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into your Next.js 16 application. The integration includes:

- **Client-side initialization** via `instrumentation-client.ts` (the recommended approach for Next.js 15.3+)
- **Server-side PostHog client** in `src/lib/posthog-server.ts` for backend event tracking
- **Reverse proxy configuration** in `next.config.ts` to route analytics through your domain and avoid ad blockers
- **User identification** on successful sign-in with email and name properties
- **Session reset** on sign-out to properly unlink user sessions
- **Exception capture** for error tracking throughout the authentication flow
- **Automatic pageview and exception tracking** via PostHog defaults

## Events Implemented

| Event Name | Description | File |
|------------|-------------|------|
| `sign_in_started` | User started the sign-in flow by submitting their email | `src/layers/features/auth/ui/SignInForm.tsx` |
| `sign_in_email_sent` | OTP email was successfully sent to the user | `src/layers/features/auth/ui/SignInForm.tsx` |
| `sign_in_email_failed` | Failed to send OTP email to user | `src/layers/features/auth/ui/SignInForm.tsx` |
| `otp_verification_started` | User started entering their OTP verification code | `src/layers/features/auth/ui/OtpVerifyForm.tsx` |
| `otp_verification_succeeded` | User successfully verified their OTP and signed in | `src/layers/features/auth/ui/OtpVerifyForm.tsx` |
| `otp_verification_failed` | User entered an invalid OTP code | `src/layers/features/auth/ui/OtpVerifyForm.tsx` |
| `otp_resend_requested` | User requested to resend the OTP code | `src/layers/features/auth/ui/OtpVerifyForm.tsx` |
| `sign_out_clicked` | User clicked the sign out button | `src/layers/features/auth/ui/SignOutButton.tsx` |
| `cookie_consent_accepted` | User accepted cookies via the consent banner | `src/layers/widgets/cookie-consent/CookieConsentBanner.tsx` |
| `cookie_consent_declined` | User declined cookies via the consent banner | `src/layers/widgets/cookie-consent/CookieConsentBanner.tsx` |
| `theme_toggled` | User toggled between light and dark theme | `src/layers/widgets/app-sidebar/ui/ThemeToggle.tsx` |
| `error_displayed` | An error page was shown to the user | `src/app/error.tsx` |
| `global_error_displayed` | A global/fatal error page was shown to the user | `src/app/global-error.tsx` |

## Files Created/Modified

| File | Change |
|------|--------|
| `instrumentation-client.ts` | Created - Client-side PostHog initialization |
| `src/lib/posthog-server.ts` | Created - Server-side PostHog client |
| `next.config.ts` | Modified - Added reverse proxy rewrites |
| `src/layers/features/auth/ui/SignInForm.tsx` | Modified - Added sign-in tracking |
| `src/layers/features/auth/ui/OtpVerifyForm.tsx` | Modified - Added OTP verification tracking and user identification |
| `src/layers/features/auth/ui/SignOutButton.tsx` | Modified - Added sign-out tracking and PostHog reset |
| `src/layers/widgets/cookie-consent/CookieConsentBanner.tsx` | Modified - Added cookie consent tracking |
| `src/layers/widgets/app-sidebar/ui/ThemeToggle.tsx` | Modified - Added theme toggle tracking |
| `src/app/error.tsx` | Modified - Added error tracking |
| `src/app/global-error.tsx` | Modified - Added global error tracking |

## Environment Variables Required

Add the following to your `.env` file:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_Qi1LOwwaw3sYlMW7vyo3iyasdMuIls7bH4oOQLbzbnD
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard

- [Analytics basics](https://us.posthog.com/project/302450/dashboard/1182087) - Core analytics dashboard for user authentication, engagement, and error tracking

### Insights

- [Sign-in Funnel](https://us.posthog.com/project/302450/insights/ZSwyKVuo) - Tracks conversion from sign-in attempt to successful OTP verification
- [Authentication Errors](https://us.posthog.com/project/302450/insights/dNHlnpAn) - Tracks sign-in and OTP verification failures over time
- [User Session Activity](https://us.posthog.com/project/302450/insights/UBYna1Rn) - Tracks sign-ins, sign-outs, and session activity
- [Cookie Consent Decisions](https://us.posthog.com/project/302450/insights/UsB9T3ks) - Tracks user decisions on cookie consent banner
- [Application Errors](https://us.posthog.com/project/302450/insights/tLIjWxL2) - Tracks error pages displayed to users

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/posthog-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
