# Focused website

Plain HTML, CSS and JavaScript. No build step: open `index.html` in a browser to see it.

| File | What it is |
|---|---|
| `index.html` | Home page |
| `shuls.html` | For shuls: the door devices, setup, pricing and the request form |
| `404.html` | Shown by GitHub Pages for an address that doesn't exist |
| `css/style.css` | All the styles. The colours come from the app's `Colors.xaml` |
| `js/main.js` | The phone menu, the footer year and the request form |
| `img/` | Logo, browser-tab icon, app icon, and the image shown when the link is shared |

## Placeholders to fill in

Search the files for `[` to find them all.

| Placeholder | Where | What to put |
|---|---|---|
| `[YOUR-DOMAIN]` | Both pages (top of the file, footer), `shuls.html` form | Your domain, e.g. `getfocused.app`. Also used in the emails `support@` and `shuls@` |
| `[TESTER-GROUP-LINK]` | `index.html`, "Join the tester group" button | The Google Group or Play Console "Join on the web" link |
| `[BATTERY ANSWER]` | `index.html`, battery question | A sentence from your own battery testing |
| `[PRICE PER ENTRANCE]` | `shuls.html`, twice | Price for one entrance (inside + outside device) |
| `[PRICE PER EXTRA ENTRANCE]` | `shuls.html` | Price for an extra outside device |
| `[BATTERY LIFE]` | `shuls.html` | How long the batteries last |
| `[EVERY N MONTHS]` | `shuls.html` | How often batteries are replaced |
| `[WHO REPLACES THEM, AND WHAT IT COSTS]` | `shuls.html` | Who changes the batteries and the cost |
| `[N]` | `shuls.html`, "get back to you within [N] days" | Your reply time |

## The request form

GitHub Pages can't receive a form. Until you set up a form service, "Send request" opens the visitor's email app with the request filled in, addressed to `shuls@[YOUR-DOMAIN]`.

To receive requests directly instead: make a free form at formspree.io, copy its address (`https://formspree.io/f/...`) and paste it into `data-endpoint=""` on the `<form>` in `shuls.html`.

## Putting it online (GitHub Pages)

1. Create a **new** GitHub repository for the site (e.g. `focused-website`). Don't use the app's repository: free GitHub Pages needs the repository to be public.
2. Upload everything in this folder to it.
3. Repository → Settings → Pages → Source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Same page, **Custom domain**: type your domain and save. GitHub adds a `CNAME` file.
5. At your domain registrar, add the DNS records GitHub shows on that page. When the check passes, tick **Enforce HTTPS**.

Leave the `focused-privacy` repository alone: every installed copy of the app downloads `access.json` and `devices.json` from it, and Play Console links to the privacy policy there.

## Before it goes public

- **File the provisional patent first.** The "How it works" section describes the two door devices.
- **Update the privacy policy** so it says location is sent to the shul directory. The site links to it.
- **After Google Play approves production**, change "Join the test" to Google's official "Get it on Google Play" badge, linking to `https://play.google.com/store/apps/details?id=com.joshgrosinger.focused`.
