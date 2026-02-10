import InteractiveDemo from '@/components/InteractiveDemo';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white">
            AgentVFS
          </h1>
          <p className="text-slate-400 mt-2">
            Run AI coding agents in serverless environments
          </p>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl">
          <h2 className="text-5xl font-bold text-white mb-6">
            Virtual Filesystem for AI Agents
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Replace disk-based filesystems with SQLite. Run Claude Code, Codex, 
            and other AI coding agents in Vercel, Lambda, and any serverless platform.
          </p>
          <div className="flex gap-4">
            <a
              href="#demo"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Try Demo
            </a>
            <a
              href="https://github.com"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-white mb-8">Features</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="text-4xl mb-4">🚀</div>
            <h4 className="text-xl font-semibold text-white mb-2">
              Serverless Ready
            </h4>
            <p className="text-slate-400">
              Works in Vercel, Lambda, Cloudflare Workers—anywhere without persistent disk
            </p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="text-4xl mb-4">👥</div>
            <h4 className="text-xl font-semibold text-white mb-2">
              Multi-Tenant
            </h4>
            <p className="text-slate-400">
              Each user gets isolated workspace. Perfect for SaaS applications
            </p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="text-4xl mb-4">🤖</div>
            <h4 className="text-xl font-semibold text-white mb-2">
              Agent Compatible
            </h4>
            <p className="text-slate-400">
              Drop-in replacement—agents use normal bash commands transparently
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section id="demo" className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-white mb-4">Interactive Demo</h3>
        <p className="text-slate-400 mb-8">
          Try it live! Enter bash commands on the left, see the SQLite database update on the right.
        </p>
        <InteractiveDemo />
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 backdrop-blur mt-16">
        <div className="container mx-auto px-4 py-8">
          <p className="text-slate-400 text-center">
            Built with ❤️ for the AI coding community
          </p>
        </div>
      </footer>
    </main>
  );
}
