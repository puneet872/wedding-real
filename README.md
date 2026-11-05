# आशीष संग सपना — wedding invitation (groom's side)

The invitation website for Ashish & Sapna's wedding, from the Gond family of Bairidih, Lalganj, Azamgarh.

- **Tilak & feast:** Thursday 26 November 2026, evening, at home in Bairidih.
- **Haldi:** Saturday 28 November, at home.
- **Mehendi:** Sunday 29 November, at home.
- **Baraat:** Monday 30 November 2026. It sets off at 4:00 PM for Heritage Marriage Hall, Sanjarpur, Sarai Mir.

Live at https://ashish-weds-sapna-2026.vercel.app/ (the older wedding-real-teal.vercel.app link forwards there).

It's made from the WI wedding template (`puneet872/WI`), which stays separate.

## Changing things

Everything is in `assets/config.js`: names, the card's wording, the events, the family names, the phone number and the section switches. There's no build step. Open `index.html`, or push to GitHub and Vercel updates the site.

## The link preview

When the link is shared on WhatsApp, the preview shows `art/share.jpg`. To change it, edit `tools/share-card.html`, open it at exactly 1200 × 630 and save a screenshot over `art/share.jpg`. The address in `index.html`'s `og:` tags must match the live site.
