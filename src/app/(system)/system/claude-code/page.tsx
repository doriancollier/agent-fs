import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Terminal,
  Bot,
  Sparkles,
  FileCode,
  Zap,
  Shield,
  ChevronRight,
  GitBranch,
  Bug,
  Map,
  Settings,
  Wrench,
  Palette,
  FileText,
  Package,
} from 'lucide-react'

const harnessStats = [
  { label: 'Commands', value: '49', icon: Terminal },
  { label: 'Agents', value: '7', icon: Bot },
  { label: 'Skills', value: '13', icon: Sparkles },
  { label: 'Rules', value: '5', icon: Shield },
  { label: 'Hooks', value: '8', icon: Zap },
  { label: 'MCP Servers', value: '5', icon: Settings },
]

const commandNamespaces = [
  {
    namespace: 'spec/',
    description: 'Specification workflow',
    commands: ['create', 'decompose', 'execute', 'feedback', 'doc-update', 'migrate', 'tasks-sync'],
  },
  {
    namespace: 'git/',
    description: 'Version control with validation',
    commands: ['commit', 'push'],
  },
  {
    namespace: 'debug/',
    description: 'Systematic debugging',
    commands: ['browser', 'types', 'test', 'api', 'data', 'logs', 'rubber-duck', 'performance'],
  },
  {
    namespace: 'roadmap/',
    description: 'Product roadmap management',
    commands: ['show', 'add', 'open', 'validate', 'analyze', 'prioritize', 'enrich', 'clear'],
  },
  {
    namespace: 'system/',
    description: 'Harness maintenance',
    commands: ['ask', 'update', 'review', 'learn'],
  },
  {
    namespace: 'app/',
    description: 'Application maintenance',
    commands: ['upgrade', 'cleanup'],
  },
  {
    namespace: 'db/',
    description: 'Database operations',
    commands: ['migrate', 'studio'],
  },
  {
    namespace: 'dev/',
    description: 'Feature scaffolding',
    commands: ['scaffold'],
  },
  {
    namespace: 'docs/',
    description: 'Documentation maintenance',
    commands: ['reconcile'],
  },
  {
    namespace: 'cc/',
    description: 'Claude Code configuration',
    commands: ['notify:on', 'notify:off', 'notify:status', 'ide:set', 'ide:reset'],
  },
  {
    namespace: 'template/',
    description: 'Upstream template management',
    commands: ['check', 'update'],
  },
]

const agents = [
  {
    name: 'prisma-expert',
    specialty: 'Database design, migrations, queries',
    trigger: 'Schema changes, DAL patterns',
  },
  {
    name: 'react-tanstack-expert',
    specialty: 'React, TanStack Query, components',
    trigger: 'Data fetching, state management',
  },
  {
    name: 'typescript-expert',
    specialty: 'Type system, generics, build errors',
    trigger: 'Complex types, build failures',
  },
  {
    name: 'zod-forms-expert',
    specialty: 'Zod schemas, React Hook Form',
    trigger: 'Form validation, schema design',
  },
  {
    name: 'product-manager',
    specialty: 'Roadmap, prioritization, scope',
    trigger: 'Strategic decisions',
  },
  {
    name: 'research-expert',
    specialty: 'Web research, information gathering',
    trigger: 'External research tasks',
  },
  {
    name: 'code-search',
    specialty: 'Finding files, patterns, functions',
    trigger: 'Locating code',
  },
]

const skills = [
  {
    name: 'proactive-clarification',
    description: 'Identify gaps, ask clarifying questions',
    trigger: 'Vague requests, ambiguous scope',
  },
  {
    name: 'debugging-systematically',
    description: 'Debugging methodology and patterns',
    trigger: 'Investigating bugs',
  },
  {
    name: 'designing-frontend',
    description: 'Calm Tech design language, UI decisions',
    trigger: 'Planning UI, reviewing designs',
  },
  {
    name: 'styling-with-tailwind-shadcn',
    description: 'Tailwind CSS v4, Shadcn UI implementation',
    trigger: 'Writing styles, building components',
  },
  {
    name: 'organizing-fsd-architecture',
    description: 'Feature-Sliced Design, layer organization',
    trigger: 'Structuring features',
  },
  {
    name: 'working-with-prisma',
    description: 'Prisma 7 patterns, DAL conventions',
    trigger: 'Database queries, migrations',
  },
  {
    name: 'generating-images-replicate',
    description: 'Replicate MCP for image generation, processing',
    trigger: 'Image generation, editing',
  },
  {
    name: 'vectorizing-images',
    description: 'Raster-to-vector conversion with @neplex/vectorizer',
    trigger: 'Converting PNG/JPG to SVG',
  },
  {
    name: 'managing-roadmap-moscow',
    description: 'MoSCoW prioritization, roadmap utilities',
    trigger: 'Product planning',
  },
  {
    name: 'writing-developer-guides',
    description: 'Developer guide structure for AI agents',
    trigger: 'Creating/updating guides',
  },
  {
    name: 'orchestrating-parallel-work',
    description: 'Parallel agent execution, batch scheduling',
    trigger: 'Coordinating concurrent tasks',
  },
  {
    name: 'changelog-writing',
    description: 'Human-friendly changelog entries, release notes',
    trigger: 'Populating changelog, preparing releases',
  },
  {
    name: 'posthog-nextjs-app-router',
    description: 'PostHog analytics integration for Next.js',
    trigger: 'Adding analytics to App Router',
  },
]

