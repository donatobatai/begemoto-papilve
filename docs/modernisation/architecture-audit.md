# 2026 portfolio modernisation: architecture audit

Date: 30 September 2026  
Scope: read-only audit of the repository and the local Docker site at `http://localhost:8080`  
Implementation status: no redesign or application implementation has been started

## Executive recommendation

Rebuild the presentation layer as a small, statically generated Astro site with TypeScript, component-scoped CSS, structured content data, and narrowly scoped GSAP/ScrollTrigger timelines. Do not add React, a client-side router, a smooth-scroll hijacker, or WebGL by default.

This is option **C: a lightweight modern frontend rebuild**, but it should be delivered as a controlled migration rather than a destructive rewrite. The current site remains the visual/content reference and a working fallback until the replacement passes review. Its strongest concepts should be deliberately translated: cinematic media, the brain as a recurring capability map, scene-based storytelling, and the `+` reveal motif. The existing DOM, CSS, inline JavaScript, jQuery plugins, and PHP mail handler should not be carried forward as the foundation.

Why this earns a rebuild:

- The site is small enough that a static build remains simple, but its current 1,389-line HTML document, 2,594-line global stylesheet, fixed 1,320–1,350 px canvas, and many inline event scripts make progressive repair unusually fragile.
- The current interactions depend on jQuery 1.10.2, Modernizr 2.6.2, a 2012 slit-slider, jqBar, duplicated popup handlers, and invalid/non-semantic markup.
- Responsive and accessible behaviour require a new document structure, not breakpoint patches around fixed floats and absolute coordinates.
- Astro can output plain static HTML, keep core content readable without JavaScript, split the page into maintainable components, optimise local assets, and hydrate only the few interactions that need JavaScript. No UI framework is needed.
- GSAP with ScrollTrigger materially improves orchestration of pinned scenes, reversible timelines, breakpoint-specific motion, and cleanup. It should own a few section timelines, not individual fade-ins on every element.
- The brain can be built with layered SVG/HTML and transforms. There is no current interaction that justifies Three.js/WebGL, its runtime cost, or its accessibility complexity.

## What was inspected

- Repository history, tracked/untracked state, all source and configuration files, and the complete asset tree.
- Active page: `index.html`, `css/myweb.css`, all referenced scripts/plugins, media, outbound links, and `send_form_email.php`.
- Legacy/dead candidates: `myweb.html`, `css/style.css`, `barudidejimas`, local jQuery copies, and unused media.
- Docker baseline: `Dockerfile`, `.dockerignore`, the running `begemoto-papilve-local` container, Apache modules, and PHP mail configuration.
- Live behaviour in the browser: hero video, navigation/header, scrolling, proficiency animation, experience expansion, slider navigation, slider detail popup, asset failures, and keyboard/accessibility semantics.
- Responsive rendering at 1440 px, 768 px, 390 px, and the browser's default 845 px viewport.

No form was submitted, no email was sent, and no external system was modified.

## Current architecture

### Page and styling

`index.html` is the active single page. It contains all content plus roughly fifteen inline script blocks. Page areas are a fixed-height sequence:

1. 740 px video hero
2. 700 px profile
3. 700 px skills/capabilities
4. 1,150 px experience and education
5. 700 px portfolio slit-slider
6. 400 px contact footer

`css/myweb.css` is the only active stylesheet. It combines page layout, typography, animation keyframes, slider internals, modal styling, form styling, and social icons. Layout is dominated by floats, absolute positioning, pixel dimensions, and `min-width: 1320px`/`1340px`. `css/style.css` contains another copy of basic slit-slider styles but is not linked.

The document has no viewport meta tag and uses generic `div` containers rather than landmarks such as `main`, `section`, and `footer`. It has invalid structures including lists inside paragraphs, `</br>`, scripts after `</body>`, comma-separated `data-*` attributes, incomplete CSS declarations, and extra/misaligned closing elements.

### JavaScript and plugins

The active page fetches jQuery 1.10.2 from Google and loads local copies of:

- D3 v3, which is not used by the active page.
- jqBar for animated percentage bars.
- Modernizr 2.6.2 custom build.
- jquery.ba-cond, a small conditional helper used by the slider.
- jquery.slitslider 1.1.0 (Codrops, 2012).

`plugins/jquery.js` and `plugins/jquery.min.js` are local jQuery 1.11.1 copies, but neither is referenced. `plugins/easing.js` is also not referenced.

