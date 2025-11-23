import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { cors } from "@elysiajs/cors";
import { auth } from "./auth";

// --- OpenAPI Merge (elysia-better-auth.md Pattern) ---
// Extracts the better-auth schema to merge it with the main openapi schema
let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>;
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema());

const OpenAPI = {
  getPaths: (prefix = "") =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null);
      for (const path of Object.keys(paths)) {
        const key = prefix + path;
        reference[key] = paths[path];
        for (const method of Object.keys(paths[path])) {
          const operation = (reference[key] as any)[method];
          operation.tags = ["Auth"]; // Groups all auth routes under the "Auth" tag
        }
      }
      return reference;
    }) as Promise<any>,
  components: getSchema().then(({ components }) => components) as Promise<any>,
} as const;
// --- End of OpenAPI Merge ---

// --- Authentication Macro (elysia-better-auth.md Pattern) ---
// This gives us the ability to use `{ auth: true }` to protect routes
const authPlugin = new Elysia({ name: "better-auth-plugin" })
  .use(
    cors({
      origin: "http://localhost:4242", // Your frontend
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .mount(auth.handler) // Mounts the /api/auth/* routes
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });
        if (!session) return status(401); // Unauthorized
        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });
// --- End of Authentication Macro ---

// --- Main Application ---
const app = new Elysia()
  // 1. Use the authentication plugin (which includes CORS and .mount)
  .use(authPlugin)

  // 2. Use the merged OpenAPI plugin
  .use(
    openapi({
      documentation: {
        info: {
          title: "Elysia Nuxt API",
          version: "1.0.0",
        },
        tags: [
          { name: "App", description: "General endpoints" },
          { name: "Auth", description: "Authentication endpoints" },
        ],
        // The merging magic happens here
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    })
  )

  .listen(4243);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);