/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Zap, 
  Home, 
  ShieldAlert, 
  Menu as MenuIcon, 
  MapPin, 
  User, 
  Building2, 
  ChevronRight, 
  Sun, 
  Calendar, 
  Clock,
  Info,
  Calculator,
  BookOpen,
  Timer,
  Key,
  ArrowRightLeft,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page } from './types';
import { ServiceChargeView } from './components/ServiceChargeView';

// --- Components ---

const Header = () => (
  <header className="bg-white px-5 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-sm border-b border-slate-100">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-violet-700 shadow-inner">
        <Building2 size={24} />
      </div>
      <div>
        <h1 className="text-lg font-bold text-slate-800 leading-tight">হলান টাওয়ার</h1>
        <div className="flex items-center text-[10px] text-slate-500 font-medium">
          <MapPin size={10} className="mr-1 text-violet-600" />
          হলান, দক্ষিখান
        </div>
      </div>
    </div>
    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200">
      <User size={20} />
    </div>
  </header>
);

const NoticeBar = ({ activePage }: { activePage: Page }) => {
  const notices: Record<Page, string> = {
    'home': "মাসিক সার্ভিস চার্জ প্রতি মাসের ৭ তারিখের মধ্যে পরিশোধ করুন | পানি ও বিদ্যুৎ অপচয় রোধ করুন | বাইরে যাওয়ার আগে গ্যাস ও বৈদ্যুতিক লাইন বন্ধ রাখুন | নির্ধারিত স্থানে ময়লা ফেলুন | নিরাপত্তা নিশ্চিত করুন | লিফট ব্যবহারে সতর্ক থাকুন।",
    'service-charge': "আগামী মাসের সার্ভিস চার্জ অনুগ্রহ করে প্রতি মাসের ৭ তারিখের মধ্যে পরিশোধ করার জন্য বিশেষভাবে অনুরোধ করা যাচ্ছে। নির্ধারিত সময়ের মধ্যে সার্ভিস চার্জ পরিশোধ না করলে ভবনের রক্ষণাবেক্ষণ, নিরাপত্তা, পরিচ্ছন্নতা ও অন্যান্য সেবামূলক কার্যক্রম ব্যাহত হতে পারে। সবার সহযোগিতায় আমাদের ভবনকে পরিষ্কার, নিরাপদ ও সুশৃঙ্খল রাখি।-- ধন্যবাদান্তে, ব্যবস্থাপনা কমিটি",
    'desco': "ডেসকো প্রিপেইড মিটারে রিচার্জ করতে হলে অবশ্যই অ্যাকাউন্ট নাম্বার প্রয়োজন হবে। নিচে উল্লেখিত সকল ইউনিটের একাউন্ট নাম্বার আপডেট করে দেওয়া হলো। সতর্কতার সাথে রিচার্জ করতে হবে, ১ মিটারের রিচার্জ যেন অন্য মিটারে না হয়।",
    'emergency': "সম্মানিত ফ্ল্যাট মালিক ও বাসিন্দাবৃন্দ, বিল্ডিং সংক্রান্ত যেকোনো সমস্যা যেমন — লিফট, বিদ্যুৎ, পানি, গ্যাস, নিরাপত্তা বা অন্যান্য জরুরি বিষয় দেখা দিলে অনুগ্রহ করে নোটিশ বোর্ড/অ্যাপে প্রদত্ত জরুরি যোগাযোগ নম্বরে দ্রুত যোগাযোগ করুন। দ্রুত যোগাযোগ করলে সমস্যা সমাধান সহজ ও দ্রুত করা সম্ভব হবে। সবার সহযোগিতায় আমাদের ভবনকে নিরাপদ ও সুশৃঙ্খল রাখি।",
    'menu': "হলান টাওয়ারে আপনাকে স্বাগতম। আমাদের ভবনের সকল গুরুত্বপূর্ণ তথ্য ও দৈনন্দিন সেবাগুলি এখনে দ্রুত পেয়ে যাবেন। এখানে জরুরী নোটিশ, ইউটিলিটি ও সার্ভিস চার্জ, ডেসকো রিচার্জ, যোগাযোগ ও জরুরী হেল্পলাইন, ম্যাপ ও রুট নির্দেশনা, প্রিপেইড মিটার নাম্বার, লিফট ব্যবহারের নিয়ম, গ্যালারি এবং বাসাভাড়ার তথ্য একসাথে সহজে খুঁজে পাবেন। এটি হলান টাওয়ারের বাসিন্দাদের জন্য একটি দ্রুত, সহজ ও নির্ভরযোগ্য ডিজিটাল সার্ভিস কেন্দ্র।",
    'settings': "মাসিক সার্ভিস চার্জ প্রতি মাসের ৭ তারিখের মধ্যে পরিশোধ করুন | পানি ও বিদ্যুৎ অপচয় রোধ করুন | বাইরে যাওয়ার আগে গ্যাস ও বৈদ্যুতিক লাইন বন্ধ রাখুন | নির্ধারিত স্থানে ময়লা ফেলুন | নিরাপত্তা নিশ্চিত করুন | লিফট ব্যবহারে সতর্ক থাকুন।"
  };

  const text = notices[activePage] || notices['home'];
  
  return (
    <div className="premium-notice-bar sticky top-[61px]">
      <div className="notice-left-new flex items-center gap-2">
        <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center text-white flex-shrink-0">
          <Bell size={12} />
        </div>
        <div className="title-new">
          <div className="main-new whitespace-nowrap">হলান টাওয়ার সার্ভিস</div>
          <div className="sub-new whitespace-nowrap">সব আপডেট এক জায়গায়</div>
        </div>
      </div>

      <div className="notice-marquee-new h-6">
        <motion.div 
          key={activePage}
          className="marquee-track-new"
          initial={{ left: "100%", x: 0 }}
          animate={{ left: 0, x: "-100%" }}
          transition={{ 
            duration: Math.max(12, text.length * 0.08), 
            repeat: Infinity, 
            ease: "linear" 
          }}
          style={{ position: 'absolute', top: '50%', y: '-50%' }}
        >
          <div className="marquee-item-new">{text}</div>
        </motion.div>
      </div>

      <div className="notice-badge-new">LIVE</div>
    </div>
  );
};

