// PLACE THIS FILE AT:
// D:\MultiModel\frontend\src\pages\Landing.jsx

import { Link } from 'react-router-dom'

function BalanceArc({ pct, size = 40 }) {
  return (
    <div
      className="rounded-full balance-arc shrink-0"
      style={{ '--arc-pct': pct, width: size, height: size }}
      aria-hidden="true"
    />
  )
}

const plans = [
  {
    name: 'Starter',
    price: '2,999',
    pts: '100',
    color: 'border-ink-line',
    btn: 'bg-ink-line hover:bg-ink-line/80 text-paper',
    features: ['AI Chat', 'Web Search', 'Image Generation', 'PDF Upload (10MB)', '100 pts/day'],
  },
  {
    name: 'Pro',
    price: '9,999',
    pts: '333',
    color: 'border-signal',
    btn: 'bg-signal hover:bg-signal/90 text-white',
    badge: 'Popular',
    badgeColor: 'bg-signal',
    features: ['AI Chat', 'Web Search', 'Image Generation', 'PDF Upload (50MB)', '333 pts/day', 'Priority Support'],
  },
  {
    name: 'Business',
    price: '24,999',
    pts: '1,000',
    color: 'border-gold',
    btn: 'bg-gold hover:bg-gold/90 text-ink',
    badge: 'Best Value',
    badgeColor: 'bg-gold text-ink',
    features: ['Everything in Pro', 'PDF Upload (200MB)', '1,000 pts/day', 'API Access', 'Team Workspace'],
  },
]

const features = [
  { icon: '🤖', title: 'Multiple AI Models', desc: 'Access GPT-4o Mini and more through one interface.' },
  { icon: '🔍', title: 'Web Search', desc: 'Real-time web results injected into every AI response.' },
  { icon: '🖼️', title: 'Image Generation', desc: 'Create images from text prompts using DALL-E.' },
  { icon: '📄', title: 'PDF Upload', desc: 'Upload documents and chat with them directly.' },
  { icon: '⚡', title: 'Points Balance', desc: 'Simple prepaid credit system — top up anytime.' },
  { icon: '🇵🇰', title: 'Made for Pakistan', desc: 'PKR pricing, Safepay payments, Urdu support coming.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink text-paper">

      {/* Nav */}
      <nav className="border-b border-ink-line px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BalanceArc pct={72} size={32} />
          <span className="font-display font-semibold text-lg tracking-tight">
            Multi Model
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-paper-muted hover:text-paper text-sm transition">
            Log in
          </Link>
          <Link
            to="/register"
            className="bg-signal hover:bg-signal/90 text-white font-display font-semibold text-sm px-4 py-2 rounded-lg transition"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center animate-fade-up">
        <div className="flex justify-center mb-8">
          <BalanceArc pct={72} size={72} />
        </div>
        <h1 className="font-display text-5xl font-bold text-paper mb-4 leading-tight">
          All your AI models.<br />One balance.
        </h1>
        <p className="text-paper-muted text-xl mb-10 max-w-2xl mx-auto">
          Multi Model Chatbot gives you access to the world's best AI through a simple
          points-based system — like mobile credit, but for intelligence.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/register"
            className="bg-gold hover:bg-gold/90 text-ink font-display font-bold text-base px-8 py-3 rounded-xl transition"
          >
            Start for free
          </Link>
          <Link
            to="/login"
            className="border border-ink-line hover:border-paper-muted text-paper-muted hover:text-paper font-medium text-base px-8 py-3 rounded-xl transition"
          >
            Log in →
          </Link>
        </div>
        <p className="text-paper-faint text-sm mt-6">
          No credit card required · Cancel anytime · PKR pricing
        </p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="font-display text-3xl font-semibold text-paper text-center mb-12">
          Everything you need
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-ink-raised border border-ink-line rounded-2xl p-6"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-display font-semibold text-paper mb-1">{f.title}</h3>
              <p className="text-paper-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="font-display text-3xl font-semibold text-paper text-center mb-3">
          Simple pricing
        </h2>
        <p className="text-paper-muted text-center mb-12">
          Daily points granted automatically. Top up anytime for extra access.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-ink-raised border ${plan.color} rounded-2xl p-6 flex flex-col`}
            >
              {plan.badge && (
                <span className={`absolute -top-3 left-6 ${plan.badgeColor} text-xs font-display font-semibold px-3 py-1 rounded-full`}>
                  {plan.badge}
                </span>
              )}
              <h3 className="font-display text-xl font-semibold text-paper mb-1">{plan.name}</h3>
              <p className="font-display text-3xl font-bold text-paper mt-3 mb-1">
                Rs {plan.price}
                <span className="text-base font-normal text-paper-muted">/mo</span>
              </p>
              <p className="text-gold text-sm mb-5">{plan.pts} pts/day</p>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-paper-muted">
                    <span className="text-success text-xs">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`w-full text-center font-display font-semibold py-2.5 rounded-lg transition ${plan.btn}`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-ink-line">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display text-3xl font-semibold text-paper mb-4">
            Ready to start?
          </h2>
          <p className="text-paper-muted mb-8">
            Join thousands of users already using Multi Model Chatbot.
          </p>
          <Link
            to="/register"
            className="bg-gold hover:bg-gold/90 text-ink font-display font-bold text-base px-10 py-3 rounded-xl transition"
          >
            Create your account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-line px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <BalanceArc pct={72} size={24} />
            <span className="font-display font-semibold text-sm text-paper-muted">
              Multi Model Chatbot
            </span>
          </div>
          <p className="text-paper-faint text-xs">
            © 2026 Mind Changer (Pvt) Ltd · Pakistan
          </p>
        </div>
      </footer>
    </div>
  )
}
