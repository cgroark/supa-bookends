# Book Ends

A full stack application to track what you read and see the books your friends pick up, this project was built with Angular/TypeScript and RESTful API architecture.

## Overview

With full CRUD capabilities built with RESTful architecture and a PostgreSQL database on Supabase, users can search, add, edit, delete, and view all their books and the books of their friends. They can search for new friends and follow/un-follow any other user.

Project provides full authentication: users can sign up and create a password. Sign up and verify via email from Supabase then sign in for full access.

### Features
 - Authentication: username/password, email verification via Supabase
 - Search for any book on the internet (Google Books API)
 - View, add, edit, delete your books
 - Search for friends and add them to the ones you follow to see their books
 - See latest bestsellers (NYT API)

### Technology
 - Angular
 - TypeScript
 - PostgreSQL
 - RESTful API architecture
 - Supabase database and auth
 - HTML/SCSS
 - Bootstrap
 - Google Books API
 - NYT Books API
 - Netflify hosting


### Shared UI styles

Buttons use the shared primitive and palette variants in `frontend/src/styles/partials/_buttons.scss`. Keep using the existing `main-teal-button`, `main-purple-button`, outline, and circular button classes; adjust palette mixins there for future iterations. Native fields and ng-select controls share `frontend/src/styles/partials/_forms.scss`, including focus, invalid, and disabled states. App styles load after vendor styles so these primitives can override Bootstrap without duplicating component rules.

Content loading uses `app-skeleton` variants (`reading`, `shelf`, `friend`, `goal`, `heading`) with optional `count`, `compact`, `framed`, and accessible `label` inputs. Choose the variant that matches the loaded layout and let the same loading flag replace it with real content. Cover placeholders preserve the 2:3 book ratio and mobile shelf columns. Shimmer respects reduced-motion preferences; keep spinners for submissions and in-progress button actions.

Shared page cards, section headings, mobile book shelves, and sticky section navigation live in `frontend/src/styles/partials/_surfaces.scss`, used across Home, Friends, and Book List.

### Book pagination

Supabase shelves use `BookService.getBookPage` with user/status/date filters, an explicit limit/offset, exact response counts, and a stable ID tie-breaker. `BookShelfState` owns loading, cancellation, retries, deduplication, and the next offset; `app-book-shelf` renders the same preview and View more controls across pages. Resetting a filter cancels pending requests and starts at offset zero. Failed next pages keep the loaded books and retry the same offset.

Home requests one current read and six latest books. Friend previews request three current reads, then three latest books (six when there are no current reads; two on the Friends page). Library sections and completion-year groups start with six books, then load twelve at a time. Goal progress uses a separate HEAD count query and is never calculated from a filtered page. Book-search duplicate checks fetch only title/author metadata for the current search results. NYT bestsellers retain their existing disclosure because that API documents fixed pagination steps of twenty, with no six-book page-size parameter.

### Password recovery

Login includes **Forgot password?**, which sends an email through Supabase `resetPasswordForEmail`. The email redirects to the public `/reset-password` route. The page waits for the SDK to process the recovery callback and verifies the recovery user before allowing `updateUser({ password })`. A successful change clears the recovery/app login state and returns the user to login. Recovery state can survive a page refresh in the same tab, but an ordinary signed-in session alone does not unlock the form.

In Supabase Dashboard → Authentication → URL Configuration, allow the exact recovery URL for each deployment, for example `https://your-site.example/reset-password` and `http://localhost:4200/reset-password` for local development. The app derives the redirect from its own base URL. Keep the recovery email template's Supabase confirmation link (or another correctly configured recovery template). No dashboard settings or email templates are changed by this code. Browser tests mock email sending; verify the full email-link flow with a test account after the redirect URL is allowed.
