import React from 'react';
import {
  Target,
  Lightbulb,
  Users,
  Store,
  Truck,
  Heart,
  MapPin,
  ShieldCheck,
  Coins,
} from 'lucide-react';

const AboutUsView = () => {
  const ecosystem = [
    {
      icon: Users,
      color: 'text-teal',
      glow: 'from-teal/20',
      title: 'Customers',
      desc: 'Customers can browse thousands of products, place orders securely, track deliveries, and pay the way that works best for them, including mobile money options like EVC Plus, eDahab, and Sahal alongside card payments.',
    },
    {
      icon: Store,
      color: 'text-blue-400',
      glow: 'from-blue-500/20',
      title: 'Sellers',
      desc: 'For sellers and merchants, Kulmi Market provides a complete dashboard to manage products, track orders, see earnings, and request payouts directly to their bank or mobile wallet, with lower fees than the big platforms because we believe sellers should keep more of what they earn.',
    },
    {
      icon: Truck,
      color: 'text-purple-400',
      glow: 'from-purple-500/20',
      title: 'Delivery Partners',
      desc: 'For delivery partners, Kulmi Market offers a dedicated driver experience with live order assignments and instant earnings tracking, making every delivery simple and transparent.',
    },
  ];

  const values = [
    {
      icon: Heart,
      color: 'text-rose-400',
      title: 'Community First',
      desc: 'A deep commitment to East Africa, from Somalia to Kenya, Ethiopia to the diaspora worldwide.',
    },
    {
      icon: ShieldCheck,
      color: 'text-teal',
      title: 'Trust & Safety',
      desc: 'Building a secure platform where every buyer and seller feels protected at every step.',
    },
    {
      icon: Users,
      color: 'text-blue-400',
      title: 'Support for Sellers',
      desc: 'Empowering local entrepreneurs and small businesses to grow and reach new markets.',
    },
    {
      icon: Coins,
      color: 'text-yellow-400',
      title: 'Fair Fees',
      desc: 'Keeping costs low so our merchants can keep more of their hard-earned money.',
    },
    {
      icon: MapPin,
      color: 'text-orange-400',
      title: 'East Africa First',
      desc: 'Built specifically for the region — its culture, payment preferences, and people.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1c] font-['Inter'] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ─── Hero ─────────────────────────────────────────── */}
        <div className="relative pt-16 pb-8 text-center">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="bg-teal/10 h-96 w-96 rounded-full blur-[140px]" />
          </div>
          <div className="relative mx-auto max-w-4xl">
            <span className="border-teal/30 bg-teal/10 text-teal mb-4 inline-block rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
              About Us
            </span>
            <h1 className="from-teal mt-4 mb-5 bg-gradient-to-r to-blue-500 bg-clip-text font-['Syne'] text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
              About Kulmi Market
            </h1>
            <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-400 sm:text-lg md:text-xl">
              Kulmi Market is a multi-vendor online marketplace built for East African communities
              and their diaspora around the world. The name "Kulmi" comes from a Somali word meaning
              "to gather" or "to come together" — a place where buyers and sellers do business in a
              way that feels safe, simple, and rooted in community.
            </p>
          </div>
        </div>

        {/* ─── Our Story ───────────────────────────────────── */}
        <div className="mb-4">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:rounded-3xl sm:p-8 md:p-10">
            <div className="from-teal/10 absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l to-transparent" />
            <div className="relative z-10">
              <h2 className="mb-3 flex items-center gap-3 font-['Syne'] text-2xl font-bold sm:text-3xl">
                <Lightbulb className="text-teal h-7 w-7 shrink-0" />
                Our Story
              </h2>
              <p className="max-w-4xl leading-relaxed text-gray-300 sm:text-lg">
                We started Kulmi Market because we saw a gap. East African entrepreneurs and small
                business owners had incredible products and talent, but no dedicated platform built
                for their community, their culture, and the way they prefer to pay. At the same
                time, customers were searching for a marketplace they could trust, with sellers who
                understood them. Kulmi Market changes that.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Mission & Vision ────────────────────────────── */}
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          {/* Mission */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-[#0a0f1c] p-6 sm:rounded-3xl sm:p-8 md:p-10">
            <div className="bg-teal/10 group-hover:bg-teal/20 absolute -top-10 -right-10 h-40 w-40 rounded-full blur-[50px] transition-all duration-500" />
            <div className="relative z-10">
              <Target className="text-teal mb-4 h-9 w-9 sm:h-11 sm:w-11" />
              <h3 className="mb-3 font-['Syne'] text-2xl font-bold sm:text-3xl">Our Mission</h3>
              <p className="leading-relaxed text-gray-400 sm:text-base">
                Our mission is to give East African sellers and entrepreneurs a trusted, affordable
                platform to reach customers everywhere, while making shopping simple and safe for
                every buyer.
              </p>
            </div>
          </div>
          {/* Vision */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-[#0a0f1c] p-6 sm:rounded-3xl sm:p-8 md:p-10">
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-500/10 blur-[50px] transition-all duration-500 group-hover:bg-blue-500/20" />
            <div className="relative z-10">
              <Users className="mb-4 h-9 w-9 text-blue-400 sm:h-11 sm:w-11" />
              <h3 className="mb-3 font-['Syne'] text-2xl font-bold sm:text-3xl">Our Vision</h3>
              <p className="leading-relaxed text-gray-400 sm:text-base">
                Our vision is to become the gathering place for East Africa online where local
                businesses thrive, culture is celebrated, and every transaction brings people closer
                together.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Ecosystem ───────────────────────────────────── */}
        <div className="mb-4 lg:mt-15">
          <div className="mb-6 pt-6 text-center">
            <h2 className="mb-2 font-['Syne'] text-3xl font-bold sm:text-4xl">
              Connecting the Ecosystem
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base md:text-lg">
              Kulmi Market connects customers with hundreds of merchants all in one place.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ecosystem.map(({ icon: Icon, color, glow, title, desc }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
              >
                <div
                  className={`absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br ${glow} to-transparent blur-2xl transition-all duration-500 group-hover:scale-150`}
                />
                <div className="relative z-10">
                  <Icon className={`mb-3 h-9 w-9 ${color}`} />
                  <h3 className="mb-2 text-xl font-bold">{title}</h3>
                  <p className="text-sm leading-relaxed text-gray-400 sm:text-base">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Core Values ─────────────────────────────────── */}
        <div className="mb-4 lg:mt-15">
          <div className="mb-6 pt-6 text-center">
            <h2 className="mb-2 font-['Syne'] text-3xl font-bold sm:text-4xl">Our Core Values</h2>
            <p className="mx-auto max-w-xl text-sm text-gray-400 sm:text-base">
              What we stand for every day.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
            {values.map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:bg-white/10"
              >
                <Icon className={`mb-3 h-8 w-8 ${color}`} />
                <h4 className="mb-2 font-bold">{title}</h4>
                <p className="text-xs leading-relaxed text-gray-400 sm:text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── At Our Core ──────────────────────────────────── */}
        <div className="pt-6 pb-16">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 text-center sm:rounded-3xl sm:p-12 md:p-14">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-64 w-96 rounded-full bg-blue-500/10 blur-[80px]" />
            </div>
            <div className="relative z-10 mx-auto max-w-3xl">
              <Heart className="text-teal mx-auto mb-4 h-11 w-11" />
              <h2 className="mb-4 font-['Syne'] text-2xl font-bold sm:text-3xl md:text-4xl">
                At Our Core
              </h2>
              <p className="mb-4 text-base leading-relaxed text-gray-300 sm:text-lg">
                At our core, Kulmi Market stands for community first, trust and safety, support for
                small sellers, fair fees, and a deep commitment to East Africa — from Somalia to
                Kenya, Ethiopia to the diaspora worldwide.
              </p>
              <p className="text-base leading-relaxed text-gray-400 sm:text-lg">
                We listen to our community and keep building, growing alongside our sellers and
                customers every step of the way.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsView;
