# Graph Report - couple-travel-album  (2026-10-19)

## Corpus Check
- 6 files · ~46,353 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: (none) 1)

## Summary
- 24 nodes · 27 edges · 8 communities (3 shown, 5 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `67f947b7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- backend.js
- 둘의 여행 앨범
- refreshSoon
- signOut
- signUp

## God Nodes (most connected - your core abstractions)
1. `둘의 여행 앨범` - 5 edges
2. `refreshSoon()` - 4 edges
3. `listen()` - 3 edges
4. `upload()` - 3 edges
5. `signUp()` - 3 edges
6. `signOut()` - 3 edges
7. `refresh()` - 2 edges
8. `startRealtime()` - 2 edges
9. `doc()` - 2 edges
10. `collection()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (8 total, 5 thin omitted)

### Community 0 - "backend.js"
Cohesion: 0.29
Nodes (3): collection(), doc(), upload()

### Community 1 - "둘의 여행 앨범"
Cohesion: 0.33
Nodes (5): Supabase 준비 (한 번만), 둘의 여행 앨범, 로컬에서 보기, 보안 메모, 파일

### Community 2 - "refreshSoon"
Cohesion: 0.40
Nodes (5): delete(), listen(), refresh(), refreshSoon(), startRealtime()

## Knowledge Gaps
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `refreshSoon()` connect `refreshSoon` to `backend.js`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `listen()` connect `refreshSoon` to `backend.js`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._