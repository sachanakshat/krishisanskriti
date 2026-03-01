"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Register() {
  const { t, lang } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    village: "",
    district: "",
    state: "",
    phone: "",
    land: "",
  });

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Registration failed");
      setStatus("success");
      setFormData({
        name: "",
        village: "",
        district: "",
        state: "",
        phone: "",
        land: "",
      });
    } catch {
      setStatus("error");
    }
  };

  const fields = [
    {
      key: "name",
      type: "text",
      label: t.register.name,
      placeholder: t.register.namePlaceholder,
    },
    {
      key: "village",
      type: "text",
      label: t.register.village,
      placeholder: t.register.villagePlaceholder,
    },
    {
      key: "district",
      type: "text",
      label: t.register.district,
      placeholder: t.register.districtPlaceholder,
    },
    {
      key: "state",
      type: "text",
      label: t.register.state,
      placeholder: t.register.statePlaceholder,
    },
    {
      key: "phone",
      type: "tel",
      label: t.register.phone,
      placeholder: t.register.phonePlaceholder,
    },
    {
      key: "land",
      type: "number",
      label: t.register.land,
      placeholder: t.register.landPlaceholder,
    },
  ];

  return (
    <div className="min-h-screen bg-[#050a05]">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-green-400 text-sm mb-8 transition-colors group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />
            {lang === "hi" ? "होम पर वापस जाएं" : "Back to Home"}
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📝</div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              {t.register.title}
            </h1>
            <p className="text-zinc-500 text-sm sm:text-base">
              {t.register.subtitle}
            </p>
          </div>

          {/* Form card */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
            {status === "success" ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-900/50 border border-green-700/50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Check size={28} className="text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {lang === "hi" ? "पंजीकरण सफल!" : "Registration Successful!"}
                </h3>
                <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                  {t.register.success}
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
                >
                  <ArrowLeft size={14} />
                  {lang === "hi" ? "होम पर वापस जाएं" : "Back to Home"}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-zinc-300 text-sm font-semibold mb-2">
                      {field.label}
                      <span className="text-green-600 ml-1">*</span>
                    </label>
                    <input
                      type={field.type}
                      name={field.key}
                      value={
                        formData[field.key as keyof typeof formData]
                      }
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required
                      min={field.type === "number" ? "0" : undefined}
                      step={field.type === "number" ? "0.1" : undefined}
                      className="w-full bg-zinc-800/70 border border-zinc-700/60 text-white placeholder-zinc-600 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-green-600/70 focus:ring-1 focus:ring-green-600/40 transition-all duration-200 hover:border-zinc-600"
                    />
                  </div>
                ))}

                {/* Payment note */}
                <div className="rounded-2xl bg-amber-950/20 border border-amber-900/25 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">🔒</span>
                    <div>
                      <p className="text-amber-400 text-xs font-semibold mb-1">
                        {t.payment.title}
                      </p>
                      <p className="text-zinc-500 text-xs leading-relaxed">
                        {t.payment.description}
                      </p>
                    </div>
                  </div>
                </div>

                {status === "error" && (
                  <div className="rounded-xl bg-red-950/30 border border-red-900/30 px-4 py-3">
                    <p className="text-red-400 text-sm">{t.register.error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold text-base rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-green-950/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {status === "loading"
                    ? t.register.submitting
                    : t.register.submit}
                </button>

                <p className="text-center text-zinc-600 text-xs">
                  {t.training.seats}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}