Inline JavaScript handles the slider, five near-identical detail popups, a dormant contact popup, scroll-based header classes, custom anchor scrolling, WebFont loading, sixteen experience/education toggles, four hover functions, skill-bar initialisation, and forced video playback.

### PHP/contact form

`send_form_email.php` is a procedural mail script that expects first name, last name, email, telephone, and comments, validates some values with old regular expressions, constructs headers from the submitted email address, calls suppressed `@mail()`, and always prints a success message afterward.

The HTML form does not include `last_name`, so every real submission reaches the script's missing-field error. The contact popup has no active trigger because the only `.topopout` element is commented out. Its close image, `media/closebw.png`, is also absent.

The PHP 8.3 container reports `/usr/sbin/sendmail -t -i` as its mail path, but no `sendmail` binary exists in the container. Even if the form fields were aligned, mail delivery would fail while the page could still claim success. The handler also lacks CSRF/spam controls, rate limiting, robust header-injection protection, delivery error handling, and an accessible success/error flow. Using visitor input as `From` is likely to cause deliverability/authentication problems.

### Media and assets

The repository is about 60 MB including Git and about 26 MB of media. The hero video is supplied in three real formats:

- MP4: approximately 12 MB
- Ogg/Theora: approximately 6.1 MB
- WebM: approximately 5.7 MB

The five scene backgrounds are already cropped near 1,340/1,350 × 700, and the brain graphics are 600 × 600 transparent PNGs. These are useful visual source material, but several are too resolution-specific for current high-density and responsive displays. The personal photo is only 302 × 445 in the stored file.

The active experience logos are raster assets of inconsistent dimensions. Several newer roles have no matching logo/background rule, so they appear as empty grey rectangles.

Potentially unused by the active page are `media/bgd-third.jpg`, `media/x-icon.png`, grey social variants, Google/press/T social icons, `myweb.html`, `css/style.css`, `barudidejimas`, D3, local jQuery copies, and `easing.js`. Confirm future content needs before removing anything.

### Docker baseline

The newly added baseline is intentionally minimal and currently works:

- `php:8.3-apache`
- complete repository copied to `/var/www/html/`
- Apache changed from port 80 to 8080
- no mounted volumes, health check, or restart policy

The root page returns HTTP 200 from Apache/PHP 8.3. This is suitable as a preserved local baseline, not yet as the ideal production image. It copies documentation, legacy files, source media, and other unnecessary files into the image. The eventual static frontend could use a multi-stage Node build and a small static server, with any contact endpoint deployed separately, but the current Dockerfile should remain untouched until the replacement architecture is approved.

## Existing interaction inventory and disposition

