# Craftifyle — Dev Log & Feature Documentation

**Live site:** https://craftifyle.business  
**Repo:** https://github.com/JMS255/Jamesignacio-portfoliowebsite  
**Stack:** Next.js 16.2.6 (App Router) · React 19 · TypeScript · Tailwind v4 · Supabase · Vercel  
**Owner:** James Ignacio

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16.2.6 with App Router |
| Frontend | React 19, TypeScript, Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |
| Forms | Formspree (`maqkqlag`) |
| Analytics | Google Analytics 4 (`G-0ZKD4Y3PF6`) |
| Fonts | Inter (body), Playfair Display Italic (accents) |

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase writes (secret) |
| `ADMIN_SECRET` | Protects `/api/admin/*` routes |
| `NEXT_PUBLIC_SITE_URL` | Site URL for redirects |
| `XENDIT_SECRET_KEY` | Dormant — Xendit replaced by manual GCash |
| `XENDIT_WEBHOOK_TOKEN` | Dormant |

---

## Pages

| Route | Type | Description |
|---|---|---|
| `/` | Static | Full landing page — 9-section funnel |
| `/about` | Static | James bio + story |
| `/blog` | Static | MDX blog index |
| `/blog/[slug]` | SSG | Individual blog posts |
| `/gallery` | Static | Photo gallery with Supabase-powered lightbox |
| `/booking` | Static (Client) | Conversational multi-step booking wizard |
| `/booking/success` | Static | Post-booking confirmation screen |
| `/booking/paid` | Dynamic | Xendit payment result (dormant) |
| `/inquiry` | Static | Freelance inquiry form |
| `/referral` | Static (Client) | Public code lookup — clients enter phone to find their codes |
| `/admin/confirm` | Static (Client) | Admin-only — confirm GCash payments, generate codes |

---

## Landing Page Sections (in order)

1. **PromoBanner** — sticky top banner with active promo
2. **Nav** — 4 links: Services, Work, Blog, About + Book CTA
3. **Hero** — headline, subhead, dual CTAs
4. **StatsStrip** — social proof numbers
5. **CraftifyleServices** — photobooth + photography packages
6. **HowItWorks** — 3-step booking explainer
7. **Pricing** — package pricing cards
8. **Work** — portfolio / past events
9. **Testimonials** — client reviews
10. **BioStrip** — James intro
11. **FreelanceServices** — content creation, social media etc.
12. **FAQ** — common questions
13. **Availability** — calendar from Supabase/Google Calendar
14. **Contact** — contact form
15. **NowStrip** — what James is currently working on
16. **Footer** — copyright + referral link + back to top

---

## Booking Wizard (`/booking`)

Conversational multi-step form. Steps vary by intent:

| Step | Content |
|---|---|
| 1 | Service intent — Photobooth / Photography / Bundle / Unsure |
| 2 | Date picker with Google Calendar availability check |
| 3 | PAX / headcount (photography only) — auto-selects pricing tier |
| 4 | Duration — hours slider |
| 5 | Add-ons — magnet prints with quantity + cost calculator |
| 6 | Contact — name, phone, event type chips, time, venue + promo/referral code inputs |
| 7 | Success screen — booking ref, GCash deposit instructions, referral callout |

**Pricing logic:**
- Photobooth base: ₱3,500 + ₱1,000/extra hr
- Photography: ₱3,500–₱4,500 by PAX tier
- Bundle: photobooth + photography, extra hrs at ₱800/hr
- Magnets: ₱12.50/pc under 100, ₱10/pc at 100+

**Payment flow:**
- Form submits to Formspree → email notification to James
- Simultaneously saves to Supabase `pending_bookings`
- Client manually sends ₱500 GCash deposit to 0993-632-4512
- James confirms via `/admin/confirm`

---

## Discount / Promo Code System

All codes validate through `lib/checkout.ts → calculateCheckout()`.

| Code type | Format | Amount | Applies to |
|---|---|---|---|
| Welcome back (past clients) | `WELCOMEBACK-NAME-XXXX` | ₱500 | Any package, one-time |
| Referral code discount | 8-char alphanumeric | ₱200 single / ₱500 bundle | Dynamic by package |
| New client personal promo | `PROMO-XXXXXXXX` | ₱200 | Any package, one-time |
| Referrer voucher | `VCH-XXXXXXXX` | ₱200–₱500 | Any package, 6-month expiry |

**Stacking:** Promo code + referral code can stack. Applied in order: promo first, then referral.

---

## Referral System

### Flow
1. Client books + pays GCash deposit
2. James confirms at `/admin/confirm` → 3 codes generated:
   - Client's **sharable referral code** (friends use this for discount)
   - Client's **personal promo code** (₱200 off their next booking)
   - **Referrer's voucher** (if this booking used someone's referral code)
3. James DMs codes to client on Messenger
4. Client can look up codes anytime at `/referral` using their phone number

