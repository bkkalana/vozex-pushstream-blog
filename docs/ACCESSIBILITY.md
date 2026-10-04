# Accessibility and Responsive QA

PushStream targets WCAG 2.2 AA for public and admin interfaces.

## Implemented baseline
- Skip links for public and admin layouts.
- Strong `:focus-visible` indicators and forced-colors support.
- `prefers-reduced-motion` support.
- Minimum 44px touch-target utility and 48px form-control baseline.
- Focus-trapped Dialog and Sheet components with Escape close, background scroll lock, initial focus and focus restoration.
- Keyboard-visible mega menus using `:focus-within` in addition to pointer hover.
- Mobile navigation exposes `aria-expanded` and `aria-controls` and supports Escape close.
- Search suggestions expose combobox/listbox semantics and arrow-key active-option movement.
- Responsive tables are keyboard-focusable scroll regions.
- Public layout has one primary main landmark; article nested-main defect removed.
- Loading states use `aria-busy` and live form messages use `aria-live` where implemented.

## Manual release checks
Run keyboard-only checks at 320, 375, 768, 1024, 1440 and 1920 CSS pixels. Verify focus never disappears, no controls are unreachable, menus/dialogs can close with Escape, table overflow is discoverable, and no page-wide horizontal overflow appears.

Use browser accessibility tree plus axe/Lighthouse on representative public and admin routes. Automated scores are evidence, not a substitute for manual keyboard, zoom, contrast and screen-reader review.

Test 200% browser zoom and OS high-contrast/forced-colors where available. Verify text can reflow without clipped controls or two-dimensional page scrolling (data tables may scroll within their labelled region).
