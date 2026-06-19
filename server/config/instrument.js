// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from "@sentry/node"

Sentry.init({
  dsn: "https://ed32e98db2678b240073c072d9655bb4@o4509638721077248.ingest.us.sentry.io/4509638725402624",
  integrations:[Sentry.mongoIntegration()],

  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});