### Code lookup
- `/referral` — public, phone-number lookup
- `/admin/confirm` → Look Up section — admin view, shows all codes + status (active/used/inactive)
- Both accept `09xxx` and `+63xxx` phone formats

### Supabase Tables
| Table | Purpose |
|---|---|
| `pending_bookings` | Booking data saved at form submit, confirmed flag flipped by admin |
| `referral_codes` | Sharable referral codes per client |
| `referral_uses` | Audit log of referral code usage |
| `promo_codes` | All promo/voucher/welcome codes. `owner_phone` column = personal codes |

---

## Admin Tools (`/admin/confirm`)

Protected by `ADMIN_SECRET` env var. Not linked from public site.

**Section 1 — Confirm Booking**
- Input: Booking Ref
- Output: client referral code + personal promo code + referrer voucher (if applicable)

**Section 2 — Generate Welcome Code**
- Input: client name + phone
- Output: `WELCOMEBACK-FIRSTNAME-XXXX` (₱500, one-time)
- Used for past clients re-engagement campaign

**Section 3 — Look Up Client Codes**
- Input: phone number
- Output: all promo codes + referral codes tied to that number with status

---

## API Routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/validate-codes` | POST | None | Validate promo/referral at checkout |
| `/api/referral/save` | POST | None | Save pending booking to Supabase |
| `/api/referral/lookup` | GET | None | Public phone lookup for codes |
| `/api/admin/confirm-booking` | POST | ADMIN_SECRET | Confirm payment, generate all codes |
| `/api/admin/generate-welcome-code` | POST | ADMIN_SECRET | Generate WELCOMEBACK code for past client |
| `/api/admin/lookup-codes` | GET | ADMIN_SECRET | Admin code lookup by phone |
| `/api/calendar` | GET | None | Proxy Google Calendar availability |
| `/api/checkout` | POST | None | Dormant — was Xendit invoice creation |
| `/api/xendit/webhook` | POST | XENDIT_WEBHOOK_TOKEN | Dormant — Xendit replaced by manual GCash |

---

## Changelog

### June 2026
- `feat` Add code lookup section to admin page
- `feat` Greet returning clients when WELCOMEBACK code is applied at checkout
- `fix` Move admin secret to shared field at top of confirm page
- `feat` Dynamic referral discounts (₱200 single / ₱500 bundle) + personal promo codes + welcome code generator
- `feat` Add referral code link to footer
- `fix` Referral lookup accepts both 09... and +639... phone formats
- `feat` Referral system — voucher rewards + admin confirm flow + public lookup page
- `fix` Writing and About nav links (#blog/#about → /blog /about)
- `fix` schema.org — add phone number, rename Photobooth Rental → Service
- `fix` Correct GCash number to 0993-632-4512
- `feat` Swap Xendit button for manual GCash deposit instructions (launch-ready)
- `fix` Success screen total reflects applied discount
- `feat` Package restriction on promo codes (applies_to field)
- `feat` Discount reflected in booking summary — strikethrough + amber discounted total
- `fix` Move promo/referral inputs to Step 6 where phone is already filled
- `feat` Discount + referral stacking checkout backend
- `fix` Move BookingHeader outside BookingPage — fixes input focus loss on keystroke
- `feat` Event type chips, time + venue fields in booking contact step
- `fix` PAX step — remove prices, add custom headcount input with auto-tier
- `feat` Conversational booking wizard + freelance inquiry page
- `feat` Add /about page

### Earlier 2026
- `feat` Homepage UX restructure — intentional 9-section flow
- `feat` MDX blog system with 3 posts
- `feat` Gallery page with Supabase photo viewer + lightbox
- `feat` SEO overhaul — meta tags, LocalBusiness schema, sitemap, robots.txt
- `feat` Google Calendar availability integration
- `feat` Promo popup + promo banner
- `feat` Mobile responsiveness fixes across booking, gallery, stats
- `feat` Initial Next.js migration from static site

---

## Key Files Reference

| File | Purpose |
|---|---|
| `lib/checkout.ts` | All discount/referral logic, code generators, DB write helpers |
| `app/booking/page.tsx` | Full booking wizard — all 7 steps |
| `app/admin/confirm/page.tsx` | Admin UI — confirm, welcome codes, lookup |
| `app/referral/page.tsx` | Public referral code lookup |
| `components/Nav.tsx` | Site navigation |
| `components/Footer.tsx` | Footer with referral link |
| `app/layout.tsx` | Root layout — fonts, GA4, schema.org JSON-LD |
| `app/sitemap.ts` | Auto-generated sitemap |

---

## Case Study Notes

This site is James's own case study on whether a website is viable for small local service businesses in Zamboanga City, Philippines.

**Hypothesis:** A booking website with promo codes and a referral system can convert local clients who are accustomed to booking via Facebook Messenger.

**Known findings so far:**
- ~50% of GA traffic is from USA — likely bot/crawler traffic, not real clients
- Real target audience is ~40% PH traffic
- Most actual bookings still come via Messenger
- Referral system launched June 2026 — results pending
