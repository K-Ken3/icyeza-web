import { Link } from 'react-router-dom';
import { Phone, Mail, Clock, Music2 } from 'lucide-react';

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={16} height={16} {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
);

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={16} height={16} {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const XIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14} {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const footerCols = [
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Careers', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Locations', to: '/locations' },
    ],
  },
  {
    title: 'Menu',
    links: [
      { label: 'Chicken', to: '/menu/chicken' },
      { label: 'Burgers', to: '/menu/burgers' },
      { label: 'Combos', to: '/menu/combos' },
      { label: 'Drinks', to: '/menu/drinks' },
      { label: 'Deals', to: '/deals' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', to: '/contact' },
      { label: 'Delivery Info', to: '/locations' },
      { label: 'Refund Policy', to: '/contact' },
      { label: 'Terms & Conditions', to: '/contact' },
      { label: 'Privacy Policy', to: '/contact' },
    ],
  },
];

const socials = [
  { label: 'Instagram', icon: InstagramIcon },
  { label: 'Facebook', icon: FacebookIcon },
  { label: 'TikTok', icon: Music2 },
  { label: 'X', icon: XIcon },
];

export const Footer = () => {
  return (
    <footer className="bg-charcoal text-stone-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Icyeza One Coffee Shop" className="rounded-lg object-contain" style={{ height: 36 }} />
              <span className="text-lg font-bold text-white font-heading">
                Icyeza One Coffee Shop
              </span>
            </div>
            <p className="text-sm text-stone-400 mb-4 max-w-sm">
              Good food, made for sharing. Freshly prepared meals delivered hot and ready to
              enjoy, straight to your door in Kigali and beyond.
            </p>
            <div className="flex items-center gap-2">
              {socials.map(({ label, icon: Icon }) => (
                <a
                  key={label}
                  href="#"
                  className="h-9 w-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition-colors"
                  aria-label={label}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {footerCols.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white mb-3">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-stone-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-stone-400">
            &copy; 2026 Icyeza One Coffee Shop. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-stone-400">
            <span className="flex items-center gap-1.5">
              <Phone size={14} /> +250 788 123 456
            </span>
            <span className="flex items-center gap-1.5">
              <Mail size={14} /> hello@flameandfork.rw
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} /> 08:00 - 22:00
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
