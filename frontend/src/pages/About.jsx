import { motion } from 'framer-motion';
import { Flame, Leaf, Heart, Sparkles, Quote } from 'lucide-react';

const values = [
  {
    icon: Flame,
    title: 'Fresh, Always',
    desc: 'Every meal is prepared to order with fresh ingredients. Nothing sits under a heat lamp in our kitchen.',
  },
  {
    icon: Leaf,
    title: 'Quality First',
    desc: 'We source the best local produce and halal-certified chicken for flavour you can taste in every bite.',
  },
  {
    icon: Heart,
    title: 'Made for Sharing',
    desc: 'Food brings people together. Our combos are designed around the family table.',
  },
  {
    icon: Sparkles,
    title: 'Community',
    desc: 'From Kigali city center to your neighbourhood, we take pride in serving our community.',
  },
];

export const About = () => {
  return (
    <div>
      <section className="bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 font-heading mb-4">
                Your Story Over <span className="text-primary">Good Food</span>
              </h1>
              <p className="text-lg text-stone-600 leading-relaxed">
                Icyeza One Coffee Shop started with a simple idea: great food should be easy to get. What
                began as a small kitchen in Kigali has grown into a place where families, friends
                and colleagues gather around fresh, flavourful meals made with care.
              </p>
            </motion.div>
            <motion.img
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200"
              alt="Inside our restaurant kitchen"
              className="rounded-3xl shadow-xl object-cover h-80 lg:h-[420px] w-full"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-heading text-center mb-10">
          What We Stand For
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl border border-stone-100 p-6 text-center shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="inline-flex h-14 w-14 rounded-2xl bg-primary/10 text-primary items-center justify-center mb-4">
                <value.icon size={26} />
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">{value.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-charcoal text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Quote className="mx-auto mb-6 text-primary" size={40} />
          <p className="text-xl sm:text-2xl font-heading font-medium leading-relaxed mb-4">
            "People don't just order from us for the food — they come back for how it makes them feel.
            Full, happy and part of something."
          </p>
          <p className="text-stone-400">— The Icyeza One Coffee Shop Kitchen Team</p>
        </div>
      </section>
    </div>
  );
};

export default About;