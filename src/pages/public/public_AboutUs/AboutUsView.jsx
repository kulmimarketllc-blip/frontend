import React from 'react';
import { ShieldCheck, Truck, Clock, Award, Users, Globe, Zap, Heart } from 'lucide-react';

const AboutUsView = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1c] px-4 py-20 font-['Inter'] text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Hero Section */}
        <div className="relative mt-10 mb-20 text-center">
          <div className="bg-teal/20 pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"></div>
          <h1 className="from-teal mb-6 bg-linear-to-r to-blue-500 bg-clip-text font-['Syne'] text-5xl font-extrabold tracking-tight text-transparent md:text-7xl">
            Redefining Commerce
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-400 md:text-xl">
            At Kulmi Market, we're building more than just a marketplace. We're creating an ecosystem where
            quality meets convenience, connecting millions of buyers and sellers globally through
            cutting-edge technology.
          </p>
        </div>

        {/* Stats Section */}
        <div className="mb-24 grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { label: 'Active Users', value: '2M+' },
            { label: 'Products', value: '150k+' },
            { label: 'Countries', value: '45+' },
            { label: 'Sellers', value: '10k+' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm transition-colors duration-300 hover:bg-white/10"
            >
              <div className="text-teal mb-2 text-3xl font-bold md:text-4xl">{stat.value}</div>
              <div className="text-sm tracking-wider text-gray-400 uppercase">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="mb-24 grid gap-12 md:grid-cols-2">
          <div className="from-navy2 group relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br to-[#0a0f1c] p-10">
            <div className="bg-teal/10 group-hover:bg-teal/20 absolute -top-10 -right-10 h-40 w-40 blur-[50px] transition-all duration-500"></div>
            <Globe className="text-teal mb-6 h-12 w-12" />
            <h3 className="mb-4 font-['Syne'] text-3xl font-bold">Our Mission</h3>
            <p className="leading-relaxed text-gray-400">
              To empower individuals and businesses by providing a seamless, secure, and intuitive
              platform for global trade. We strive to break down barriers and make high-quality
              products accessible to everyone, everywhere.
            </p>
          </div>
          <div className="from-navy2 group relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br to-[#0a0f1c] p-10">
            <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-blue-500/10 blur-[50px] transition-all duration-500 group-hover:bg-blue-500/20"></div>
            <Zap className="mb-6 h-12 w-12 text-blue-400" />
            <h3 className="mb-4 font-['Syne'] text-3xl font-bold">Our Vision</h3>
            <p className="leading-relaxed text-gray-400">
              To become the world's most trusted and innovative marketplace, pioneering new ways for
              people to discover, connect, and transact in a digital-first economy while fostering
              sustainable business practices.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="mb-16 text-center font-['Syne'] text-4xl font-bold">Our Core Values</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: 'Trust & Security',
                desc: 'Bank-grade security and rigorous verification processes ensure every transaction is safe.',
              },
              {
                icon: Heart,
                title: 'Customer Obsession',
                desc: "Every feature, policy, and decision is made with our customers' best interests in mind.",
              },
              {
                icon: Award,
                title: 'Excellence',
                desc: 'We maintain the highest standards for the products and merchants on our platform.',
              },
              {
                icon: Truck,
                title: 'Speed',
                desc: 'Optimized logistics networks to get your purchases to you faster than ever before.',
              },
              {
                icon: Users,
                title: 'Community',
                desc: 'Fostering a supportive ecosystem where both buyers and sellers thrive together.',
              },
              {
                icon: Clock,
                title: 'Reliability',
                desc: '24/7 support and 99.9% uptime because your business and shopping never sleep.',
              },
            ].map((value, idx) => (
              <div
                key={idx}
                className="hover:border-teal/50 rounded-2xl border border-white/5 bg-white/2 p-6 transition-all duration-300"
              >
                <value.icon className="text-teal mb-4 h-10 w-10" />
                <h4 className="mb-3 text-xl font-bold">{value.title}</h4>
                <p className="text-sm leading-relaxed text-gray-400">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsView;
