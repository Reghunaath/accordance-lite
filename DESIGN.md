# Design Philosophy — Accordance Lite

## Visual Identity

Accordance Lite is designed for tax professionals — CPAs, tax attorneys, and enrolled agents. The UI reflects professionalism, clarity, and trustworthiness.

- **Clean and minimal.** White backgrounds, subtle borders, generous whitespace. No visual clutter.
- **Professional color palette.** Primary blue (`#135bec`) used sparingly for interactive elements. Neutral grays for text and structure.
- **Typography.** Inter font family. Clear hierarchy with weight and size, not color.
- **Borders over shadows.** Light gray borders (`#E5E7EB`) define structure. Shadows used minimally.
- **Small border radius.** 6-8px on cards and inputs. Nothing overly rounded.

## Layout

- Two-column layout: fixed 280px sidebar + fluid main content area.
- Sidebar houses thread management and user info.
- Main area alternates between a welcome screen and active chat view.
- Chat input is fixed at the bottom of the viewport.

## Key Decisions

- **Initials avatar** instead of profile photos — simpler, no external image dependencies.
- **PDF only** for file attachments — focused scope, single parser dependency.
- **SQLite** for persistence — zero-config, file-based, perfect for single-user.
- **SSE for streaming** — simpler than WebSockets for unidirectional server-to-client data.
- **Tailwind CSS v4** with `@theme` for design tokens — keeps colors and fonts centralized.
