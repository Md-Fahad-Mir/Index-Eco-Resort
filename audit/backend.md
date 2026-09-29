# Phase 0 — Backend observations

The Laravel source was not available in this session, so everything here is what the
live site exposes. Where the source is needed, it is called out as an open question.

## 1. Stack (leaked by the debug error page on `/about_us`)

- Laravel **8.83.29** on PHP **8.1.34**
- MySQL connection name `mysql`
- Deployed at `<app-root>` (absolute path redacted — it leaked the hosting account name)
- `Facade\Ignition` error page is enabled in production

## 2. ⚠️ `APP_DEBUG=true` in production — fix before launch

Any 404 or 500 returns a full Laravel stack trace. `/about_us` serves a 641KB Ignition
page exposing absolute server paths, framework and PHP versions, the Blade source
around the failure, the SQL that ran, and the controller/route mapping. Every JSON 404
(`/api`, `/admin`, …) returns `{message, exception, file, line, trace}`.

This is an information-disclosure problem independent of the redesign. **Set
`APP_DEBUG=false` and run `php artisan config:cache` on the production host.**
No credentials were exposed in the pages captured here (the Ignition `env` block
carried only `laravel_version`, `laravel_locale`, `laravel_config_cached`,
`php_version`), and none were recorded in this repo.

## 3. Known routes

| Route | Name | Controller | Status |
|---|---|---|---|
| `/about_us` | `who.we.are` | `App\Http\Controllers\Frontend\HomeController@whoWeAre` | **500** |
| `/events/filter` | — | — | 200, JSON |
| `/contact-form/submit` | — | — | 405 on GET (POST only) |
| `/people-leading` | — | — | **500** (the Events breadcrumb "Home" target) |
| `/event-details/{id}` | — | — | **404** (the AJAX filter's card links) |

Models seen in the trace: `App\Models\WhoWeAre`, `App\Models\CoreValue`,
`App\Models\CoreValueImage`.

### The `/about_us` bug

`HomeController@whoWeAre` passes `$data` as an **array**
(`['whoWeAre' => …, 'coreValues' => …]`), but `resources/views/frontend/page/who_we_are.blade.php`
line 27 does `$data->photo_one`. Hence `Attempt to read property "photo_one" on array`.

Queries the route runs (captured from the trace):

```sql
select * from `who_we_ares` order by `created_at` desc limit 1
select * from `core_values` order by `created_at` desc
select * from `core_value_images` where `core_value_images`.`core_value_id` in (18,19,20,21,22,23)
```

So `/about_us` is **not an alias of `/about-us`** — it is a separate route rendering a
different Blade view. `docs/03-ARCHITECTURE.md §3` assumed an alias. The mobile menu
links here, so every mobile visitor who taps "About Us" currently gets a 500.

## 4. The one existing JSON endpoint

```
GET /events/filter?start_date=&end_date=&category_id=
→ { "status": true, "data": [ …full event rows… ] }
```

Returns complete Eloquent rows including `description` HTML and both image paths,
with the `category` relation eager-loaded. Image paths are relative
(`images/admin/events/….jpg`) and the front end prefixes `/storage/`, while the
server-rendered pages use `/public/storage/…`.

With no parameters it returns all 4 events. Ordering appears to be by `id` descending
(4, 2, …) but this is not confirmed against the controller.

**No other JSON API exists.** `/api`, `/api/v1`, `/api/settings`, `/api/events`,
`/api/posts`, `/api/packages`, `/api/gallery` all 404. Results in `audit/api-probe.json`.

## 5. Forms

Both forms on the site post to the same endpoint:

```
POST https://indexecoresort.com/contact-form/submit
Content-Type: application/x-www-form-urlencoded
_token, name, phone, email, address, message
```

| | Contact modal (`#stickyContactForm`) | Contact page form |
|---|---|---|
| Submit | AJAX (jQuery, `preventDefault`) | Normal browser POST |
| `name` | `text`, `required` | `text`, **not** required |
| `phone` | `tel`, `required` | **`number`**, not required |
| `email` | `email`, `required` | `email`, not required |
| `address` | **`hidden`**, always `N/A` | `text`, not required |
| `message` | `textarea`, optional | `textarea`, optional |

The page form shows `*` markers in its design but enforces nothing client-side.
Server-side rules are unknown without the source.

**Not submitted during this audit.** Posting to `/contact-form/submit` would create a
real inquiry and possibly send mail, so the success/redirect behavior of the page form
and the server validation rules remain open questions for the owner.

## 6. Other infrastructure notes

- No `/sitemap.xml`, no `/robots.txt` (both 404).
- `/admin` and `/login` 404 — the admin panel is at some other path (ask the owner).
- `/public/storage` 301-redirects; media is served from `/public/storage/images/...`.
- Every page carries `<meta name="csrf-token">`, so the CSRF token is available to JS.
- Every inner page's Blade layout emits `</body></html>` **before** the page content,
  so all inner pages are malformed. Browsers recover, but parsers place late elements
  (e.g. `.footer-bottom`) outside their intended ancestors.
- Two images are hotlinked from `demo.awaikenthemes.com` (a WordPress theme demo):
  the testimonial avatar and the CTA strip avatar.

## 7. What is needed from the owner

1. Laravel source location, to confirm controller queries/ordering and validation rules.
2. Whether read-only `/api/v1/*` endpoints may be added (architecture §5.3).
3. The admin panel URL.
4. The intended booking-form PDF (the current link has no file path).
5. Confirmation that `APP_DEBUG=false` will be set before cut-over.
