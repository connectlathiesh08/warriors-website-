"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/Footer";

interface AboutUsData {
  heroDesc: string;
  whoTitle: string;
  whoDesc: string;
  mission: string;
  vision: string;
  purpose: string;
}

export default function AboutPage() {
  const [data, setData] = useState<AboutUsData>({
    heroDesc: "Rotaract Bangalore Warriors is a family of young changemakers committed to creating meaningful impact through service, leadership, fellowship and innovation.",
    whoTitle: "More than a Club,\nWe are a Movement",
    whoDesc: "We are a team of passionate individuals who believe in the power of service and the impact of togetherness. Through meaningful projects and initiatives, we strive to build a better community and a stronger tomorrow.",
    mission: "To empower young leaders to drive positive community impact through service and fellowship.",
    vision: "To build a legacy of change, leadership excellence, and collaborative youth action in Bangalore.",
    purpose: "Service Above Self - creating a cooperative platform for young minds to develop and grow."
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const rawLocal = localStorage.getItem("warriors_about_us");
    if (rawLocal) {
      try {
        setData(JSON.parse(rawLocal));
      } catch (e) {
        console.error("Local load fail:", e);
      }
    }
    setLoading(false);
  }, []);

  return (
    <>
      {/* Header Spacer */}
      <div className="h-[90px] w-full bg-white border-b border-slate-100" />

      <main className="relative min-h-[90vh] w-full overflow-hidden bg-white font-sans text-slate-800">
        
        {/* Section 1: Hero */}
        <section className="relative py-16 lg:py-24 bg-white overflow-hidden">
          <div className="mx-auto max-w-[1400px] px-6 relative z-10">
            <div className="grid gap-12 lg:grid-cols-12 items-center">
              
              {/* Left Column */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-6 flex flex-col items-start text-left"
              >
                <div className="flex items-center gap-2 bg-amber-500/10 px-3.5 py-1.5 rounded-full mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase">ABOUT US</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-slate-900 leading-[1.08]">
                  Together, we<br/>
                  <span className="text-[#8B003A] block mt-1">Create Change</span>
                </h1>
                <p className="text-slate-500 font-medium leading-relaxed text-sm mt-6 max-w-lg">
                  {data.heroDesc}
                </p>
                <div className="flex flex-wrap gap-4 mt-8">
                  <a href="#timeline" className="flex items-center justify-center rounded-xl bg-[#8B003A] px-6 py-3 text-sm font-bold text-white shadow hover:bg-[#78002E] transition">
                    Our Journey
                  </a>
                  <a href="https://zfrmz.com/IYIxCyfrS2jgW8gnR1Ia" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-xl border-2 border-[#8B003A] text-[#8B003A] px-6 py-2.5 text-sm font-bold bg-white hover:bg-[#8B003A]/5 transition">
                    Join the Warriors
                  </a>
                </div>
              </motion.div>

              {/* Right Column */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="lg:col-span-6 flex items-center justify-center"
              >
                <div className="relative w-full max-w-lg">
                  <img 
                    src="/assets/img/illustrations/hero_about.png" 
                    alt="Warriors volunteering" 
                    className="w-full h-auto object-contain rounded-[24px]" 
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 2: Who We Are */}
        <section className="py-20 bg-slate-50 border-t border-slate-100">
          <div className="mx-auto max-w-[1400px] px-6">
            <div className="grid gap-12 lg:grid-cols-12 items-center">
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-5 flex justify-center"
              >
                <img 
                  src="/assets/img/illustrations/who_we_are.png" 
                  alt="Warriors group illustration" 
                  className="w-full max-w-md h-auto object-contain" 
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="lg:col-span-7 flex flex-col items-start text-left"
              >
                <span className="text-[11px] font-extrabold tracking-[0.2em] text-[#8B003A] uppercase">WHO WE ARE</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 leading-tight whitespace-pre-line">
                  {data.whoTitle}
                </h2>
                <p className="text-slate-500 font-medium leading-relaxed mt-4">
                  {data.whoDesc}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 w-full">
                  {[
                    { title: 'Service', desc: 'Making a difference in people\'s lives', color: 'text-rose-600 bg-rose-50 border-rose-100', icon: '❤️' },
                    { title: 'Fellowship', desc: 'Building lifelong friendships', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: '🤝' },
                    { title: 'Leadership', desc: 'Developing leaders for tomorrow', color: 'text-blue-600 bg-blue-50 border-blue-100', icon: '🏆' },
                    { title: 'Community', desc: 'Empowering our society', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: '🌍' }
                  ].map((pill, i) => (
                    <div key={i} className={`border rounded-2xl p-4 flex flex-col items-start text-left shadow-sm hover:scale-[1.02] transition ${pill.color}`}>
                      <span className="text-xl mb-2">{pill.icon}</span>
                      <span className="text-xs font-black uppercase tracking-wide block">{pill.title}</span>
                      <span className="text-[10px] font-semibold text-slate-500 mt-1 leading-tight">{pill.desc}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 3: Timeline */}
        <section id="timeline" className="py-20 bg-white">
          <div className="mx-auto max-w-[1400px] px-6 text-center">
            <span className="text-[11px] font-extrabold tracking-[0.2em] text-[#8B003A] uppercase">OUR JOURNEY</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">Miles that made us stronger</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-16 relative">
              {[
                { year: '2021', title: 'The Beginning', desc: 'Rotaract Bangalore Warriors was formed with a vision to serve.', icon: '👥' },
                { year: '2022', title: 'Growing Together', desc: 'Started impactful community projects and built our team.', icon: '🌱' },
                { year: '2023', title: 'Recognition', desc: 'Received appreciation at District level for our outstanding projects.', icon: '🏆' },
                { year: '2024', title: 'Expanding Impact', desc: 'Collaborated with International Clubs and organizations.', icon: '🌍' },
                { year: '2025', title: 'Mega Projects', desc: 'Executed bigger projects and touched thousands of lives.', icon: '🎉' },
                { year: '2026 & Beyond', title: 'Creating Legacy', desc: 'Continuing our journey of service and inspiring generations.', icon: '🚀' }
              ].map((node, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex flex-col items-center p-5 bg-[#fafbfc] border border-slate-100 rounded-3xl z-10 shadow-sm hover:translate-y-[-4px] hover:shadow transition duration-300"
                >
                  <div className="h-10 w-10 rounded-full bg-[#8B003A]/5 border border-[#8B003A]/10 flex items-center justify-center text-lg mb-3">
                    {node.icon}
                  </div>
                  <span className="text-xs font-black text-amber-500 tracking-wider block mb-1">{node.year}</span>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide text-center">{node.title}</h4>
                  <p className="text-[10px] font-medium text-slate-400 mt-2 text-center leading-relaxed">{node.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Our Impact */}
        <section className="py-16 bg-[#8B003A]/5 border-y border-[#8B003A]/5">
          <div className="mx-auto max-w-[1400px] px-6 text-center">
            <span className="text-[11px] font-extrabold tracking-[0.2em] text-[#8B003A] uppercase">OUR IMPACT</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Turning small actions into big impact</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mt-12">
              {[
                { num: '50+', label: 'Projects Completed', icon: '📝', color: 'bg-rose-50 border-rose-100 text-[#8B003A]' },
                { num: '10,000+', label: 'Lives Impacted', icon: '❤️', color: 'bg-pink-50 border-pink-100 text-pink-600' },
                { num: '5,000+', label: 'Trees Planted', icon: '🌳', color: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
                { num: '2,500+', label: 'Meals Served', icon: '🍲', color: 'bg-amber-50 border-amber-100 text-amber-600' },
                { num: '600+', label: 'Blood Units Donated', icon: '🩸', color: 'bg-red-50 border-red-100 text-red-655' },
                { num: '300+', label: 'Students Supported', icon: '🎓', color: 'bg-purple-50 border-purple-100 text-purple-600' }
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-[24px] p-6 flex flex-col items-center shadow-sm hover:scale-[1.02] transition">
                  <span className={`h-11 w-11 rounded-full flex items-center justify-center text-lg mb-3 shadow-sm border ${stat.color}`}>
                    {stat.icon}
                  </span>
                  <span className="text-[22px] font-black text-slate-850 leading-tight block">{stat.num}</span>
                  <span className="text-[9px] font-bold text-slate-455 uppercase tracking-wider text-center mt-1.5">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Areas of Service */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-[1400px] px-6 text-center">
            <span className="text-[11px] font-extrabold tracking-[0.2em] text-[#8B003A] uppercase">WHAT WE DO</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">Areas of our Service</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5 mt-12">
              {[
                { title: 'Blood Donation', desc: 'Organizing blood donation drives and saving lives.', icon: '🩸', color: 'bg-rose-50 border-rose-100' },
                { title: 'Tree Plantation', desc: 'Creating a greener tomorrow through plantation drives.', icon: '🌳', color: 'bg-emerald-50 border-emerald-100' },
                { title: 'Health Camps', desc: 'Medical camps and health awareness programs.', icon: '🏥', color: 'bg-blue-50 border-blue-100' },
                { title: 'Education', desc: 'Supporting education for children and empowering youth.', icon: '📚', color: 'bg-indigo-50 border-indigo-100' },
                { title: 'Environment', desc: 'Cleanliness drives, plastic-free initiatives and more.', icon: '🧹', color: 'bg-teal-50 border-teal-100' },
                { title: 'Youth Leadership', desc: 'Building confident leaders through training and events.', icon: '🎓', color: 'bg-amber-50 border-amber-100' }
              ].map((service, i) => (
                <div key={i} className={`flex flex-col items-center p-5 border rounded-3xl shadow-sm hover:scale-[1.02] transition duration-300 ${service.color}`}>
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-xl shadow-sm mb-4">
                    {service.icon}
                  </div>
                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide leading-tight text-center">{service.title}</h4>
                  <p className="text-[10px] font-semibold text-slate-455 mt-2 leading-relaxed text-center">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 7: Meet Our Warriors */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-[1400px] px-6 text-center">
            <span className="text-[11px] font-extrabold tracking-[0.2em] text-[#8B003A] uppercase">MEET THE WARRIORS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 font-display">Leaders driving the change</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-12">
              {[
                { name: 'Rtr. Rishabh Gupta', title: 'President', year: '2026-27', img: '/assets/img/warrior_placeholder.png' },
                { name: 'Rtr. Shreya', title: 'President Elect', year: '2026-27', img: '/assets/img/warrior_placeholder.png' },
                { name: 'Rtr. Govardhan', title: 'Immediate Past President', year: '2025-26', img: '/assets/img/warrior_placeholder.png' },
                { name: 'Rtr. Lathiesh N', title: 'Treasurer', year: '2025-26', img: '/assets/img/lathiesh_profile.png' },
                { name: 'Rtr. Keerthana', title: 'Secretary', year: '2025-26', img: '/assets/img/warrior_placeholder.png' }
              ].map((member, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex flex-col items-center shadow-sm hover:translate-y-[-4px] hover:shadow transition duration-300">
                  <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-[#8B003A]/25 mb-4 shadow">
                    <img src={member.img} alt={member.name} className="h-full w-full object-cover" />
                  </div>
                  <h4 className="text-xs font-black text-slate-950 uppercase tracking-wide leading-tight">{member.name}</h4>
                  <span className="text-[10px] font-bold text-[#8B003A] tracking-wider uppercase block mt-1">{member.title}</span>
                  <span className="text-[9px] font-semibold text-slate-455 uppercase tracking-widest mt-0.5">{member.year}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 8: Why Join Us */}
        <section className="relative bg-gradient-to-r from-[#8B003A] to-[#6e002e] py-20 text-white overflow-hidden">
          <div className="mx-auto max-w-[1400px] px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-left max-w-xl">
              <span className="text-xs font-black tracking-widest text-[#F5A623] uppercase">BE A PART OF OUR JOURNEY</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 leading-none">Be a Warrior. Create Change.</h2>
              <p className="text-white/80 font-medium text-sm mt-4">
                Join us in our mission to create a better society. Together, we can make a lasting difference.
              </p>
            </div>
            <div className="shrink-0">
              <a href="https://zfrmz.com/IYIxCyfrS2jgW8gnR1Ia" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-xl bg-white hover:bg-slate-50 px-8 py-4 text-sm font-bold text-[#8B003A] shadow-lg transition transform hover:scale-[1.02] border border-[#8B003A]">
                Join Rotaract Bangalore Warriors →
              </a>
            </div>
          </div>
        </section>

        {/* Section 9: Testimonials */}
        <section className="py-20 bg-slate-50 border-t border-slate-100">
          <div className="mx-auto max-w-[1400px] px-6 text-center">
            <span className="text-[11px] font-extrabold tracking-[0.2em] text-[#8B003A] uppercase">TESTIMONIALS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">What our members say</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
              {[
                { quote: 'Rotaract has completely transformed my leadership skills. Organizing community service projects has taught me project management, delegation, and strategic planning.', author: 'Rtr. Keerthana', role: 'Club Secretary' },
                { quote: 'The community here is like a second family. The friendships I built while volunteering for blood donation and tree plantation drives are lifelong.', author: 'Rtr. Rishabh Gupta', role: 'Club President' },
                { quote: 'Designing digital content and managing the code of this website has allowed me to apply my UX skills to create meaningful social impact.', author: 'Rtr. Lathiesh N', role: 'Past President' }
              ].map((testimonial, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:scale-[1.01] transition flex flex-col justify-between">
                  <p className="text-slate-650 font-semibold text-xs leading-relaxed italic">"{testimonial.quote}"</p>
                  <div className="border-t border-slate-100 pt-4 mt-6">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide">{testimonial.author}</h5>
                    <span className="text-[10px] font-bold text-[#8B003A] tracking-wider uppercase">{testimonial.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* Portfolio Popup Glassmorphic Modal Card */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-[500px] bg-[#f0f9ff] border border-[#8B003A]/20 rounded-[24px] shadow-[0_20px_50px_rgba(139,0,58,0.1)] overflow-hidden backdrop-blur-2xl p-6 sm:p-7 text-slate-800 z-10 flex flex-col gap-6"
            >
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#8B003A]/5 border border-[#8B003A]/10 text-slate-650 hover:bg-[#8B003A]/15 hover:text-[#8B003A] transition duration-200"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <div className="flex gap-4 items-center">
                <div className="h-16 w-16 rounded-full overflow-hidden border border-[#8B003A]/20 shadow bg-white shrink-0">
                  <img src="/assets/img/lathiesh_profile.png" alt="N Lathiesh Profile" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black tracking-wide text-slate-900">N LATHIESH</h3>
                  <p className="text-[10px] font-black text-[#8B003A] tracking-wider uppercase mt-0.5">
                    Aerospace Engineer • UI/UX Designer • SCM Analyst • Full Stack Developer
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Building premium digital experiences for startups, NGOs, brands and organizations through modern web design, creative branding, App development and scalable applications.
              </p>
              <div className="grid grid-cols-4 gap-2 bg-[#8B003A]/5 border border-[#8B003A]/5 rounded-2xl p-3 text-center">
                <div><h4 className="text-sm font-black text-[#8B003A]">10+</h4><p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Projects</p></div>
                <div><h4 className="text-sm font-black text-[#8B003A]">3+</h4><p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Experience</p></div>
                <div><h4 className="text-sm font-black text-[#8B003A]">5+</h4><p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Clients</p></div>
                <div><h4 className="text-sm font-black text-[#8B003A]">100%</h4><p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Creativity</p></div>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <a href="https://wa.me/918197176867" target="_blank" className="flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-[11px] font-black shadow-md transition duration-200">💬 WhatsApp</a>
                <a href="#" className="flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl bg-[#8B003A]/10 hover:bg-[#8B003A]/20 border border-[#8B003A]/10 text-[#8B003A] text-[11px] font-black transition duration-200">📄 Resume</a>
                <a href="mailto:connectlathiesh@gmail.com" className="flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl bg-[#8B003A] hover:bg-[#6e002e] text-white text-[11px] font-black shadow-md transition duration-200">📧 Contact</a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
