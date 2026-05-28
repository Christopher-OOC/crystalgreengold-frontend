import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  Rocket, 
  Heart, 
  Shield, 
  Lightbulb, 
  Users, 
  Award, 
  CheckCircle2,
  Sparkles,
  Activity,
  Palette,
  Coffee,
  Quote,
  HelpCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Globe,
  Zap,
  Star,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { ErrorState } from '@/shared/ui/ErrorState';

export const AboutUs: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call for about us content
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.99) {
            reject(new Error("Failed to load company information. Please try again."));
          } else {
            resolve(true);
          }
        }, 1000);
      });
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const coreValues = [
    { icon: Award, title: 'Quality First', desc: 'We deliver only premium products that enrich everyday living.' },
    { icon: Rocket, title: 'Empowerment', desc: 'We provide opportunities that inspire growth, independence, and success.' },
    { icon: Shield, title: 'Integrity', desc: 'We uphold honesty, trust, and transparency in all we do.' },
    { icon: Users, title: 'Community', desc: 'We believe in collaboration, support, and shared prosperity.' },
    { icon: Lightbulb, title: 'Innovation', desc: 'We continuously evolve to meet the changing needs of our members and customers.' },
  ];

  const whyChoose = [
    { icon: Star, title: 'Premium Products', desc: 'From designer perfumes to wellness essentials, carefully crafted for everyday living.' },
    { icon: Zap, title: 'Empowering Business Model', desc: 'A platform where anyone can grow, earn, and thrive.' },
    { icon: Users, title: 'Community Support', desc: 'At Topnivo, you’re never alone—we rise together as one family.' },
    { icon: Globe, title: 'Proven Legacy', desc: 'With years of trusted service, we deliver on our promises.' },
  ];

  const products = [
    { icon: Sparkles, title: 'Designer Perfumes', desc: 'Luxury fragrances that make a statement.' },
    { icon: Activity, title: 'Health & Wellness Essentials', desc: 'Supplements and products that support vitality and energy.' },
    { icon: Palette, title: 'Cosmetics & Beauty', desc: 'Innovative products that highlight your natural beauty.' },
    { icon: Coffee, title: 'Food & Lifestyle Products', desc: 'Everyday essentials crafted for quality and enjoyment.' },
  ];

  const steps = [
    { number: '1', title: 'Join Topnivo', desc: 'Register through our official platform or with the help of an existing member. Becoming part of the Topnivo family gives you immediate access to our premium products and the opportunity to start your journey.' },
    { number: '2', title: 'Use & Share Products', desc: 'Experience our perfumes, cosmetics, wellness, and lifestyle essentials. Share your personal product experience with others—it’s the foundation of our community growth.' },
    { number: '3', title: 'Refer Others', desc: 'Introduce new members to Topnivo. By helping others discover our products and business opportunity, you grow your own network while empowering people around you.' },
    { number: '4', title: 'Earn Rewards', desc: 'As your network expands, you earn bonuses, commissions, and recognition. With hard work and dedication, Topnivo provides a path to financial independence and success.' },
  ];

  const faqs = [
    { q: 'What is Topnivo?', a: 'Topnivo is a legacy Direct Selling company offering premium perfumes, health products, cosmetics, and more. We empower individuals with quality products, rewarding opportunities, and a community built on growth, trust, and success.' },
    { q: 'How do I join Topnivo?', a: 'You can register through our official platform or with the help of an existing member. Becoming part of the Topnivo family gives you immediate access to our premium products and the opportunity to start your journey.' },
    { q: 'Do I need experience to succeed?', a: 'No experience is required. We provide the tools, mentorship, and platform to help you achieve your goals, whether you’re looking for part-time income or lifelong financial freedom.' },
    { q: 'Where can I buy Topnivo products?', a: 'Our products are available through our community of members and our official platform. We bring together luxury, wellness, and lifestyle to enrich everyday living.' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
          <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">Loading Company Profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <ErrorState 
          title="Information Error"
          message={error}
          onRetry={fetchData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-32 max-w-7xl mx-auto pb-32">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 text-center space-y-16 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center space-x-2 px-6 py-2 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            <Sparkles size={14} />
            <span>Est. 2022 • Legacy of Excellence</span>
          </div>
          
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-[15vw] md:text-[12vw] font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85] uppercase"
            >
              About <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">Topnivo</span>
            </motion.h1>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-3xl mx-auto relative z-10"
        >
          <p className="text-2xl md:text-3xl text-slate-500 dark:text-slate-400 font-serif italic leading-relaxed">
            "We believe in combining <span className="text-slate-900 dark:text-white font-black not-italic">quality, opportunity, and community</span> to redefine the landscape of direct selling."
          </p>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] -z-10 opacity-20 dark:opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent blur-3xl" />
        </div>
      </section>

      {/* Intro Text */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-4">
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.4em] mb-4">The Philosophy</h3>
            <div className="h-1 w-12 bg-amber-500" />
          </div>
          <div className="md:col-span-8 space-y-8 text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            <p>
              As a legacy company in the Direct Selling industry, we are proud to offer a wide range of quality designer perfumes, health and wellness essentials, cosmetics and more—that enrich everyday life.
            </p>
            <p>
              Our business model is designed with people in mind. By joining the Topnivo Community, members not only enjoy access to world-class products but also the chance to build a rewarding business of their own.
            </p>
            <p className="text-slate-900 dark:text-white font-black text-3xl tracking-tight leading-tight">
              We are committed to creating a system that handsomely compensates our members for their hard work, dedication, and leadership.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="relative">
          <div className="absolute -inset-4 bg-amber-500/10 rounded-[3rem] blur-2xl" />
          <div className="relative h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" 
              alt="Our Story" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-12">
              <p className="text-white text-2xl font-serif italic">"Our journey has always been about helping people enrich their lives."</p>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-full text-xs font-black uppercase tracking-widest">
            <TrendingUp size={14} />
            <span>Our Story</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            A Vision <br /> <span className="text-amber-500">Redefined.</span>
          </h2>
          <div className="space-y-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              At Topnivo, we began with a simple vision: to combine the best of lifestyle, wellness, and entrepreneurship into one powerful platform. Over the years, we have grown into a legacy company trusted for our premium products and our commitment to empowering people across communities.
            </p>
            <p>
              We are more than just a business—we are a movement. Our journey has always been about helping people enrich their lives, build financial independence, and create lasting success. With every product sold and every opportunity shared, the Topnivo story continues to inspire.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Card className="p-12 space-y-8 border-none shadow-2xl bg-amber-50 dark:bg-amber-500/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
            <Target size={120} />
          </div>
          <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Target size={32} />
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Our Vision</h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              To be a global leader in lifestyle and wellness, empowering individuals with world-class products and sustainable business opportunities that inspire prosperity, growth, and community.
            </p>
          </div>
        </Card>
        <Card className="p-12 space-y-8 border-none shadow-2xl bg-slate-900 dark:bg-black text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
            <Rocket size={120} />
          </div>
          <div className="w-16 h-16 bg-white text-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
            <Rocket size={32} />
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black tracking-tight">Our Mission</h3>
            <p className="text-lg text-slate-300 leading-relaxed">
              To enrich lives through premium perfumes, cosmetics, health, and lifestyle products while creating a rewarding platform for entrepreneurship, trust, and shared success.
            </p>
          </div>
        </Card>
      </section>

      {/* Core Values */}
      <section className="space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">Our Core Values</h2>
          <div className="w-24 h-1.5 bg-amber-500 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {coreValues.map((value, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="text-center space-y-6 p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-white/5"
            >
              <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
                <value.icon size={28} />
              </div>
              <div className="space-y-2">
                <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-widest">{value.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{value.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Topnivo */}
      <section className="relative rounded-[3rem] bg-slate-900 dark:bg-black p-12 md:p-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-5xl font-black text-white tracking-tight leading-none">
              Why Choose <br /> <span className="text-amber-500">Topnivo?</span>
            </h2>
            <div className="space-y-8">
              {whyChoose.map((item, i) => (
                <div key={i} className="flex items-start space-x-6 group">
                  <div className="mt-1 w-12 h-12 rounded-xl bg-white/10 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
                    <item.icon size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-black text-white tracking-tight">{item.title}</h4>
                    <p className="text-slate-400 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="h-64 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 flex flex-col justify-end">
                  <p className="text-4xl font-black text-white">100%</p>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Quality Guaranteed</p>
                </div>
                <div className="h-48 rounded-3xl bg-amber-500 p-8 flex flex-col justify-end">
                  <p className="text-4xl font-black text-white">Global</p>
                  <p className="text-white/80 font-bold uppercase tracking-widest text-xs">Community</p>
                </div>
              </div>
              <div className="space-y-6 pt-12">
                <div className="h-48 rounded-3xl bg-white p-8 flex flex-col justify-end">
                  <p className="text-4xl font-black text-slate-900">Legacy</p>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Proven Success</p>
                </div>
                <div className="h-64 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 flex flex-col justify-end">
                  <p className="text-4xl font-black text-white">24/7</p>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Member Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Products */}
      <section className="space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">Our Products</h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">Luxury, wellness, and lifestyle essentials carefully designed for you.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, i) => (
            <Card key={i} className="p-10 space-y-8 border-none shadow-xl hover:shadow-2xl transition-all group cursor-pointer bg-white dark:bg-slate-900">
              <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                <product.icon size={32} />
              </div>
              <div className="space-y-3">
                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{product.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{product.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* The Opportunity */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8 order-2 lg:order-1">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-black uppercase tracking-widest">
            <Zap size={14} />
            <span>The Opportunity</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            Build Your <br /> <span className="text-amber-500">Rewarding Career.</span>
          </h2>
          <div className="space-y-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              Topnivo is more than a brand—it’s a business opportunity. When you join the Topnivo Community, you don’t just gain access to premium products—you unlock the chance to build a rewarding career.
            </p>
            <p>
              Whether you’re looking for part-time income, full-time success, or lifelong financial freedom, we provide the tools, mentorship, and platform to help you achieve your goals.
            </p>
            <p className="text-slate-900 dark:text-white font-black text-xl">
              With Topnivo, your success is our success. <span className="text-amber-500">Together, we rise.</span>
            </p>
          </div>
          <button className="flex items-center space-x-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform">
            <span>Get Started Now</span>
            <ArrowRight size={18} />
          </button>
        </div>
        <div className="order-1 lg:order-2">
          <div className="relative">
            <div className="absolute -inset-4 bg-emerald-500/10 rounded-[3rem] blur-2xl" />
            <div className="relative h-[600px] rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80" 
                alt="The Opportunity" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Impact */}
      <section className="text-center space-y-12 bg-amber-500 rounded-[4rem] p-12 md:p-24 text-white">
        <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Heart size={40} />
        </div>
        <div className="space-y-6 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">Social Impact</h2>
          <p className="text-xl md:text-2xl font-medium leading-relaxed opacity-90">
            At Topnivo, success is not just about profit—it’s about purpose. We believe in giving back to the community by supporting initiatives that promote health, education, and empowerment.
          </p>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Through our efforts, we aim to create not just individual success stories but also a brighter and stronger society.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-20">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">How It Works</h2>
          <p className="text-xl text-slate-500">Your step-by-step journey to success.</p>
        </div>
        <div className="relative space-y-12">
          {/* Vertical Line */}
          <div className="absolute left-10 top-0 bottom-0 w-1 bg-amber-500/20 hidden md:block" />
          
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-12 relative"
            >
              <div className="w-20 h-20 bg-amber-500 text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-xl shadow-amber-500/20 z-10 shrink-0">
                {step.number}
              </div>
              <Card className="flex-1 p-10 border-none shadow-xl bg-white dark:bg-slate-900">
                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4">{step.title}</h4>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">What Our Members Say</h2>
          <p className="text-xl text-slate-500">Real stories from our global community.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {[
            { name: 'Joshua', location: 'Nigeria', text: 'Topnivo has transformed my life. I started as a customer, but soon discovered the opportunity to grow my own business. Today, I not only enjoy the products but also financial freedom and a supportive community.' },
            { name: 'Susan', location: 'Nigeria', text: 'The perfumes are simply amazing! I’ve received countless compliments, and I love knowing I’m part of a company that truly values people.' },
          ].map((item, i) => (
            <Card key={i} className="p-12 space-y-10 border-none shadow-2xl relative overflow-hidden bg-white dark:bg-slate-900">
              <Quote className="absolute top-12 right-12 text-slate-100 dark:text-white/5 w-24 h-24 -z-10" />
              <p className="text-2xl text-slate-600 dark:text-slate-300 italic font-serif leading-relaxed">"{item.text}"</p>
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-amber-500/20">
                  {item.name[0]}
                </div>
                <div>
                  <h5 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{item.name}</h5>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{item.location}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">Frequently Asked Questions</h2>
          <div className="w-24 h-1.5 bg-amber-500 mx-auto rounded-full" />
        </div>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="rounded-[2rem] bg-white dark:bg-slate-900 shadow-lg border border-slate-100 dark:border-white/5 overflow-hidden"
            >
              <button 
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-8 flex items-center justify-between text-left group"
              >
                <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-amber-500 transition-colors">{faq.q}</span>
                <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors ${openFaq === i ? 'bg-amber-500 text-white' : ''}`}>
                  {openFaq === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-8 pt-0 text-lg text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-white/5">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative rounded-[4rem] bg-slate-900 dark:bg-black p-12 md:p-32 text-center space-y-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-amber-500 via-transparent to-transparent" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">Together, <br /> <span className="text-amber-500">We Rise.</span></h2>
          <p className="text-2xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
            Whether you’re here to enjoy our products or pursue an exciting business opportunity, you’re part of a family that values growth, trust, and prosperity.
          </p>
          <div className="pt-8">
            <button className="px-16 py-6 bg-amber-500 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-amber-500/40 hover:scale-110 hover:rotate-2 transition-all">
              Join the Family
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
