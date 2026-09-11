import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { useToast } from '../context/ToastContext';

export const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <section className="bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 font-heading mb-3">
            Get In Touch
          </h1>
          <p className="text-stone-600">Questions, feedback or bulk orders? We'd love to hear from you.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-3 gap-10">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-100 p-5 flex items-start gap-4 shadow-sm">
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Phone size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-stone-800 text-sm">Call Us</h3>
              <p className="text-sm text-stone-500">+250 788 519 671</p>
              <p className="text-sm text-stone-500">+250 722 987 654</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 p-5 flex items-start gap-4 shadow-sm">
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-stone-800 text-sm">Email Us</h3>
              <p className="text-sm text-stone-500"> icyezacoffee@gmail.com</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 p-5 flex items-start gap-4 shadow-sm">
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-stone-800 text-sm">Visit Us</h3>
              <p className="text-sm text-stone-500">KN 4 Ave, Nyarugenge, Kigali</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 p-5 flex items-start gap-4 shadow-sm">
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-stone-800 text-sm">Opening Hours</h3>
              <p className="text-sm text-stone-500">Mon - Sun: 08:00 - 22:00</p>
              <p className="text-sm text-stone-500">Delivery until 21:30</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Send us a message</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Your Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jean Mugisha"
            />
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
            <Input
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="07xxxxxxxx"
            />
            <Input
              label="Subject"
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="How can we help?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5" htmlFor="message">
              Message <span className="text-primary">*</span>
            </label>
            <textarea
              id="message"
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Write your message here..."
              className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button type="submit" loading={sending}>
            <Send size={16} /> Send Message
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Contact;