| Existing behaviour | Current implementation and observed state | Decision | Modern interpretation |
| --- | --- | --- | --- |
| Cinematic hero | Fixed, full-width autoplay/muted/loop video under a 2 px grid texture; MP4 plays successfully. Hero is a fixed 740 px rather than viewport-aware. | **Evolve** | Keep the personal cinematic opening, add poster/fallback, `100svh` constraints, art direction, explicit pause control, and reduced/data-saving behaviour. |
| Hero title and Enter | Large centred name/CV text and an anchor that triggers custom jQuery scrolling. | **Evolve** | Stronger editorial type, a concise role/value slot, scroll cue, and native focus-safe anchor navigation. |
| Navigation | Hidden until after the first section; scroll thresholds add multiple header classes. Desktop-only horizontal links. Blog points to a missing page. | **Replace** | Accessible sticky nav with active-section state, recruiter quick links, mobile menu, and no dead destinations. IntersectionObserver can manage section state. |
| Smooth anchor scroll | Old jQuery browser-detection routine animates a guessed scrollable element. | **Replace** | Native `scroll-behavior` only when motion is allowed, with correct focus and `scroll-margin`; no scroll hijacking. |
| Profile | Three floated columns: photo, biography, personal details. | **Evolve** | Preserve the personal portrait and voice, but make an editorial two-column introduction with explicit slots for current summary, location/availability, and CV/contact actions. |
| Capability head | Head silhouette with four positioned rotating hotspot sprites; `mouseover` toggles related text by fading it in/out. | **Evolve** | Make this the main brain/capability map. Use semantic buttons, persistent selected state, click/tap/keyboard parity, and capability-to-evidence links. Hover may preview on pointer devices only. |
| Brain motion | Four CSS rotations use duplicated prefixed keyframes; motion begins on hover. | **Replace implementation / keep concept** | Layered SVG or DOM illustration driven by transforms and one section timeline. Scroll changes orientation/emphasis; selection reveals a capability. Never require motion to understand it. |
| Proficiency bars | jqBar initialises twelve percentage bars after the skills section top is crossed. Live animation works. Values are arbitrary and include dated tools. | **Replace** | Use capability clusters, methods/tools, years/context, recency, or evidence links. Avoid self-scored percentages. |
| Experience cards | Empty `h5` elements act as buttons; background logos identify some roles; broken `plus16.png` appears on every card. jQuery `slideToggle()` reveals paragraphs/lists. | **Evolve concept / replace implementation** | A chronological visual narrative with real headings/dates/roles always visible. Use native buttons/disclosures for evidence, achievements, responsibilities, and links. |
| Education cards | Same non-semantic logo/toggle pattern as experience. | **Replace** | Compact education/certification track integrated after experience; details optional but keyboard accessible. |
| Portfolio slider | Five 700 px scenes with large photography, brain/head graphics, quotations, arrows/dots, and animated split transitions. Arrow navigation works. | **Evolve** | Reinterpret as scroll-led project/capability scenes on desktop, with a stable card/scroll-snap sequence on touch devices. Retain cinematic scene changes without trapping reading in a carousel. |
| Brain movement in slider | 600 px brain graphics roll/rotate in on slide changes. | **Evolve** | Reuse the brain as a visual thread whose layer/position changes between scenes. Movement should express a changed capability, not decorate every transition. |
| Portfolio `+` detail | Five image controls open full-scene overlays using five copied jQuery handlers. In live testing, the visible `+` on slide two did not open its panel. Slit-slider cloning also creates duplicate IDs for slide one. | **Evolve concept / replace implementation** | A consistent “expand evidence” button opening an accessible inline disclosure, drawer, or dialog. URL/deep-link support is desirable for recruiter sharing. |
| Hover states | Navigation opacity, logo background colour, rotating brain hotspots, social opacity, and slider controls. | **Evolve selectively** | Retain meaningful previews and tactile pointer feedback, but provide equivalent focus/pressed states and avoid hiding information behind hover. |
| Contact popup | Form exists in a hidden overlay, but its only trigger is commented out; therefore it is unreachable. | **Remove implementation / replace flow** | Show direct email/LinkedIn actions plus an optional robust form. Do not gate basic contact information behind a modal. |
| Social links | Large background-image icons. Docker serves the referenced uppercase `media/Icons/...` paths as 404 because the real directory is lowercase `media/icons`. Facebook URL also contains `faacebook.com`. | **Replace** | Text-labelled inline SVG icons, current verified URLs, visible focus states, and `rel="noopener noreferrer"` where relevant. |

## Visual and design audit

### What remains distinctive and valuable

- The site opens with personal moving imagery rather than a generic gradient and headshot card.
- Alternation between light editorial sections and full-bleed image scenes creates rhythm.
- The brain is a recognisable personal visual system, not merely an isolated illustration.
- The old slider attempts to connect interests/capabilities to different visual worlds.
- The `+` motif provides a good progressive-disclosure vocabulary.
- Experience is designed to be explored, not presented as a word-processing document.
- The grid overlay, muted photography, limited turquoise/gold accents, and personal assets create a recognisable tone worth refining.

### What makes it feel dated

- Poiret One/Quicksand/Ubuntu are used in a light, low-contrast, “2010s template” manner with weak hierarchy and over-wide measures.
- Many sections use identical fixed heights regardless of content. Empty space, overlaps, clipped text, and awkward vertical jumps result.
- The 1,340 px canvas, floats, tables, grey logo blocks, and absolute offsets visibly expose desktop-era layout assumptions.
- The hero name can crop at the right edge even at desktop widths because sizing and positioning are not content-aware.
- The 2 px texture overlays every cinematic area and reduces media clarity.
- Skill percentages imply precision without evidence and age quickly.
- Logos without visible role/employer labels make the career section cryptic and recruiter-hostile.
- Slider copy is long, small, and placed over busy imagery. The reveal control is a bare image with no label.
- Motion is component-local and mechanically triggered rather than choreographed across a narrative.
- Visual state changes rely heavily on opacity and hover, with almost no focus/active language.

