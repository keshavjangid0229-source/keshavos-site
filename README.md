# KeshavOS

Keshav Jangid’s browser desktop portfolio. [Open the desktop](https://keshavos-site.vercel.app/) or [read the plain portfolio](https://keshavos-site.vercel.app/about.html).

Run `python -m http.server 8000` from this folder and open `http://localhost:8000`. The static site needs no build or environment variables for the portfolio.

- `index.html` contains the desktop and app templates. `desktop.css` styles the shell and `portfolio.css` styles portfolio content.
- `desktop.js` manages windows. `apps.js`, `mobile.js`, and `guestbook-contact.js` handle built-in apps, the mobile shell, and React widgets.
- `portfolio.js` holds project content shared by the desktop and `about.html`. `workspace.js` adds project and profile apps. `search.js` handles Spotlight.
- Desktop search opens with Ctrl+K or Command+K. Mobile uses the Search button on the home screen.
- Ask Keshav answers from built-in portfolio information. Guestbook signatures stay in the current browser. Existing React widgets and embedded media load their browser dependencies over the internet.
