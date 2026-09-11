import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Truck, Store, ExternalLink } from 'lucide-react';
import { locationService } from '../services/locationService';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/EmptyState';

export const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await locationService.getLocations();
        setLocations(res.locations);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getDirections = (loc) => {
    const url = `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      <section className="bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 font-heading mb-3">
            Our Locations
          </h1>
          <p className="text-stone-600">Visit us across Kigali. Delivery and pickup available.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rect" className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <ErrorState onRetry={() => window.location.reload()} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((loc) => (
              <div key={loc._id} className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm hover:shadow-lg transition-shadow">
                <h2 className="text-lg font-semibold text-stone-900 mb-3">{loc.name}</h2>
                <div className="space-y-3 text-sm text-stone-600 mb-5">
                  <p className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-primary flex-shrink-0 mt-0.5" />
                    {loc.address}
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Phone size={16} className="text-primary flex-shrink-0" />
                    {loc.phone}
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Clock size={16} className="text-primary flex-shrink-0" />
                    {loc.openingHours}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium mb-5">
                  {loc.deliveryAvailable && (
                    <span className="flex items-center gap-1 text-green-600 bg-green-50 rounded-full px-2.5 py-1">
                      <Truck size={13} /> Delivery
                    </span>
                  )}
                  {loc.pickupAvailable && (
                    <span className="flex items-center gap-1 text-blue-600 bg-blue-50 rounded-full px-2.5 py-1">
                      <Store size={13} /> Pickup
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => getDirections(loc)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-stone-300 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <ExternalLink size={14} /> Get Directions
                  </button>
                  <Link
                    to="/menu"
                    className="flex-1 flex items-center justify-center rounded-full bg-primary text-white py-2 text-sm font-semibold hover:bg-primary-dark transition-colors"
                  >
                    Order From Here
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Locations;