The modern design should therefore be cinematic but editorial: confident display typography, short readable measures, visible facts, restrained texture, stronger contrast, intentional negative space, and motion that explains the relationship between sections.

## Responsive audit

There is effectively no site-wide responsive implementation. The sole media query, at 580 px, adjusts only the hidden contact form.

Observed layout widths:

| Viewport | Document width | Horizontal overflow | Result |
| --- | ---: | ---: | --- |
| 1440 px | 1440 px | 0 px | Intended desktop layout, though some hero text still approaches/crops at the edge. |
| 845 px | 1340 px | 495 px | Desktop page is horizontally clipped. |
| 768 px | 1340 px | 572 px | Three-column profile remains at x=0/365/1035; navigation and content fall off-screen. |
| 390 px | 1340 px | 950 px | Visitor sees only the left 390 px slice of a desktop canvas. Hero, skills table, experience, slider, and footer are unusable. |

Major structural causes:

- Missing `<meta name="viewport">`.
- `body`, header, profile, skills, slider, and footer minimum widths of 1,320–1,350 px.
- Fixed-height sections and absolute positioning.
- Floated columns with fixed 455/670 px widths and 190/200 px paddings.
- A 1,240 px skill table and a 600 px brain graphic with fixed coordinates.
- Hover-only brain controls do not translate to touch.
- Slider text/background composition has no mobile art direction.
- Footer/social content assumes the desktop canvas.

The replacement should not merely stack the desktop layout. On tablet, shorten pin durations and preserve two-column editorial layouts where space allows. On mobile, convert pinned sequences to normal document flow, show capability tabs/cards beneath a compact brain visual, use a vertical career timeline, and render story scenes as swipeable/scrollable cards with all essential text outside imagery.

## Technical debt, breakage, and risk

### Broken or brittle resources

- `blog.html`: linked in active navigation, HTTP 404.
- `media/vbackground.ogv`: referenced, HTTP 404; the real Ogg file is `.ogg`.
- `media/Icons/plus16.png`: referenced 16 times, absent, HTTP 404.
- `media/closebw.png`: referenced by the contact popup, absent, HTTP 404.
- All social CSS references use `media/Icons/...`, while Git contains lowercase `media/icons/...`; these work on a case-insensitive local filesystem but return 404 in Linux Docker.
- `css/myweb.css` references `./media/background.jpg` relative to the CSS directory; the file does not exist and the relative path would be wrong even if it did.
- Form field icons load from three third-party `http://rexkirby.com/...` URLs rather than local/HTTPS assets.
- Facebook is misspelled as `faacebook.com`; Twitter, LinkedIn, and Skype destinations are legacy and must be verified before reuse.

### Obsolete and unnecessary dependencies

- jQuery 1.10.2 from a third-party CDN is a single point of failure and obsolete.
- Local jQuery 1.11.1 is dead duplication.
- D3 v3 is approximately 143 KB and unused.
- Modernizr 2.6.2 and the 2012 slit-slider are no longer appropriate foundations.
- jqBar's effect can be reproduced with a few lines of modern CSS/JS, but the entire percentage model should be retired.
- Four separate Google Font stylesheet requests plus the WebFont loader duplicate font-loading responsibility.

### JavaScript correctness and maintainability

- Popup code is copied five times and inconsistently uses `popoutStatus` and undeclared `popupStatus`, creating accidental globals and unreliable state.
- The dormant contact popup has the same state-variable bug.
- Slit-slider clones markup and produces duplicate IDs at runtime; this undermines selectors, labels, and accessibility.
- Scroll handlers run on every scroll event, repeatedly query layout, and use section heights captured once at load. They are not robust to font/image/layout changes or resized viewports.
- The skill trigger tests only whether scroll position has crossed the top of `#third`, not true visibility.
- Brain details toggle on every `mouseover`, so repeatedly crossing a hotspot can hide the content the visitor is trying to read.
- The header accumulates several `header-past-*` classes simultaneously; CSS cascade order determines the current appearance.
- Forced `video.play()` has no rejection handling or pause lifecycle.
- There is no reduced-motion branch, and looping/rotating motion remains active.

### Accessibility

