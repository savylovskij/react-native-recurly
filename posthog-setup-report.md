<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Recurly Expo app. PostHog is initialized via a dedicated `lib/posthog.ts` config file using `expo-constants` to read credentials from `app.config.js` extras. A `PostHogProvider` wraps the root layout with autocapture enabled for touches, and manual screen tracking is wired to Expo Router's `usePathname`. Users are identified on sign-in and sign-up using their Clerk session ID. 11 events are tracked across 6 files.

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully completed sign in | `app/(auth)/sign-in.tsx` |
| `sign_in_failed` | Sign in attempt encountered an error | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | Account created after email verification | `app/(auth)/sign-up.tsx` |
| `sign_up_failed` | Account creation attempt failed | `app/(auth)/sign-up.tsx` |
| `email_verification_sent` | Verification code email sent after registration | `app/(auth)/sign-up.tsx` |
| `email_verification_failed` | Email verification code was incorrect or expired | `app/(auth)/sign-up.tsx` |
| `verification_code_resent` | User requested a new verification code | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User confirmed sign out | `app/(tabs)/settings.tsx` |
| `subscription_card_expanded` | User expanded a subscription card on the home screen | `app/(tabs)/index.tsx` |
| `subscription_details_viewed` | User navigated to subscription detail page | `app/subscriptions/[id].tsx` |
| `onboarding_viewed` | User arrived at the onboarding screen | `app/onboarding.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard**: [Analytics basics](https://eu.posthog.com/project/151220/dashboard/597748)
- **Sign-up conversion funnel** — email verification → account created: [G1yb4bth](https://eu.posthog.com/project/151220/insights/G1yb4bth)
- **Sign-in success vs failure** — daily successful vs failed sign-ins: [LUelnrG5](https://eu.posthog.com/project/151220/insights/LUelnrG5)
- **New sign-ups over time** — daily new user registrations: [2p26qK1y](https://eu.posthog.com/project/151220/insights/2p26qK1y)
- **Subscription engagement** — card expansions and detail views: [COnTwKkF](https://eu.posthog.com/project/151220/insights/COnTwKkF)
- **User churn — sign-outs** — daily sign-out count: [4pOmhDLq](https://eu.posthog.com/project/151220/insights/4pOmhDLq)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