const coreWorkflows = [
  {
    title: 'Feature Development',
    icon: Sparkles,
    steps: [
      '/ideate <task>',
      '/ideate-to-spec <path>',
      '/spec:decompose <path>',
      '/spec:execute <path>',
      '/git:commit',
    ],
  },
  {
    title: 'Debugging',
    icon: Bug,
    steps: [
      '/debug:browser',
      '/debug:types',
      '/debug:test',
      '/debug:api',
      '/debug:logs',
    ],
  },
  {
    title: 'Roadmap Management',
    icon: Map,
    steps: [
      '/roadmap:show',
      '/roadmap:open',
      '/roadmap:add <title>',
      '/roadmap:prioritize',
    ],
  },
]

const qualityOfLifeFeatures = [
  {
    title: 'IDE Color Customization',
    icon: Palette,
    description:
      'Generate a unique VS Code color scheme from a single seed color to visually distinguish this project from others.',
    commands: ['/cc:ide:set <color>', '/cc:ide:reset'],
    details: [
      'Supports hex (#3b82f6), RGB, HSL, or color names (forest green, ocean blue)',
      'Uses 60-30-10 design rule with 11-step tonal palette',
      'Only modifies .vscode/settings.json (project-level)',
    ],
  },
  {
    title: 'Dev Server Logging',
    icon: FileText,
    description:
      'All dev server output is captured to timestamped log files, giving Claude access to server logs for debugging.',
    commands: ['pnpm dev', '/debug:logs'],
    details: [
      'Logs stored in .logs/YYYY-MM-DD_HH-MM-SS.log',
      'Claude can analyze logs to diagnose errors',
      'Correlates errors with stack traces and code paths',
    ],
  },
  {
    title: 'pnpm Package Manager',
    icon: Package,
    description:
      'The project uses pnpm by default for faster installs and better disk efficiency.',
    commands: ['pnpm install', 'pnpm dev', 'pnpm build'],
    details: [
      'Lockfile: pnpm-lock.yaml',
      'All scripts use pnpm (dev, build, test, lint)',
      'Symlinked node_modules with content-addressable store',
    ],
  },
]

