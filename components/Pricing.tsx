import React from 'react';
import { Check } from 'lucide-react';

export default function Pricing() {
  return (
    <section id="join" className="bg-[rgb(15,15,15)] pt-20 pb-20 relative">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <span 
            className="text-sm text-white/70"
            style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
          >
            Simple, Transparent Pricing
          </span>
          <h2 
            className="text-3xl sm:text-4xl tracking-tight text-white mt-2"
            style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
          >
            Choose Your Plan
          </h2>
          <p 
            className="mt-4 text-white/80"
            style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
          >
            Select the perfect plan for your document management needs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur">
            <div className="mb-6">
              <h3 
                className="text-xl text-white tracking-tight"
                style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
              >
                Free
              </h3>
              <p 
                className="text-sm text-white/70 mt-2"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                Perfect for getting started
              </p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span 
                  className="text-4xl text-white tracking-tight"
                  style={{ fontFamily: '"1 TT_Firs_Neue_ExtraBlack Unspecified", "1 TT_Firs_Neue_ExtraBlack Unspecified Placeholder", sans-serif' }}
                >
                  $0
                </span>
                <span 
                  className="text-white/60 text-sm"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  /month
                </span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Up to 10 documents',
                '5 GB storage',
                'Basic semantic search',
                'Community support',
                'Export capabilities'
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-white/80" style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}>
                  <Check className="text-white/60 flex-shrink-0 mt-0.5" size={20} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button className="w-full rounded-full bg-white/10 text-white px-6 py-3 text-sm hover:bg-white/15 transition border border-white/10" style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}>
              Get Started
            </button>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-white border border-white/20 p-8 shadow-2xl transform md:scale-105">
            <div className="absolute top-6 right-6">
              <span 
                className="inline-flex items-center rounded-full bg-neutral-900 px-3 py-1 text-xs text-white border border-neutral-800"
                style={{ fontFamily: '"Geist Mono", monospace' }}
              >
                POPULAR
              </span>
            </div>
            <div className="mb-6">
              <h3 
                className="text-xl text-neutral-900 tracking-tight"
                style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
              >
                Pro
              </h3>
              <p 
                className="text-sm text-neutral-700 mt-2"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                For power users and professionals
              </p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span 
                  className="text-4xl text-neutral-900 tracking-tight"
                  style={{ fontFamily: '"1 TT_Firs_Neue_ExtraBlack Unspecified", "1 TT_Firs_Neue_ExtraBlack Unspecified Placeholder", sans-serif' }}
                >
                  $9.99
                </span>
                <span 
                  className="text-neutral-600 text-sm"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  /month
                </span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Up to 500 documents',
                '15 GB storage',
                'Advanced AI search & Q&A',
                'Multi-document reasoning',
                'Priority support',
                'Smart document linking'
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-neutral-700" style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}>
                  <Check className="text-neutral-900 flex-shrink-0 mt-0.5" size={20} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button className="w-full rounded-full bg-neutral-900 text-white px-6 py-3 text-sm hover:bg-neutral-800 transition" style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}>
              Get Started
            </button>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur">
            <div className="mb-6">
              <h3 
                className="text-xl text-white tracking-tight"
                style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
              >
                Enterprise
              </h3>
              <p 
                className="text-sm text-white/70 mt-2"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                For teams and organizations
              </p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span 
                  className="text-4xl text-white tracking-tight"
                  style={{ fontFamily: '"1 TT_Firs_Neue_ExtraBlack Unspecified", "1 TT_Firs_Neue_ExtraBlack Unspecified Placeholder", sans-serif' }}
                >
                  Custom
                </span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Unlimited documents',
                'Unlimited storage',
                'Custom AI models',
                'Dedicated support',
                'Team collaboration',
                'API access & integrations'
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-white/80" style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}>
                  <Check className="text-white/60 flex-shrink-0 mt-0.5" size={20} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button className="w-full rounded-full bg-white/10 text-white px-6 py-3 text-sm hover:bg-white/15 transition border border-white/10" style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}>
              Contact Sales
            </button>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p 
            className="text-sm text-white/70"
            style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
          >
            All plans include end-to-end encryption and complete data privacy.{' '}
            <a href="#faq" className="text-white/90 hover:text-white underline">
              Learn more
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}