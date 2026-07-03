import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // "site" is excluded — /site/[client]/[locale] is a separate root layout
  // with its own (non-next-intl) locale handling, see
  // src/app/site/[client]/[locale]/layout.tsx.
  matcher: ["/((?!api|trpc|_next|_vercel|site|.*\\..*).*)"],
};