export default function ClaudeCodePage() {
  return (
    <div className="container-default py-8 space-y-10">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/system" className="hover:text-foreground transition-colors">
            System
          </Link>
          <ChevronRight className="size-3" />
          <span>Claude Code</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Claude Code Harness
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          The customization framework that enables Claude Code to work
          effectively on this project. Commands, agents, skills, and automation
          that bridges coding sessions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {harnessStats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-1 p-4 rounded-lg border bg-card"
          >
            <stat.icon className="size-5 text-muted-foreground" />
            <span className="text-2xl font-bold">{stat.value}</span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* What is a Harness */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What is a Harness?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>
            A <strong>harness</strong> is the underlying infrastructure that
            runs an AI coding agent. It provides context, commands, expertise,
            and automation.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-2">
              <FileCode className="size-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-foreground">CLAUDE.md</span>
                <span className="text-xs block">Project instructions</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Terminal className="size-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-foreground">Commands</span>
                <span className="text-xs block">Slash command workflows</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Bot className="size-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-foreground">Agents</span>
                <span className="text-xs block">Specialized experts</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="size-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-foreground">Skills</span>
                <span className="text-xs block">Reusable expertise</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="size-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-foreground">Rules</span>
                <span className="text-xs block">Path-specific guidance</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="size-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-foreground">Hooks</span>
                <span className="text-xs block">Automated validation</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commands */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <Terminal className="size-5" />
          Commands
        </h2>
        <p className="text-sm text-muted-foreground">
          49 slash commands organized by namespace. Type{' '}
          <code className="bg-muted px-1 py-0.5 rounded text-xs">/command</code>{' '}
          in Claude Code to invoke.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {commandNamespaces.map((ns) => (
            <div
              key={ns.namespace}
              className="rounded-lg border bg-card p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <code className="font-mono text-sm font-semibold text-primary">
                  {ns.namespace}*
                </code>
                <span className="text-xs text-muted-foreground">
                  {ns.commands.length} commands
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{ns.description}</p>
              <div className="flex flex-wrap gap-1">
                {ns.commands.slice(0, 4).map((cmd) => (
                  <code
                    key={cmd}
                    className="text-xs bg-muted px-1.5 py-0.5 rounded"
                  >
                    {cmd}
                  </code>
                ))}
                {ns.commands.length > 4 && (
                  <span className="text-xs text-muted-foreground">
                    +{ns.commands.length - 4} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Plus: <code className="bg-muted px-1 py-0.5 rounded">/ideate</code>,{' '}
          <code className="bg-muted px-1 py-0.5 rounded">/ideate-to-spec</code>,{' '}
          <code className="bg-muted px-1 py-0.5 rounded">/review-recent-work</code>,{' '}
          <code className="bg-muted px-1 py-0.5 rounded">/db:migrate</code>,{' '}
          <code className="bg-muted px-1 py-0.5 rounded">/dev:scaffold</code>,{' '}
          and more.
        </p>
      </div>

      {/* Agents */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <Bot className="size-5" />
          Agents
        </h2>
        <p className="text-sm text-muted-foreground">
          Specialized experts that run in isolated context windows via the Task
          tool.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-medium">Agent</th>
                <th className="text-left py-2 pr-4 font-medium">Specialty</th>
                <th className="text-left py-2 font-medium">When to Use</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.name} className="border-b last:border-0">
                  <td className="py-2 pr-4">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                      {agent.name}
                    </code>
                  </td>
                  <td className="py-2 pr-4 text-muted-foreground">
                    {agent.specialty}
                  </td>
                  <td className="py-2 text-muted-foreground">{agent.trigger}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <Sparkles className="size-5" />
          Skills
        </h2>
        <p className="text-sm text-muted-foreground">
          Reusable expertise that Claude applies automatically when relevant.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className="flex items-start gap-3 rounded-lg border bg-card p-3"
            >
              <div className="min-w-0 flex-1">
                <code className="text-xs font-mono font-medium">
                  {skill.name}
                </code>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {skill.description}
                </p>
              </div>
              <span className="text-xs bg-muted px-2 py-0.5 rounded shrink-0">
                {skill.trigger}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Core Workflows */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <GitBranch className="size-5" />
          Core Workflows
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {coreWorkflows.map((workflow) => (
            <Card key={workflow.title}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <workflow.icon className="size-4 text-muted-foreground" />
                  <CardTitle className="text-base">{workflow.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ol className="space-y-1">
                  {workflow.steps.map((step, i) => (
                    <li key={step} className="flex items-center gap-2 text-xs">
                      <span className="size-4 shrink-0 flex items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                        {i + 1}
                      </span>
                      <code className="font-mono text-muted-foreground">
                        {step}
                      </code>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quality of Life Features */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <Sparkles className="size-5" />
          Quality of Life
        </h2>
        <p className="text-sm text-muted-foreground">
          Developer experience enhancements that make working with Claude Code
          more effective.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {qualityOfLifeFeatures.map((feature) => (
            <Card key={feature.title}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <feature.icon className="size-4 text-primary" />
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {feature.commands.map((cmd) => (
                    <code
                      key={cmd}
                      className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono"
                    >
                      {cmd}
                    </code>
                  ))}
                </div>
                <ul className="space-y-1">
                  {feature.details.map((detail) => (
                    <li
                      key={detail}
                      className="text-xs text-muted-foreground flex items-start gap-1.5"
                    >
                      <span className="text-primary mt-0.5">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* File Locations */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Wrench className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">File Locations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <code className="text-xs bg-background px-2 py-1 rounded border font-mono">
                .claude/commands/
              </code>
              <span className="text-muted-foreground text-xs">Slash commands</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-background px-2 py-1 rounded border font-mono">
                .claude/agents/
              </code>
              <span className="text-muted-foreground text-xs">Agent definitions</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-background px-2 py-1 rounded border font-mono">
                .claude/skills/
              </code>
              <span className="text-muted-foreground text-xs">Skill definitions</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-background px-2 py-1 rounded border font-mono">
                .claude/rules/
              </code>
              <span className="text-muted-foreground text-xs">Path-specific rules</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-background px-2 py-1 rounded border font-mono">
                .claude/settings.json
              </code>
              <span className="text-muted-foreground text-xs">Hooks & config</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-background px-2 py-1 rounded border font-mono">
                CLAUDE.md
              </code>
              <span className="text-muted-foreground text-xs">Project instructions</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-background px-2 py-1 rounded border font-mono">
                .logs/
              </code>
              <span className="text-muted-foreground text-xs">Dev server logs</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-background px-2 py-1 rounded border font-mono">
                .vscode/settings.json
              </code>
              <span className="text-muted-foreground text-xs">IDE color customization</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Documentation Link */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="font-medium">Full Harness Documentation</p>
          <p className="text-sm text-muted-foreground">
            Open{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
              .claude/README.md
            </code>{' '}
            in your editor for architecture diagrams and maintenance guides
          </p>
        </div>
      </div>
    </div>
  )
}
