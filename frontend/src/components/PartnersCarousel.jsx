import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

export const PartnersCarousel = ({ partners }) => {
  const [perSlide, setPerSlide] = useState(3);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    const update = () => setPerSlide(window.innerWidth < 640 ? 2 : 3);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const slides = chunk(partners, perSlide);

  useEffect(() => {
    setIndex(0);
  }, [perSlide, partners.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer.current);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  const go = (dir) =>
    setIndex((i) => (i + dir + slides.length) % slides.length);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((group, gi) => (
            <div
              key={gi}
              className="w-full flex-shrink-0 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 px-1"
              aria-label={`Partners slide ${gi + 1} of ${slides.length}`}
            >
              {group.map((p) => (
                <div
                  key={p._id}
                  className="flex flex-col items-center justify-center text-center rounded-2xl border border-stone-100 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden bg-stone-100 ring-2 ring-stone-100 shadow-sm flex items-center justify-center mb-3">
                    {p.logo ? (
                      <img
                        src={p.logo}
                        alt={`${p.name} logo`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-2xl sm:text-3xl font-black text-stone-400">
                        {p.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-stone-900 text-sm sm:text-base">{p.name}</h3>
                  {p.tagline && (
                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{p.tagline}</p>
                  )}
                  {p.website && (
                    <a
                      href={p.website.startsWith('http') ? p.website : `https://${p.website}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Visit <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            className="absolute left-1 sm:-left-5 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white border border-stone-200 shadow-md text-stone-600 hover:bg-stone-50 transition-colors"
            aria-label="Previous partners"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => go(1)}
            className="absolute right-1 sm:-right-5 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white border border-stone-200 shadow-md text-stone-600 hover:bg-stone-50 transition-colors"
            aria-label="Next partners"
          >
            <ChevronRight size={20} />
          </button>
          <div className="flex justify-center gap-1.5 mt-5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? 'w-6 bg-primary' : 'w-2 bg-stone-300 hover:bg-stone-400'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PartnersCarousel;