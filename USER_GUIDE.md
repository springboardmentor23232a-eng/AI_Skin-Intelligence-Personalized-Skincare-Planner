# User Guide

## Getting started
1. Open the app and **Sign Up** (or use a demo account from `app/seed.py`).
2. Fill in your **Skin Profile** (skin type, sleep, hydration, lifestyle).
3. Go to **Skin Scan** and either use your camera or upload a photo, then
   click **Analyze Skin** — this creates your first assessment and score.

## For regular users
| Tab | What it's for |
|---|---|
| Overview | Your current skin health score and unread notification count |
| Skin Scan | Capture or upload a photo to get a new skin assessment |
| My Routine | Your generated morning/evening skincare steps |
| Daily Checklist | Tick off today's routine steps and track your streak |
| Products | Browse and get products matched to your skin type/concerns |
| Ingredient Check | Look up what an ingredient does and what to avoid it with |
| Progress | Score history, adherence tracking, trend, and before/after photos |
| Scoring Engine | See how your score breaks down (condition, lifestyle, sleep, etc.) |
| Recommendations | Advice sent to you by a linked consultant/dermatologist |
| Notifications | Reminders and alerts — mark as read, or refresh reminders |
| Reports | Download your data as a PDF or Excel file (see below) |
| AI Assistant | Ask skincare questions with your profile as context |
| Skin Profile | Edit your skin type, allergies, sleep, hydration, etc. |

### Downloading a report
Go to **Reports**, pick a card, and click **Download PDF** or
**Download Excel**. Available reports:
- **Skin Assessment Report** — every scan, score, and detected concern
- **Routine Report** — your current routine, step by step
- **Product Recommendation Report** — products matched to you
- **Progress Report** — every check-in you've logged
- **Skin Health Report** — a one-page summary of where you stand

## For consultants & dermatologists
1. Link a client via their user ID (**My Clients / Patients**).
2. Click **View Report** on any client to see their full assessment
   history, progress trend, and (for dermatologists) risk factors.
3. Use **Send a Recommendation** to send advice — it appears on that
   client's **Recommendations** tab automatically.

## For admins
- **User Management** — view all accounts.
- **Recommendation Monitoring** — every recommendation sent platform-wide.
- **System Reports** — signups, assessments, and notification volume over
  the last 30 days, plus the most common skin concerns.
- **Platform Notifications** — send an announcement to every active user.

## Troubleshooting
- **Broken image in Before/After:** that assessment's photo file isn't on
  disk (e.g. it belonged to a different upload folder). It doesn't affect
  your score — just re-scan to get a fresh, working photo.
- **"Failed to fetch" anywhere:** the backend server isn't running or isn't
  reachable — check with the developer/admin running the app.
