"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db, uploadImageToStorage, saveImageMetadata, onImagesUpdate, GalleryItem } from "@/lib/firebase";

export default function AdminPortal() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"list" | "upload" | "about">("list");

  // Form states
  const [title, setTitle] = useState("");
  const [event, setEvent] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Community Service");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // About Us CMS states
  const [heroDesc, setHeroDesc] = useState("");
  const [whoTitle, setWhoTitle] = useState("");
  const [whoDesc, setWhoDesc] = useState("");
  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");
  const [purpose, setPurpose] = useState("");

  useEffect(() => {
    const unsubscribe = onImagesUpdate((newItems) => {
      setItems(newItems);
      setLoading(false);
    });

    // Load About Us CMS details
    const rawLocal = localStorage.getItem("warriors_about_us");
    if (rawLocal) {
      try {
        const data = JSON.parse(rawLocal);
        setHeroDesc(data.heroDesc || "");
        setWhoTitle(data.whoTitle || "");
        setWhoDesc(data.whoDesc || "");
        setMission(data.mission || "");
        setVision(data.vision || "");
        setPurpose(data.purpose || "");
      } catch (e) {
        console.error(e);
      }
    } else {
      setHeroDesc("Rotaract Bangalore Warriors is a family of passionate young leaders committed to creating positive change through service, leadership, fellowship and innovation.");
      setWhoTitle("More than a Club,\nWe are a Movement");
      setWhoDesc("We are a team of passionate individuals who believe in the power of service and the impact of togetherness. Through meaningful projects and initiatives, we strive to build a better community and a stronger tomorrow.");
      setMission("To empower young leaders to drive positive community impact through service and fellowship.");
      setVision("To build a legacy of change, leadership excellence, and collaborative youth action in Bangalore.");
      setPurpose("Service Above Self - creating a cooperative platform for young minds to develop and grow.");
    }

    return () => unsubscribe();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !event.trim() || !date || !imagePreview) {
      setMessage({ type: "error", text: "Please fill in all required fields and upload an image." });
      return;
    }

    setPublishing(true);
    setMessage(null);

    try {
      // 1. Upload to storage
      const fileName = imageFile ? imageFile.name : `gallery_image_${Date.now()}.jpg`;
      const imageUrl = await uploadImageToStorage(imagePreview, fileName);

      // 2. Save metadata to Firestore
      const metadata: Omit<GalleryItem, "createdAt"> = {
        title,
        image: imageUrl,
        event,
        category,
        date,
        description,
        published: true // auto-publish
      };

      await saveImageMetadata(metadata);

      setMessage({ type: "success", text: "Memory successfully published to the Rotating Globe!" });
      
      // Reset form
      setTitle("");
      setEvent("");
      setDate("");
      setCategory("Community Service");
      setDescription("");
      setImageFile(null);
      setImagePreview(null);
      
      // Go back to list tab
      setTimeout(() => {
        setActiveTab("list");
        setMessage(null);
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: `Publishing failed: ${err.message || err}` });
    } finally {
      setPublishing(false);
    }
  };

  const handleAboutPublish = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { heroDesc, whoTitle, whoDesc, mission, vision, purpose };
    localStorage.setItem("warriors_about_us", JSON.stringify(data));
    setMessage({ type: "success", text: "About Us CMS changes published successfully!" });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Admin Top Navigation */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-burgundy-500 text-white font-extrabold text-sm shadow">
            RW
          </span>
          <div>
            <h1 className="text-base font-bold font-display tracking-wide">WARRIORS CMS</h1>
            <p className="text-[10px] font-bold text-burgundy-400 uppercase tracking-widest -mt-0.5">Rotaract Admin Portal</p>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-semibold bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-700">
          Connected Mode
        </div>
      </header>

      <div className="flex-1 max-w-[1200px] w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition duration-150 ${
              activeTab === "list"
                ? "border-burgundy-500 text-burgundy-500"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Gallery Overview ({items.length})
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition duration-150 ${
              activeTab === "upload"
                ? "border-burgundy-500 text-burgundy-500"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Upload New Image
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition duration-150 ${
              activeTab === "about"
                ? "border-burgundy-500 text-burgundy-500"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            About Us CMS
          </button>
        </div>

        {/* Messaging Feedback Banner */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl text-sm font-bold border ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Tab contents */}
        {activeTab === "list" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-premium overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase font-sans">Memory Database</h3>
              <button
                onClick={() => setActiveTab("upload")}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-burgundy-500 hover:bg-burgundy-600 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                + Publish Memory
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 font-medium">Loading database...</div>
            ) : items.length === 0 ? (
              <div className="p-16 text-center text-slate-400 font-medium">
                No memories published yet. Click "Upload New Image" to begin.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/30 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                      <th className="py-4 px-6">Image</th>
                      <th className="py-4 px-6">Title</th>
                      <th className="py-4 px-6">Event</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/40 transition">
                        <td className="py-4.5 px-6">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-10 object-cover rounded-lg border border-slate-200 bg-slate-50 shadow-sm"
                          />
                        </td>
                        <td className="py-4.5 px-6 font-bold text-slate-800">{item.title}</td>
                        <td className="py-4.5 px-6 text-slate-500 font-medium">{item.event}</td>
                        <td className="py-4.5 px-6 text-slate-400 font-mono text-xs">{item.date}</td>
                        <td className="py-4.5 px-6">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-burgundy-500 bg-burgundy-50 px-2 py-0.5 rounded border border-burgundy-100">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-4.5 px-6">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                            Live
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "upload" && (
          /* Image Upload Form CMS */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-premium p-6 sm:p-8 max-w-2xl mx-auto w-full">
            <h3 className="text-lg font-bold text-slate-800 font-display mb-6">Publish New Memory</h3>
            
            <form onSubmit={handlePublish} className="flex flex-col gap-5">
              
              {/* Image drag upload */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Image Cover File *</label>
                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl h-44 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 transition cursor-pointer overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    required
                  />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-center text-slate-400 px-4">
                      <svg className="h-8 w-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2.25" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" />
                      </svg>
                      <p className="text-xs font-bold">Drag and drop or click to upload photo</p>
                      <p className="text-[10px]">JPG, PNG, WebP up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Event Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Memory Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Clean Lakes Drive"
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy-500 transition"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Event / Phase Label *</label>
                  <input
                    type="text"
                    value={event}
                    onChange={(e) => setEvent(e.target.value)}
                    placeholder="e.g. Project Phase 2"
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Category, Date grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy-500 bg-white transition cursor-pointer"
                  >
                    <option value="Community Service">Community Service</option>
                    <option value="Professional Development">Professional Development</option>
                    <option value="International Service">International Service</option>
                    <option value="Vocational Service">Vocational Service</option>
                    <option value="Club Service">Club Service</option>
                    <option value="Environmental Service">Environmental Service</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Event Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">Memory Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell the story behind this photo..."
                  rows={3}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy-500 transition resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="px-5 py-2.5 bg-burgundy-500 hover:bg-burgundy-600 disabled:bg-burgundy-500/50 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
                >
                  {publishing ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Publishing...
                    </>
                  ) : (
                    "Publish Memory"
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {activeTab === "about" && (
          /* About Us CMS Form */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-premium p-6 sm:p-8 max-w-2xl mx-auto w-full text-left animate-fade-in">
            <h3 className="text-lg font-bold text-slate-800 font-display mb-6">About Us CMS Editor</h3>
            
            <form onSubmit={handleAboutPublish} className="flex flex-col gap-5">
              
              <div className="flex flex-col gap-1.5">
                <h4 className="text-xs font-black text-[#8B003A] uppercase tracking-wider border-b border-slate-100 pb-2 mb-2">Hero Section</h4>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Hero Description Text *</label>
                <textarea
                  value={heroDesc}
                  onChange={(e) => setHeroDesc(e.target.value)}
                  rows={3}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy-500 transition"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <h4 className="text-xs font-black text-[#8B003A] uppercase tracking-wider border-b border-slate-100 pb-2 mb-2">Who We Are Section</h4>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Who We Are Title (Use new lines for breaks) *</label>
                    <textarea
                      value={whoTitle}
                      onChange={(e) => setWhoTitle(e.target.value)}
                      rows={2}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy-500 transition"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Who We Are Description *</label>
                    <textarea
                      value={whoDesc}
                      onChange={(e) => setWhoDesc(e.target.value)}
                      rows={4}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy-500 transition"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <h4 className="text-xs font-black text-[#8B003A] uppercase tracking-wider border-b border-slate-100 pb-2 mb-2">Core Principles</h4>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Mission Statement *</label>
                    <textarea
                      value={mission}
                      onChange={(e) => setMission(e.target.value)}
                      rows={2}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy-500 transition"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Vision Statement *</label>
                    <textarea
                      value={vision}
                      onChange={(e) => setVision(e.target.value)}
                      rows={2}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy-500 transition"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Core Purpose / Motto *</label>
                    <textarea
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      rows={2}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy-500 transition"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-burgundy-500 hover:bg-burgundy-600 text-white font-bold py-3 rounded-xl transition-all shadow-md mt-4"
              >
                Publish Changes to Live About Page
              </button>

            </form>
          </div>
        )}
      </div>
    </main>
  );
}
