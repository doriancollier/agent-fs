Missing Pieces (Product Improvements)

  9. No story for cross-tenant file sharing

  Every operation is scoped to a userId. But real agent systems often need shared resources — a shared knowledge base, shared templates, shared tool outputs. There's no mechanism described for one tenant to mount or reference another tenant's files (even read-only). This
  is a significant gap for multi-agent orchestration.

  10. No concurrency model

  What happens when two concurrent requests write to the same path for the same userId? Last-write-wins? Optimistic locking via content_hash? Database-level locking? For serverless environments where concurrent invocations are common, this matters a lot and isn't
  addressed.

  [addressed]11. No streaming / large file handling

  The StorageBackend interface uses Buffer for both put and get. This means entire file contents must fit in memory. For the S3 backend handling large files, this is a real limitation. A stream-based interface (or at least an optional streaming path) would be important for
   production use.

  12. No file watching / change notification

  Coding agents often rely on file watchers. If AgentVFS wants to replicate the coding agent experience, some mechanism for subscribing to changes (even poll-based) would be valuable. This could be a future feature, but it's worth mentioning in the roadmap.

  13. No search / query beyond path

  Coding agents use grep, find, glob. The litepaper describes readdir and getAllPaths but nothing about content search or glob matching. If agents need to "explore directory structures to discover information," they'll need more than readdir.

  14. No workspace templating

  The use cases mention "portable agent customization" and agents reading config files like AGENT.md. But there's no described mechanism for initializing a workspace from a template — seeding it with a directory structure and default files. This is a natural feature that
  would make the "coding agent patterns for all agents" story more complete.

  ---
  Litepaper Improvements

  [addressed] 15. Missing: Performance characteristics

  No mention of expected latency overhead vs. real filesystem operations. For a library positioning itself as a drop-in filesystem replacement, readers will want to know: how much slower is readFile through Postgres vs. disk? Even rough benchmarks or order-of-magnitude
  guidance would help.

  [addressed]16. Missing: Error handling model

  The code examples show Error: EPERM but there's no section describing the error model. Does AgentVFS use POSIX error codes (ENOENT, EACCES, EEXIST)? Custom error classes? This matters for agent code that needs to handle failures gracefully.

  [addressed]17. The architecture diagram could show data flow

  The current diagram shows layers but not how data moves through them. A simple flow diagram for a writeFile call — showing path normalization, permission check, hook execution, content routing, and storage — would make the architecture much more tangible.

  [addressed]18. Consider adding a "Non-Goals" section

  Explicitly stating what AgentVFS does not try to be would preempt questions. For example: "AgentVFS is not a distributed filesystem. It is not a FUSE mount. It does not provide real-time sync between instances." This sharpens the positioning.

  19. The "Getting Started" section should show a real agent use case

  The current example just writes and reads a file — it could be any key-value store. A more compelling example would show the agent-specific value: setting up a workspace with an AGENT.md config, marking it immutable, then showing an agent reading it for instructions and
  writing output files. Show the pattern you're selling.

  [addressed]20. License and link at the bottom feel premature

  The GitHub link points to agent-fs but the package is @agent-vfs/core. There's a naming inconsistency. Also, if this isn't published yet, consider framing the ending as "coming soon" rather than "install now."

  ---
  Summary

  The core thesis is strong and well-argued. The biggest gaps are on the product side: concurrency, cross-tenant sharing, streaming, and search are all things production users will hit quickly. On the litepaper side, the main improvements are filling in the hand-wavy
  claims (snapshots, dedup), adding a non-goals section, and making the getting-started example actually demonstrate the unique value of the project rather than generic file I/O.
