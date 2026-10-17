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