- No skip link or semantic page landmarks.
- All 32 source `<img>` elements lack `alt` attributes.
- Experience and education controls are empty `h5` elements with click listeners: not keyboard focusable, unnamed, and semantically false headings.
- Brain hotspots and portfolio `+` controls are non-focusable `div`/`img` elements with pointer-only behaviour.
- Slider arrows/dots are `span` elements, not buttons, with no accessible names/state.
- Popups lack dialog semantics, focus management, Escape handling, focus return, background inertness, and usable close buttons.
- Form prompts are `<p for="...">`, not labels; email input is `type="text"`; errors are not associated with fields.
- Colour contrast is often weakened by 0.7 opacity text over moving/busy media.
- Essential information is hidden behind interaction and logos.
- Target-blank links do not use `rel="noopener noreferrer"`.
- No `prefers-reduced-motion` handling.
- No explicit document language.

### HTML/content/search concerns

- The title and metadata are stale and location/role-specific.
- No canonical URL, social preview metadata, structured Person/ProfilePage data, favicon reference, or modern share image.
- `myweb.html` is an older divergent version with different age, location, work history, skill values, HTTP dependencies, and markup. It must not be treated as authoritative content.
- `index.html` itself contains historical personal data through 2021; 2026 content must be provided and verified rather than inferred.
- Copy contains numerous spelling/grammar issues. Content editing should happen only after facts are supplied.

### Performance

- The three hero encodings total about 24 MB in the repository, with a 12 MB MP4 likely selected by the current browser.
- The page eagerly loads full-page imagery, an unused D3 bundle, old plugins, remote jQuery, multiple font stylesheets, and a second font loader.
- Background images cannot use responsive `srcset`/`sizes`; no modern AVIF/WebP variants or explicit preload strategy exist.
- Fixed background video and large animated layers can consume battery/GPU on mobile.
- Scroll handlers cause avoidable layout reads; many animations are not centrally paused when off-screen.

## Proposed modernisation architecture

### Project structure

Proposed shape (names are architectural slots, not an instruction to create them during this audit):

```text
src/
  components/
    SiteHeader.astro
    Hero.astro
    CapabilityMap.astro
    CareerTimeline.astro
    EvidenceDisclosure.astro
    StoryScene.astro
    ContactPanel.astro
  content/
    profile.ts
    capabilities.ts
    experience.ts
    education.ts
    stories.ts
  layouts/
    BaseLayout.astro
  pages/
    index.astro
  scripts/
    motion.ts
    navigation.ts
    disclosures.ts
  styles/
    tokens.css
    global.css
    utilities.css
public/
  media/
```

Use typed data for repeated experience, evidence, capability, and story records. Keep content separate from layout without introducing a CMS. Astro components should render all essential content server-side. JavaScript enhances navigation, selection, dialogs, and motion; it must not be required to read the CV.

If the final hosting environment requires the existing PHP/Apache container temporarily, Astro's static output can be served by Apache while the contact solution is decided. Long term, a static server image and separate form endpoint are cleaner.

### Motion system

Use three layers:

1. CSS transitions/keyframes for small hover, focus, pressed, and ambient effects.
2. IntersectionObserver for lightweight in-view state and navigation highlighting.
3. GSAP + ScrollTrigger for only the hero exit, capability/brain pinned sequence, career narrative, and story-scene transitions.

Create timelines per section, initialise them only at relevant breakpoints, and clean them up through `gsap.matchMedia()`. Animate transforms and opacity; avoid layout properties. Limit simultaneous layers and establish motion tokens for duration, easing, distance, and stagger. Do not add Lenis or another custom scrolling layer unless later testing proves a specific need.

Motion choreography should follow a narrative:

- Hero media establishes identity; title separates as the page begins.
- The portrait/profile resolves quickly into a readable introduction.
- The brain assembles/rotates only as capability groups become active.
- Evidence paths lead into the career timeline.
- Career periods change visual context while dates and roles remain stable.
- Selected case/story scenes reuse the brain layer to show how capabilities combine.
- The closing contact scene becomes calmer and nearly static.

### Brain interaction

Create a responsive capability map from layered SVG or DOM elements, not the current flattened 600 px PNGs alone. Existing PNGs can serve as art direction/reference during the first prototype.

- Four to six capability nodes are real buttons with visible labels or an adjacent labelled list.
- Scroll activates nodes in a predetermined story sequence; manual click/tap/keyboard selection overrides the current node without fighting the scroll timeline.
- The selected node updates one clearly identified detail panel containing a description, methods/tools, and links to supplied career/project evidence.
- Use `aria-pressed` or tabs only if the resulting semantics match the visual model; announce panel changes appropriately.
- Pointer movement may add a small depth response on fine-pointer devices only.
- On mobile, the illustration is compact and non-pinned; capability cards follow in normal flow.
- With reduced motion, show the completed brain and switch selected states instantly or with a short opacity transition.

