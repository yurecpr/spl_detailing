# Plan: Add Elektronik Check (GRATIS) to All Service Packages

## Goal
Add "🎁 Elektronik Check inkl. Ausdruck – GRATIS" as the last list item to all 6 service packages in `index.html`.

## Target File
`d:\SpeedLabor\Deteiling\index.html`

## Packages & Anchor Points

| Package | Section | Last existing `<li>` to insert after |
|---|---|---|
| Innen Standard | Innenreinigung | `<li>Innenspiegel reinigen</li>` |
| Innen Premium | Innenreinigung | `<li>Türdichtungen reinigen & pflegen</li>` |
| Innen Deluxe | Innenreinigung | `<li>Desinfektion mit Dampfreiniger</li>` |
| Außen Standard | Außenreinigung | `<li>Außenspiegel reinigen</li>` |
| Außen Premium | Außenreinigung | `<li>Insekten intensiv entfernen</li>` |
| Außen Deluxe | Außenreinigung | `<li>Auspuffblenden polieren</li>` |

## HTML to Insert (after each anchor above)
```html
<li class="card__list-gift">🎁 Elektronik Check inkl. Ausdruck – <strong>GRATIS</strong></li>
```

## CSS to Add (in `css/style.css`)
```css
.card__list-gift {
  color: #FFD700;
  font-weight: 600;
  border-top: 1px solid rgba(255,215,0,0.2);
  margin-top: 0.5rem;
  padding-top: 0.5rem;
}
```

## Commit Message
`Add free Elektronik Check gift item to all 6 service packages`

## Notes
- `insert_edit_into_file` and `run_in_terminal` were disabled at time of planning — re-enable to execute.
- Emoji 🎁 (U+1F381) must be saved as UTF-8.
