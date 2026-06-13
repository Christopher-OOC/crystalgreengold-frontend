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
import personnelImage from '@/shared/assets/personnel.jpeg';
import bottleImage from '@/shared/assets/bottle.jpg';
import Image from 'next/image';

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
    { icon: Shield, title: 'Integrity', desc: 'We uphold honesty, transparency, and accountability in all we do.' },
    { icon: Heart, title: 'Health & Wellness', desc: 'We are committed to promoting healthier lifestyles and well-being for all.' },
    { icon: Award, title: 'Excellence', desc: 'We strive to deliver high-quality products, services, and solutions at all times.' },
    { icon: Rocket, title: 'Empowerment', desc: 'We create opportunities that help individuals and communities grow and succeed.' },
    { icon: Lightbulb, title: 'Innovation', desc: 'We embrace creativity and forward-thinking solutions to meet evolving needs.' },
    { icon: Globe, title: 'Sustainability', desc: 'We support responsible practices that promote long-term food security and healthy living.' },
    { icon: Users, title: 'Service to Humanity', desc: 'We believe access to quality food and health solutions should benefit everyone.' },
  ];

  const whyChoose = [
    { icon: Shield, title: 'Transparency', desc: 'We operate with complete honesty and clarity in all our processes.' },
    { icon: Star, title: 'Reward System', desc: 'Our structured and fair reward system ensures effort and loyalty are properly recognized.' },
    { icon: Award, title: 'Quality Assurance', desc: 'We are committed to delivering safe, effective, and high-quality health solutions.' },
    { icon: Users, title: 'Trusted Partnerships', desc: 'We build reliable and long-term relationships based on integrity and shared success.' },
  ];

  const products = [
    { icon: Heart, title: 'Health Solutions', desc: 'Effective health and wellness solutions that support healthier living and overall well-being.' },
    { icon: Globe, title: 'Food for All Program', desc: 'Sustainability-driven initiative improving access to quality food for individuals and communities.' },
    { icon: Sparkles, title: 'Wellness Products', desc: 'Natural herbal wellness supplements designed to support overall health and vitality.' },
    { icon: Users, title: 'Community Empowerment', desc: 'Structured programs creating opportunities for growth, self-reliance, and improved living standards.' },
  ];

  const steps = [
    { number: '1', title: 'Join CrystalGreenGold', desc: 'Become part of our community and gain access to innovative health solutions and the Food for All program. Starting your wellness journey with us opens doors to personal growth and positive impact.' },
    { number: '2', title: 'Embrace Wellness', desc: 'Experience our natural herbal wellness products and discover the benefits of health-focused living. Share your personal wellness journey with others—it builds trust and community.' },
    { number: '3', title: 'Support the Mission', desc: 'Help spread awareness about the Food for All initiative and health solutions. By supporting our mission, you empower others in your community while creating meaningful connections.' },
    { number: '4', title: 'Create Impact & Earn', desc: 'As your network grows and more people benefit from our programs, you build a rewarding career. CrystalGreenGold provides structure, support, and recognition for those committed to making a difference.' },
  ];

  const faqs = [
    { q: 'What is CrystalGreenGold?', a: 'CrystalGreenGold is a forward-thinking company dedicated to providing quality health solutions and a sustainable "Food for All" program aimed at improving lives and supporting healthier communities through innovative wellness products and rewarding opportunities.' },
    { q: 'What makes the Food for All Program important?', a: 'The Food for All Program is a sustainability-driven initiative aimed at improving access to quality food for individuals and communities. It is designed to reduce hunger, support healthy nutrition, and promote food security through a structured and transparent system.' },
    { q: 'What products does CrystalGreenGold offer?', a: 'We offer natural herbal wellness supplements, health solutions, and sustainable food programs designed to support overall health, vitality, and balanced living. All products are carefully developed to promote natural well-being and enhance quality of life.' },
    { q: 'How can I get involved with CrystalGreenGold?', a: 'You can join our community to access our health solutions and participate in the Food for All initiative. Through our community empowerment programs, you gain access to wellness products, training, support, and structured opportunities to create impact while building a rewarding career.' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto" />
          <p className="text-emerald-600 font-bold animate-pulse tracking-widest uppercase text-xs">Loading Company Profile...</p>
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
          <div className="inline-flex items-center space-x-2 px-6 py-2 bg-amber-400/10 text-amber-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            <Sparkles size={14} />
            <span>Est. 2022 • Legacy of Excellence</span>
          </div>
          
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-7xl font-black text-emerald-950 dark:text-white tracking-tighter leading-[0.85] uppercase"
            >
              About <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">crystalgreengold</span>
            </motion.h1>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-3xl mx-auto relative z-10"
        >
          <p className="text-lg md:text-xl text-emerald-600 dark:text-emerald-400 font-serif italic leading-relaxed">
            "We believe that a healthier, hunger-free world is not just a dream—<span className="text-emerald-950 dark:text-white font-black not-italic">it is a responsibility we all share.</span>"
          </p>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] -z-10 opacity-20 dark:opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent blur-3xl" />
        </div>
      </section>

      {/* Intro Text */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-4">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-[0.4em] mb-4">The Philosophy</h3>
            <div className="h-1 w-12 bg-amber-400" />
          </div>
          <div className="md:col-span-8 space-y-8 text-xl text-emerald-700 dark:text-emerald-400 leading-relaxed font-medium">
            <p>
              CrystalGreenGold is a forward-thinking company dedicated to providing quality health solutions and promoting a sustainable "Food for All" program aimed at improving lives and supporting healthier communities.
            </p>
            <p>
              We are passionate about wellness, nutrition, and empowering people with products and opportunities that enhance healthy living. Our system is built on transparency, trust, fairness, and rewarding partnerships, ensuring that every member and customer benefits from a clear and reliable structure.
            </p>
            <p className="text-emerald-950 dark:text-white font-black text-3xl tracking-tight leading-tight">
              At CrystalGreenGold, we believe that good health and access to quality food should be available to everyone. Through innovation, integrity, and commitment to excellence, we continue to create solutions that positively impact individuals, families, and communities.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="relative">
          <div className="absolute -inset-4 bg-amber-400/10 rounded-[3rem] blur-2xl" />
          <div className="relative h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl">
            <Image
              src={personnelImage} 
              alt="Our Story" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 to-transparent flex items-end p-12">
              <p className="text-white text-2xl font-serif italic">"Our journey has always been about helping people enrich their lives."</p>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-400/10 text-amber-400 rounded-full text-xs font-black uppercase tracking-widest">
            <TrendingUp size={14} />
            <span>Our Story</span>
          </div>
          <h2 className="text-4xl font-black text-emerald-950 dark:text-white tracking-tight leading-none">
            Empowering Health, <br /> <span className="text-amber-400">Nourishing Lives.</span>
          </h2>
          <div className="space-y-6 text-lg text-emerald-700 dark:text-emerald-400 leading-relaxed">
            <p>
              At CrystalGreenGold, we believe that no one should go to bed hungry and that everyone deserves the opportunity to live a healthy and fulfilling life. Through our Food for All and Health for All Initiatives, we are committed to supporting the well-being of individuals and families in our communities.
            </p>
            <p>
              Our mission extends beyond addressing hunger. We recognize that proper nutrition and good health are closely connected. Through partnerships with local farmers, food producers, and community organizations, we help provide nutritious food to those in need while promoting healthier lifestyles and wellness awareness.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Card className="p-12 space-y-8 border-none shadow-2xl bg-amber-50 dark:bg-amber-400/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
            <Target size={120} />
          </div>
          <div className="w-16 h-16 bg-amber-400 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/20">
            <Target size={32} />
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight">Our Vision</h3>
            <p className="text-lg text-emerald-700 dark:text-emerald-400 leading-relaxed">
              To become a globally trusted leader in health and sustainable food solutions, transforming lives through wellness, empowerment, transparency, and equal access to quality nutrition for all.
            </p>
          </div>
        </Card>
        <Card className="p-12 space-y-8 border-none shadow-2xl bg-emerald-950 dark:bg-black text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
            <Rocket size={120} />
          </div>
          <div className="w-16 h-16 bg-white text-emerald-950 rounded-2xl flex items-center justify-center shadow-lg">
            <Rocket size={32} />
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black tracking-tight">Our Mission</h3>
            <p className="text-lg text-emerald-200 leading-relaxed">
              To provide innovative health solutions and sustainable food programs that improve lives, empower communities, and create rewarding opportunities through integrity, transparency, and excellence.
            </p>
          </div>
        </Card>
      </section>

      {/* Core Values */}
      <section className="space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black text-emerald-950 dark:text-white tracking-tight">Our Core Values</h2>
          <div className="w-24 h-1.5 bg-amber-400 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {coreValues.map((value, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="text-center space-y-6 p-8 rounded-[2.5rem] bg-white dark:bg-emerald-950 shadow-xl border border-emerald-50 dark:border-white/5"
            >
              <div className="w-16 h-16 bg-amber-400/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
                <value.icon size={28} />
              </div>
              <div className="space-y-2">
                <h4 className="font-black text-emerald-950 dark:text-white uppercase text-sm tracking-widest">{value.title}</h4>
                <p className="text-xs text-emerald-600 leading-relaxed">{value.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose crystalgreengold */}
      <section className="relative rounded-[3rem] bg-emerald-950 dark:bg-black p-12 md:p-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-5xl font-black text-white tracking-tight leading-none">
              Why Choose <br /> <span className="text-amber-400">crystalgreengold?</span>
            </h2>
            <div className="space-y-8">
              {whyChoose.map((item, i) => (
                <div key={i} className="flex items-start space-x-6 group">
                  <div className="mt-1 w-12 h-12 rounded-xl bg-white/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-white transition-all">
                    <item.icon size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-black text-white tracking-tight">{item.title}</h4>
                    <p className="text-emerald-400 font-medium">{item.desc}</p>
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
                  <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Quality Guaranteed</p>
                </div>
                <div className="h-48 rounded-3xl bg-amber-400 p-8 flex flex-col justify-end">
                  <p className="text-4xl font-black text-white">Global</p>
                  <p className="text-white/80 font-bold uppercase tracking-widest text-xs">Community</p>
                </div>
              </div>
              <div className="space-y-6 pt-12">
                <div className="h-48 rounded-3xl bg-white p-8 flex flex-col justify-end">
                  <p className="text-4xl font-black text-emerald-950">Legacy</p>
                  <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Proven Success</p>
                </div>
                <div className="h-64 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 flex flex-col justify-end">
                  <p className="text-4xl font-black text-white">24/7</p>
                  <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Member Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Products */}
      <section className="space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black text-emerald-950 dark:text-white tracking-tight">Our Products</h2>
          <p className="text-xl text-emerald-600 max-w-2xl mx-auto">Luxury, wellness, and lifestyle essentials carefully designed for you.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, i) => (
            <Card key={i} className="p-10 space-y-8 border-none shadow-xl hover:shadow-2xl transition-all group cursor-pointer bg-white dark:bg-emerald-950">
              <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:bg-amber-400 group-hover:text-white transition-all duration-500">
                <product.icon size={32} />
              </div>
              <div className="space-y-3">
                <h4 className="text-2xl font-black text-emerald-950 dark:text-white tracking-tight leading-tight">{product.title}</h4>
                <p className="text-sm text-emerald-600 leading-relaxed">{product.desc}</p>
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
          <h2 className="text-4xl font-black text-emerald-950 dark:text-white tracking-tight leading-none">
            Join Our <br /> <span className="text-amber-400">Movement.</span>
          </h2>
          <div className="space-y-6 text-lg text-emerald-700 dark:text-emerald-400 leading-relaxed">
            <p>
              CrystalGreenGold offers meaningful partnership opportunities for individuals and organizations who share our vision of promoting health, wellness, and food accessibility.
            </p>
            <p>
              We provide a transparent and rewarding system that allows partners to grow while making a positive impact in their communities. With our structured support, training, and incentives, we believe in building strong, mutually beneficial relationships that create value and drive sustainable growth.
            </p>
            <p className="text-emerald-950 dark:text-white font-black text-xl">
              Whether you're looking to enjoy our products or create real impact in your community, <span className="text-amber-400">together, we rise.</span>
            </p>
          </div>
          <button className="flex items-center space-x-3 px-8 py-4 bg-emerald-950 dark:bg-white text-white dark:text-emerald-950 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform">
            <span>Get Started Now</span>
            <ArrowRight size={18} />
          </button>
        </div>
        <div className="order-1 lg:order-2">
          <div className="relative">
            <div className="absolute -inset-4 bg-emerald-500/10 rounded-[3rem] blur-2xl" />
            <div className="relative h-[600px] rounded-[3rem] overflow-hidden shadow-2xl">
              <Image
                src={bottleImage} 
                alt="The Opportunity" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Impact */}
      <section className="text-center space-y-12 bg-amber-400 rounded-[4rem] p-12 md:p-24 text-white">
        <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Heart size={40} />
        </div>
        <div className="space-y-6 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">Together We Can End Disease and Hunger</h2>
          <p className="text-xl md:text-2xl font-medium leading-relaxed opacity-90">
            At CrystalGreenGold, we recognize that a healthier, hunger-free world is not just a dream—it is a responsibility we all share. Across the globe, millions continue to face disease and hunger. Yet with innovation, compassion, and collective action, these barriers can be overcome.
          </p>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Our mission is to provide sustainable solutions, promote wellness, empower communities, and encourage collaboration. Through partnership, we can create stronger communities, improve health outcomes, and ensure food security for those who need it most. Every contribution matters. Every innovation counts. Together, we can build a future where healthy lives and nutritious food are accessible to all.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-20">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black text-emerald-950 dark:text-white tracking-tight">How It Works</h2>
          <p className="text-xl text-emerald-600">Your step-by-step journey to success.</p>
        </div>
        <div className="relative space-y-12">
          {/* Vertical Line */}
          <div className="absolute left-10 top-0 bottom-0 w-1 bg-amber-400/20 hidden md:block" />
          
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-12 relative"
            >
              <div className="w-20 h-20 bg-amber-400 text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-xl shadow-amber-400/20 z-10 shrink-0">
                {step.number}
              </div>
              <Card className="flex-1 p-10 border-none shadow-xl bg-white dark:bg-emerald-950">
                <h4 className="text-2xl font-black text-emerald-950 dark:text-white tracking-tight mb-4">{step.title}</h4>
                <p className="text-lg text-emerald-600 dark:text-emerald-400 leading-relaxed">{step.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black text-emerald-950 dark:text-white tracking-tight">What Our Members Say</h2>
          <p className="text-xl text-emerald-600">Real stories from our global community.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {[
            { name: 'Juliet', location: 'CEO', text: 'My heart for people led me to create the "Food for All" initiative. CrystalGreenGold is more than a business - it is a movement dedicated to ensuring everyone has access to nutritious meals, wellness solutions, and the opportunity to build better lives.' },
            { name: 'Community Member', location: 'Across Regions', text: 'Through CrystalGreenGold programs, I have not only gained access to quality health solutions, but I am also helping my community. This is about more than products - it is about creating lasting change and empowering people to live healthier, more fulfilling lives.' },
          ].map((item, i) => (
            <Card key={i} className="p-12 space-y-10 border-none shadow-2xl relative overflow-hidden bg-white dark:bg-emerald-950">
              <Quote className="absolute top-12 right-12 text-emerald-50 dark:text-white/5 w-24 h-24 -z-10" />
              <p className="text-2xl text-emerald-700 dark:text-emerald-200 italic font-serif leading-relaxed">"{item.text}"</p>
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-amber-400/20">
                  {item.name[0]}
                </div>
                <div>
                  <h5 className="text-xl font-black text-emerald-950 dark:text-white tracking-tight">{item.name}</h5>
                  <p className="text-sm text-emerald-400 font-bold uppercase tracking-widest">{item.location}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black text-emerald-950 dark:text-white tracking-tight">Frequently Asked Questions</h2>
          <div className="w-24 h-1.5 bg-amber-400 mx-auto rounded-full" />
        </div>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="rounded-[2rem] bg-white dark:bg-emerald-950 shadow-lg border border-emerald-50 dark:border-white/5 overflow-hidden"
            >
              <button 
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-8 flex items-center justify-between text-left group"
              >
                <span className="text-xl font-black text-emerald-950 dark:text-white tracking-tight group-hover:text-amber-400 transition-colors">{faq.q}</span>
                <div className={`w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-emerald-400 group-hover:text-amber-400 transition-colors ${openFaq === i ? 'bg-amber-400 text-white' : ''}`}>
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
                    <div className="p-8 pt-0 text-lg text-emerald-600 dark:text-emerald-400 leading-relaxed border-t border-white dark:border-white/5">
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
      <section className="relative rounded-[4rem] bg-emerald-950 dark:bg-black p-12 md:p-32 text-center space-y-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">Together, <br /> <span className="text-amber-400">We Thrive.</span></h2>
          <p className="text-2xl text-emerald-400 max-w-3xl mx-auto font-medium leading-relaxed">
            Whether you're seeking to improve your health, support the Food for All mission, or build a rewarding career with purpose, you're part of a family committed to creating positive change and building a brighter future for all.
          </p>
          <div className="pt-8">
            <button className="px-16 py-6 bg-amber-400 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-amber-400/40 hover:scale-110 hover:rotate-2 transition-all">
              Begin Your Journey
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