### Career and evidence interaction

Use a chronological timeline with year/period rail, employer/project, role, location, one-line scope, and supplied highlights always visible. On wide screens a sticky visual/evidence plane may update as the visitor passes periods. On small screens, keep a single vertical document flow.

The modern `+` becomes a labelled evidence disclosure. It can reveal supplied outcomes, responsibilities, artefacts, testimonials, links, or related capabilities. Use a native `<button>` controlling an inline region by default. Use an accessible `<dialog>`/drawer only when the content is substantial and benefits from focused reading. Never hide role, employer, dates, or the primary achievement behind the reveal.

### Story scenes

Replace the carousel as the primary information container with a sequence of two to four curated scenes once real 2026 stories are supplied. A desktop story may be pinned while the text steps scroll; the media and brain layers transition behind it. Tablet uses shorter sticky intervals. Mobile uses normal-flow cards or CSS scroll snap with explicit controls. Every scene must remain understandable as static content.

### Reduced motion and input adaptation

- At `prefers-reduced-motion: reduce`, disable scrubbing, pinning, parallax, pointer tracking, auto-advancing media, brain rotation, and split transitions.
- Show final states immediately; preserve all content and controls.
- Provide a visible pause/play control for meaningful looping video and pause when off-screen or when the document is hidden.
- Respect `prefers-reduced-data`/Save-Data where support and server information permit; prefer the poster on constrained devices.
- Use `(hover: hover) and (pointer: fine)` before enabling hover previews or pointer depth.
- Touch targets should be at least 44 × 44 CSS px and never depend on hover.

### Performance budget and delivery

Set budgets before visual implementation:

- Initial critical JavaScript: target under 100 KB gzip, including animation code used above the fold.
- Hero: responsive poster first; target a short, visually acceptable modern video encode rather than shipping every old source. Do not autoplay on reduced-motion/data conditions.
- Images: generate responsive AVIF/WebP plus fallback, explicit dimensions, and lazy-load below the first viewport.
- Fonts: one display family and one text family at most, self-hosted/subset if licensing permits, with fallbacks and controlled preload.
- Animate compositor-friendly properties and monitor layer count.
- Target Core Web Vitals in local throttled tests: LCP <= 2.5 s, CLS <= 0.1, INP <= 200 ms at the 75th-percentile goal level.

## Proposed information architecture

No new facts are assumed below; bracketed items are content slots to be supplied.

1. **Skip link and recruiter navigation**
   - About, capabilities, experience, selected work/stories, contact
   - Optional verified downloadable CV link

2. **Cinematic hero**
   - Name
   - [Current professional positioning]
   - [One concise value/interest statement]
   - [Current availability/location if desired]
   - Primary contact/CV actions and scroll cue

3. **Profile / operating perspective**
   - [Current short biography]
   - Portrait/media
   - [Selected facts: location, working modes, languages, sectors]

4. **Capability brain**
   - [Capability clusters]
   - [Short definition for each]
   - [Methods/tools, without arbitrary percentage]
   - Links to supplied experience/project evidence

5. **Career narrative**
   - For each entry: [period], [employer/client], [role], [location], [scope]
   - [Verified achievements/outcomes]
   - [Responsibilities/evidence links]
   - Optional era labels to help tell the story of progression

6. **Education and development**
   - [Degrees], [certifications], [relevant ongoing learning]

7. **Selected stories / portfolio scenes**
   - [Problem/context]
   - [Personal role]
   - [Approach/capabilities]
   - [Outcome/evidence]
   - [Media/link where available]

8. **Closing perspective and contact**
   - [Types of opportunities/conversations sought]
   - Verified email/LinkedIn and optional form
   - Privacy/form-delivery note if a form exists

9. **Recruiter fallback**
   - Print stylesheet and a concise, readable no-motion/no-JavaScript representation

## Implementation plan with verification gates

### Phase 0 — content and evidence contract

- Agree the information architecture and capability taxonomy.
- Obtain the verified 2026 CV facts, links, preferred contact method, media rights, and which historical stories remain relevant.
- Mark old copy as reference, not truth.

Verification: signed-off content schema; every public field has an owner/source; no invented information.

### Phase 1 — parallel static foundation

