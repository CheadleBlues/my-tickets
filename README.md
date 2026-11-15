# Cheadle Blues – My Tickets

The members' app for Cheadle Blues (Cheadle branch, Official Manchester City Supporters Club).
Each member logs in with their email and a 6-digit code and sees only their own away ticket and coach status.

**Live at:** https://cheadleblues.github.io/my-tickets/

## How it works
- **This repository** is the app members install (an installable web app / PWA): screens, icon, colours.
- **The engine** (Stage 2) is a Google Apps Script on the branch Google account. It reads the Members tab and each game's Applied / Final lists, emails login codes and returns one member's status.
- Until `API_URL` in `config.js` is set, the app runs on **made-up members** (Dave and Sam) as a preview.

## Privacy – this repository is public
Never put member names, emails, phone numbers, loyalty points, Cheadle Points, list positions, seat numbers or branch / supporters club ticket totals in here. They stay in the Google Sheets and only reach a member, after login, through the engine.

## Installing on a phone
- **Android (Chrome):** open the link, tap **Install app** (or ⋮ → Add to Home screen).
- **iPhone (Safari):** open the link, tap **Share** → **Add to Home Screen**.

## Engine contract (Stage 2)
`POST API_URL` with a `text/plain` JSON body:
| action | sends | returns |
|---|---|---|
| `requestCode` | `email` | `{ok:true}` (always, so emails can't be probed) |
| `verify` | `email`, `code` | `{ok:true, token}` |
| `status` | `token` | `{ok:true, greeting, updated, people:[{name, games:[{team, comp, when, tone, ticketShort, ticketLine, paidLine?, action?, coachShort?, coachLine?, next?}]}]}` |
| `logout` | `token` | `{ok:true}` |

`tone` is one of `green` (got a ticket), `yellow` (supporters club ticket), `amber` (applied), `red` (unsuccessful), `grey` (not applied).