const HeroCard = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('bn-BD', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('bn-BD', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return "শুভ সকাল";
    if (hour < 16) return "শুভ দুপুর";
    if (hour < 19) return "শুভ বিকাল";
    return "শুভ রাত্রি";
  };

  return (
    <div className="px-5 mt-6">
      <div className="relative overflow-hidden rounded-[24px] p-6 text-white shadow-2xl shadow-violet-900/20">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-violet-800 to-purple-900 -z-10" />
        
        {/* Decorative Elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-400/20 rounded-full blur-3xl" />

        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-violet-100 text-sm font-medium mb-1 opacity-90">{getGreeting()},</p>
            <h2 className="text-2xl font-bold tracking-tight">হলান টাওয়ার বাসী</h2>
          </div>
          <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-amber-400 shadow-lg">
            <Sun size={28} />
          </div>
        </div>

        <div className="glass-dark rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] text-violet-100/70 uppercase tracking-wider font-bold">আজকের তারিখ</p>
              <p className="text-sm font-semibold">{formatDate(time)}</p>
            </div>
          </div>
          
          <div className="h-10 w-[1px] bg-white/10 mx-2" />

          <div className="flex flex-col items-end">
             <div className="flex items-center gap-2">
                <Clock size={14} className="text-violet-200" />
                <span className="text-xl font-bold tabular-nums">{formatTime(time).split(' ')[0]}</span>
             </div>
             <span className="bg-violet-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold mt-1">
               {time.getHours() >= 12 ? 'PM' : 'AM'}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceGrid = ({ onNavigate }: { onNavigate: (page: Page) => void }) => {
  const services = [
    { id: 'service-charge', title: 'সার্ভিস চার্জ', sub: 'মাসিক বিল ও পেমেন্ট', icon: CreditCard },
    { id: 'desco', title: 'ডেসকো রিচার্জ', sub: 'প্রিপেইড মিটার তথ্য', icon: Zap },
    { id: 'accounts', title: 'স্বচ্ছ হিসাব কেন্দ্র', sub: 'আয়-ব্যয় বিবরণী', icon: Calculator },
    { id: 'emergency', title: 'জরুরী নম্বর', sub: 'প্রয়োজনীয় যোগাযোগ', icon: ShieldAlert },
  ];

  return (
    <section className="px-5 mt-8 pb-32">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">সেবা কেন্দ্র</h3>
        <button 
          onClick={() => onNavigate('menu')}
          className="text-violet-600 text-sm font-bold flex items-center gap-1 hover:opacity-70 transition-opacity"
        >
          সব দেখুন <ChevronRight size={16} />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {services.map((service) => (
          <motion.button
            key={service.id}
            whileTap={{ scale: 0.96, y: 2 }}
            onClick={() => onNavigate(service.id as Page)}
            className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-3 transition-shadow hover:shadow-md"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
              <service.icon size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">{service.title}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{service.sub}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
};

const MenuPage = ({ onNavigate }: { onNavigate: (page: Page) => void }) => {
  const menuItems = [
    { id: 'service-charge', title: 'সার্ভিস চার্জ', icon: CreditCard },
    { id: 'desco', title: 'ডেসকো রিচার্জ', icon: Zap },
    { id: 'rules', title: 'রিচার্জ করার নিয়ম', icon: BookOpen },
    { id: 'accounts', title: 'স্বচ্ছ হিসাব কেন্দ্র', icon: Calculator },
    { id: 'emergency', title: 'জরুরী নম্বর', icon: ShieldAlert },
    { id: 'namaz', title: 'নামাজের সময়সূচী', icon: Timer },
    { id: 'to-let', title: 'বাসাভাড়া / টু-লেট', icon: Key },
    { id: 'map', title: 'ম্যাপ এ বিভিন্ন রুট', icon: MapPin },
    { id: 'lift', title: 'লিফট নির্দেশাবলী', icon: Info },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-5 pt-6 pb-32"
    >
      <h2 className="text-xl font-bold text-slate-800 mb-6">মেনু</h2>
      <div className="space-y-3">
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(item.id as Page)}
            className="w-full bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-slate-100 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
                <item.icon size={20} />
              </div>
              <span className="font-bold text-slate-700">{item.title}</span>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

const PlaceholderPage = ({ title, onBack }: { title: string, onBack: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    className="px-5 pt-10 flex flex-col items-center justify-center text-center min-h-[60vh]"
  >
    <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center text-violet-600 mb-6">
      <Info size={40} />
    </div>
    <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
    <p className="text-slate-500 mb-8 max-w-[250px]">এই বিভাগটি বর্তমানে উন্নয়নের কাজ চলছে। শীঘ্রই এটি চালু হবে।</p>
    <button 
      onClick={onBack}
      className="bg-violet-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-violet-600/20 active:scale-95 transition-transform"
    >
      হোম এ ফিরে যান
    </button>
  </motion.div>
);

// --- Main App ---

export default function App() {
  const [activePage, setActivePage] = useState<Page>('home');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [showSummaryList, setShowSummaryList] = useState<boolean>(false);

  const navItems = [
    { id: 'service-charge', label: 'সার্ভিস চার্জ', icon: CreditCard },
    { id: 'desco', label: 'ডেসকো', icon: Zap },
    { id: 'home', label: 'হোম', icon: Home, isCenter: true },
    { id: 'emergency', label: 'জরুরী', icon: ShieldAlert },
    { id: 'menu', label: 'মেনু', icon: MenuIcon },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <HeroCard />
            <ServiceGrid onNavigate={setActivePage} />
          </motion.div>
        );
      case 'menu':
        return <MenuPage onNavigate={setActivePage} />;
      case 'service-charge':
        return (
          <ServiceChargeView 
            selectedUnit={selectedUnit}
            onUnitSelect={setSelectedUnit}
            showSummaryList={showSummaryList}
            onSummaryToggle={setShowSummaryList}
          />
        );
      case 'desco':
        return <PlaceholderPage title="ডেসকো রিচার্জ" onBack={() => setActivePage('home')} />;
      case 'emergency':
        return <PlaceholderPage title="জরুরী নম্বর" onBack={() => setActivePage('home')} />;
      default:
        return <PlaceholderPage title="সেবা" onBack={() => setActivePage('home')} />;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-bg-warm relative flex flex-col">
      <Header />
      <NoticeBar activePage={activePage} />
      
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {renderPage()}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-1px_10px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-md mx-auto h-[72px] flex items-center justify-between px-2 pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id as Page)}
                className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative overflow-hidden active:bg-violet-50/50 transition-colors"
              >
                {/* Top Indicator Line */}
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute top-0 w-12 h-[3px] bg-violet-600 rounded-b-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <div className={`transition-all duration-200 ${isActive ? 'text-violet-600' : 'text-slate-400'}`}>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold transition-all duration-200 ${isActive ? 'text-violet-600' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