- Scaffold Astro/TypeScript in parallel with the preserved baseline.
- Add semantic layout, design tokens, fluid type/spacing, landmarks, skip link, metadata slots, and structured content types.
- Establish unit/lint/build checks and a static no-JavaScript rendering check.

Verification: production build succeeds; legacy Docker baseline still behaves exactly as before; page reads coherently with JavaScript disabled.

### Phase 2 — responsive editorial shell

- Build header, hero shell/poster, profile, section rhythm, footer, mobile navigation, and print styles without advanced animation.
- Establish breakpoints based on content rather than device names.

Verification: visual QA at 360, 390, 768, 1024, 1440, and 1920 px; no horizontal overflow at 320 px; keyboard-only navigation; 200% zoom/reflow check.

### Phase 3 — media pipeline and cinematic hero

- Audit source quality/rights, create modern encodes and responsive images, add poster/fallback and pause controls.
- Add the first restrained hero timeline and off-screen/document-hidden pausing.

Verification: network waterfall and throttled LCP check; autoplay/fallback tests across current Chrome, Safari, Firefox, iOS Safari, and Android Chrome; reduced-motion/data behaviour.

### Phase 4 — capability brain prototype

- Build the layered capability map, accessible selection model, evidence linking, desktop scroll sequence, and mobile normal-flow alternative.
- Test one art direction before producing every state.

Verification: mouse, touch, keyboard, and screen-reader state changes; no content loss without GSAP; reduced-motion equivalence; timeline cleans up on resize.

### Phase 5 — career narrative and expandable evidence

- Render structured experience/education data.
- Add wide-screen sticky progression, mobile vertical timeline, and reusable disclosure/dialog behaviour.

Verification: chronology and supplied facts reviewed; deep links/back behaviour if used; focus management, Escape, focus return, and open/closed announcements; long-content stress test.

### Phase 6 — selected story scenes

- Translate approved portfolio material into immersive scenes.
- Reuse the brain/capability language and add scene transitions only where they communicate progression.

Verification: every scene understandable as static text; touch and narrow-layout alternative; image legibility/contrast; no scroll trapping; back/forward and anchor checks.

### Phase 7 — contact and recruiter utilities

- Add verified contact destinations and optional CV download.
- If a form is required, implement a separate validated endpoint/service with spam protection, server-side rate limiting, privacy copy, delivery monitoring, and honest status handling. Do not reuse the current PHP mail script.

Verification: test destination ownership, validation/errors, failure states, rate limits, email delivery and reply path in a non-production test environment; accessibility and privacy review.

### Phase 8 — hardening and acceptance

- Run automated and manual accessibility, performance, link, metadata, structured-data, visual-regression, and browser tests.
- Verify reduced motion, forced colours/high contrast, 200–400% zoom, keyboard, screen reader, slow network, video failure, JavaScript failure, and print/PDF.
- Remove confirmed dead dependencies/assets only after review.

Verification: no critical accessibility findings; agreed performance budgets; zero unintended 404s; content sign-off; Docker/static preview sign-off at all target widths.

### Phase 9 — cutover planning (separate approval)

- Choose the final serving/contact architecture, update Docker in a dedicated phase, and preserve a recoverable legacy snapshot.
- Production/GCP work remains explicitly out of scope until separately authorised.

Verification: local production image health check, rollback rehearsal, asset/cache-header review, and stakeholder approval before any commit, push, or deployment.

## Decision summary

- **Preserve:** cinematic personal media, brain identity, immersive full-bleed scenes, interactive exploration, and the `+` evidence concept.
- **Rebuild:** semantic document, responsive layout, navigation, capability controls, career narrative, story scenes, disclosures, contact flow, and motion system.
- **Use:** Astro static output, TypeScript, modern CSS, structured local content, IntersectionObserver, and selectively GSAP/ScrollTrigger.
- **Avoid by default:** React, SPA routing, WebGL/Three.js, custom smooth-scroll libraries, content hidden behind JavaScript, and generic portfolio templates.
- **Do not reuse:** current jQuery/plugin stack, arbitrary skill percentages, slit-slider internals, duplicated popup scripts, or the PHP `mail()` handler.

## Audit limitations

- This audit did not invent or validate the missing 2026 CV content.
- External social/profile destinations were identified from source but not treated as current/verified.
- No contact form submission was made because it could attempt an external email side effect; source and container configuration are sufficient to establish the current failure path.
- No application, media, Docker, cloud, or deployment file was changed.

