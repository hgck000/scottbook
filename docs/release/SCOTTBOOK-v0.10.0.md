# ScottBook v0.10.0 assistance review

Date: 2026-08-11
Status: mandatory 1.0 learning-loop work; not a 1.0 Release Candidate

## Outcome

Version 0.10 turns assistance taps into useful local review data. A pinyin tap
and a meaning tap remain separate learning signals. Repeated encounters with
the same authored word aggregate into one review item while retaining recent
sentence contexts.

The Review screen now provides:

- `Cần cách đọc`, `Chưa hiểu nghĩa`, and `Đã biết` filters.
- Recent and frequency evidence for each word.
- Up to eight recent sentence contexts per authored word.
- Pin/unpin, known/relearn, and confirmed deletion.
- A local recording opt-out that does not disable reader assistance.

Deleting review data cannot delete articles, favorites, or reading progress.
Asking for help after marking a word known returns it to the active review list.

## Persistence and compatibility

- IndexedDB schema v3 stores the validated assistance-history snapshot in the
  isolated events store.
- Corrupt assistance history is quarantined without replacing valid reading
  progress or settings.
- localStorage retains a primary and previous-valid assistance record for
  browser fallback.
- JSON backup, restore, one-level undo, and pre-update checkpoints include the
  new state.
- Valid v0.9 backups without assistance history migrate to a safe empty state.
- Local diagnostics expose counts and recording status only; words, sentences,
  article IDs, and reading text are excluded.

## Automated evidence

| Gate | Coverage | Local result |
| --- | --- | --- |
| Unit/integration | Aggregation, contexts, pin/known/delete, opt-out, strict validation | 70/70 passed |
| Migration | v0.9 backup and older IndexedDB/localStorage data | Passed |
| Corruption isolation | Invalid event state cannot replace reading data | Passed |
| Browser journey | Read → pinyin/meaning → Review → pin → known → delete | 10/10 desktop/mobile cases passed |
| Regression | Backup/restore/undo, v1 migration, service-worker offline reload | Passed |
| Security | Browser API policy, runtime licences, dependency advisories | 0 vulnerabilities |
| Artifact contract | Root and `/scottbook/` PWA | Passed |

GitHub Actions becomes the authoritative remote evidence after this patch is
applied. The physical-device matrix in `SCOTTBOOK-v0.9.0-RC.md` remains pending.

## Still outside this version

- `字 / 词 / 句` scope selection.
- Full reader typography and settings.
- Search, Discover, and article-detail routes.
- The final 30-article content target.
- Capacitor, signed APK, and physical-device evidence.
- Paste/TXT/EPUB import, which remains explicitly deferred.
