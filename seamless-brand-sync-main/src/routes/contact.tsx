import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { apiClient } from "@/lib/api";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact MOCS — We're Here to Help" },
      {
        name: "description",
        content: "Get in touch with the MOCS team for support, orders, and partnership enquiries.",
      },
      { property: "og:title", content: "Contact MOCS" },
      { property: "og:description", content: "Reach the MOCS support team." },
    ],
  }),
  component: Contact,
});

const details = [
  { icon: Mail, label: "Email", value: "support@mocs.in" },
  { icon: Phone, label: "Phone", value: "+91 7994550834" },
  { icon: MapPin, label: "Location", value: "CORPORATE OFFICE MOCS FOOT CARE \n 7QJ8+42H, WEST HILL\n KOZHIKODE, KERALA 673005" },
];

function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const capitalize = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.queries.create({ name, email, subject, message });
      toast.success("Message sent!", { description: "We'll be in touch shortly." });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-12 text-left animate-in fade-in duration-300">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Get in touch</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-6xl text-white">Let's talk</h1>
          <p className="mt-4 text-zinc-400 font-medium">
            Questions about an order, a product, or a partnership? Our support team usually replies within a
            few hours.
          </p>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] items-start">
          {/* Details Column */}
          <div className="space-y-4">
            {details.map((d) => (
              <div
                key={d.label}
                className="flex items-center gap-4 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 p-5 shadow-soft"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary shrink-0">
                  <d.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                    {d.label}
                  </p>
                  <p className="font-semibold text-white mt-0.5 whitespace-pre-line text-sm leading-relaxed">
                    {d.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Form Column */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 p-6 shadow-soft text-left"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-400">Name</label>
                <input
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(capitalize(e.target.value))}
                  className="w-full rounded-xl border border-zinc-800 bg-[#0f0f12] px-3.5 py-2.5 text-sm outline-none focus:border-primary text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-400">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-[#0f0f12] px-3.5 py-2.5 text-sm outline-none focus:border-primary text-white"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-400">Subject</label>
              <input
                required
                placeholder="Topic of enquiry"
                value={subject}
                onChange={(e) => setSubject(capitalize(e.target.value))}
                className="w-full rounded-xl border border-zinc-800 bg-[#0f0f12] px-3.5 py-2.5 text-sm outline-none focus:border-primary text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-zinc-400">Message</label>
              <textarea
                required
                rows={4}
                placeholder="Write your message here..."
                value={message}
                onChange={(e) => setMessage(capitalize(e.target.value))}
                className="w-full rounded-xl border border-zinc-800 bg-[#0f0f12] px-3.5 py-2.5 text-sm outline-none focus:border-primary text-white resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-primary py-3.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition hover:bg-primary-glow disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Sending..." : "Send message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
