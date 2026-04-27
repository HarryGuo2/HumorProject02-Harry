# Humor Project Admin Panel QA Plan

Deployment tested: https://humor-project02-harry.vercel.app/

## Test Plan

### Public Access and Authentication

- Visit the public landing page and confirm the Humor Project Admin Portal branding, security messaging, and Google authentication button render correctly.
- Click `Authenticate with Google` and confirm the app starts the Google OAuth flow with the expected callback target.
- Visit protected admin routes while logged out and confirm each redirects to the login page with `Please login to access admin panel`.
- Log in with an authorized superadmin Google account and confirm `/admin` loads the authenticated dashboard instead of redirecting.
- Sign out from the dashboard and confirm the session returns to the public login flow.

### Dashboard

- Confirm dashboard summary metrics render for total users, images, captions, and votes.
- Confirm weekly delta badges, chart cards, recent activity, top performers, and quick action cards render without runtime page failures.
- Confirm the dashboard works at narrow viewport sizes without clipping important navigation or welcome-card text.
- Confirm the dashboard navigation menus are visible and usable for Content, Humor, AI/LLM, and Settings areas.

### Content Management Branches

- Open `/admin/users` and verify the user table, search input, role filter, and role action buttons render.
- Open `/admin/images` and verify image records, upload entry point, search, visibility filter, edit controls, and delete controls render.
- Open `/admin/captions` and verify caption records, search, sorting, featured filter, and details controls render.
- Open `/admin/caption-requests` and verify request metrics, gallery/table controls, search, filter, sorting, and pagination render.
- Open `/admin/caption-examples` and verify examples, add/edit/delete controls, and search render.
- Open `/admin/ratings` and verify vote summary, sentiment split, daily activity, rating distribution, top captions, controversial captions, and active raters render.

### Humor System Branches

- Open `/admin/humor-flavors` and verify flavor stats, card/table view toggle, search, filter, sort, and pagination render.
- Search humor flavors by a known term, such as `columbia`, and confirm results update.
- Toggle from card view to table view and confirm the view changes without navigation or runtime errors.
- Open `/admin/humor-steps` and verify add/edit/delete controls plus search render.
- Open `/admin/humor-mix` and verify mix rows, add/edit/delete controls, and search render.

### AI and LLM Branches

- Open `/admin/llm-providers` and verify provider rows and add/edit/delete controls render.
- Open the add-provider form and cancel it without saving to confirm the create/cancel branch works without mutating data.
- Open `/admin/llm-models` and verify model rows and add/edit/delete controls render.
- Open `/admin/llm-chains` and verify chain rows, search, add/edit/delete controls render.
- Open `/admin/llm-responses` and verify response rows, search, model filter, add/edit/delete controls render.

### Settings Branches

- Open `/admin/terms` and verify glossary terms, add/edit/delete controls, and search render.
- Open `/admin/signup-domains` and verify allowed domain rows and add/edit/remove controls render.
- Open `/admin/whitelist-emails` and verify individual email rows, bulk add, add/edit/remove controls, and search render.

### Build and Regression Checks

- Run `npm run lint` and confirm there are no lint errors.
- Run `npm run build` and confirm the production build completes successfully.
- Check browser console while walking authenticated admin pages and investigate runtime or hydration warnings.
- Check route guard behavior repeatedly to confirm protected paths never leak admin content while logged out.

## Post-Testing Write-Up

- Tested the deployed public landing page, Google OAuth entry point, and logged-out route guard behavior for all 17 protected admin routes; all protected routes redirected correctly in three repeated sweeps.
- Logged in as a superadmin and verified the authenticated dashboard loads live metrics, charts, recent activity, top performers, quick actions, and management navigation.
- Walked the authenticated admin branches for users, images, captions, caption requests, caption examples, ratings, humor flavors, humor steps, humor mix, LLM providers, LLM models, LLM chains, LLM responses, terms, signup domains, and whitelist emails.
- Tested non-destructive interactions including humor flavor search, card-to-table view switching, and opening/canceling the add-provider form; these flows worked without saving test data.
- Found a mobile/narrow viewport layout issue where the dashboard navigation and welcome-card text could clip horizontally; fixed the dashboard header and welcome section to wrap and scale better on smaller screens.
- Found that `npm run lint` failed because ESLint 9 expected a flat config file; added `eslint.config.mjs` with Next.js core web vitals and TypeScript rules so lint runs successfully.
- Found repeated React hydration text-mismatch warnings on the deployed admin pages, likely from server/browser locale formatting differences; normalized local date and number formatting to deterministic `en-US` output and verified the code still passes lint and production build.
- Verified `npm run lint` now exits with warnings only and `npm run build` completes successfully for the full app route set.
