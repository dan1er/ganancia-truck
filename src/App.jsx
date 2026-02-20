import { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  Fuel,
  User,
  Building2,
  Navigation,
  Wallet,
  Settings2,
  TrendingUp,
  MapPin,
  ArrowRight,
  Loader2
} from 'lucide-react';

const ROAD_FACTOR = 1.3;

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchZipCoords(zip) {
  const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
  if (!res.ok) throw new Error(`Zip code "${zip}" not found`);
  const data = await res.json();
  return {
    lat: parseFloat(data.places[0].latitude),
    lng: parseFloat(data.places[0].longitude),
    city: data.places[0]['place name'],
    state: data.places[0]['state abbreviation'],
  };
}

const STORAGE_KEY = 'ganancia-truck-config';

const DEFAULTS = {
  companyFeePct: 22.5,
  driverPayPct: 30,
  mpg: 13,
  dieselPrice: 4.15,
  avgTollsPerMile: 0.12,
};

function loadConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...DEFAULTS, ...saved } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

const App = () => {
  const [grossPayment, setGrossPayment] = useState(3500);
  const [miles, setMiles] = useState(800);

  const [fromZip, setFromZip] = useState('');
  const [toZip, setToZip] = useState('');
  const [zipError, setZipError] = useState('');
  const [zipLoading, setZipLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  const saved = loadConfig();
  const [companyFeePct, setCompanyFeePct] = useState(saved.companyFeePct);
  const [driverPayPct, setDriverPayPct] = useState(saved.driverPayPct);
  const [mpg, setMpg] = useState(saved.mpg);
  const [dieselPrice, setDieselPrice] = useState(saved.dieselPrice);
  const [avgTollsPerMile, setAvgTollsPerMile] = useState(saved.avgTollsPerMile);

  // Persist config changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      companyFeePct, driverPayPct, mpg, dieselPrice, avgTollsPerMile,
    }));
  }, [companyFeePct, driverPayPct, mpg, dieselPrice, avgTollsPerMile]);

  const [results, setResults] = useState({
    companyFee: 0,
    driverPay: 0,
    fuelCost: 0,
    tolls: 0,
    totalExpenses: 0,
    netProfit: 0,
    margin: 0
  });

  useEffect(() => {
    const companyFee = grossPayment * (companyFeePct / 100);
    const driverPay = grossPayment * (driverPayPct / 100);
    const gallonsNeeded = miles / mpg;
    const fuelCost = gallonsNeeded * dieselPrice;
    const tolls = miles * avgTollsPerMile;

    const totalExpenses = companyFee + driverPay + fuelCost + tolls;
    const netProfit = grossPayment - totalExpenses;
    const margin = grossPayment > 0 ? (netProfit / grossPayment) * 100 : 0;

    setResults({
      companyFee,
      driverPay,
      fuelCost,
      tolls,
      totalExpenses,
      netProfit,
      margin
    });
  }, [grossPayment, miles, companyFeePct, driverPayPct, mpg, dieselPrice, avgTollsPerMile]);

  const calculateMiles = useCallback(async () => {
    if (fromZip.length !== 5 || toZip.length !== 5) {
      setZipError('Enter two valid 5-digit zip codes');
      return;
    }
    setZipError('');
    setZipLoading(true);
    setRouteInfo(null);
    try {
      const [from, to] = await Promise.all([
        fetchZipCoords(fromZip),
        fetchZipCoords(toZip),
      ]);
      const straight = haversineDistance(from.lat, from.lng, to.lat, to.lng);
      const estimated = Math.round(straight * ROAD_FACTOR);
      setMiles(estimated);
      setRouteInfo({ from, to, estimated });
    } catch (err) {
      setZipError(err.message);
    } finally {
      setZipLoading(false);
    }
  }, [fromZip, toZip]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="bg-blue-600 p-2.5 sm:p-3 rounded-2xl shadow-lg shadow-blue-200">
            <Truck className="text-white w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Calculadora de Carga</h1>
            <p className="text-slate-500 text-xs sm:text-sm">Resumen financiero para dueños de camión</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Panel de Entradas */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <section className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600" /> Datos del Viaje
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Pago Bruto (Gross)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={grossPayment}
                      onChange={(e) => setGrossPayment(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Zip Code Fields */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Ruta (Zip Codes)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      placeholder="Origen"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-center text-sm"
                      value={fromZip}
                      onChange={(e) => setFromZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    />
                    <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      placeholder="Destino"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-center text-sm"
                      value={toZip}
                      onChange={(e) => setToZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    />
                  </div>
                  <button
                    onClick={calculateMiles}
                    disabled={zipLoading || fromZip.length !== 5 || toZip.length !== 5}
                    className="mt-2 w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {zipLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    Calcular Millas
                  </button>
                  {zipError && (
                    <p className="text-red-500 text-xs mt-1.5">{zipError}</p>
                  )}
                  {routeInfo && (
                    <p className="text-emerald-600 text-xs mt-1.5">
                      {routeInfo.from.city}, {routeInfo.from.state} → {routeInfo.to.city}, {routeInfo.to.state}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Millas Totales
                    {routeInfo && <span className="text-slate-400 font-normal"> (est.)</span>}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="number"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={miles}
                      onChange={(e) => { setMiles(Number(e.target.value)); setRouteInfo(null); }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-slate-600" /> Configuración
              </h2>

              <div className="space-y-3 sm:space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Empresa (%)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                      value={companyFeePct}
                      onChange={(e) => setCompanyFeePct(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Chofer (%)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                      value={driverPayPct}
                      onChange={(e) => setDriverPayPct(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Diesel ($/gal)</label>
                    <input
                      type="number" step="0.01"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                      value={dieselPrice}
                      onChange={(e) => setDieselPrice(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Camión (MPG)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                      value={mpg}
                      onChange={(e) => setMpg(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Peaje Promedio ($/milla)</label>
                  <input
                    type="number" step="0.01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    value={avgTollsPerMile}
                    onChange={(e) => setAvgTollsPerMile(Number(e.target.value))}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Panel de Resultados */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Main Result Card */}
            <div className="bg-blue-600 text-white p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-blue-200 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-blue-100 text-xs sm:text-sm font-medium uppercase tracking-wider mb-1 sm:mb-2">Ganancia Neta Estimada</p>
                <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">{formatCurrency(results.netProfit)}</h2>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                    <p className="text-blue-100 text-xs mb-1">Margen</p>
                    <p className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-white">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> {results.margin.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                    <p className="text-blue-100 text-xs mb-1">Gastos Totales</p>
                    <p className="text-lg sm:text-xl font-semibold text-white">{formatCurrency(results.totalExpenses)}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 flex items-center gap-3 sm:gap-4">
                <div className="bg-amber-100 p-2 sm:p-3 rounded-xl sm:rounded-2xl shrink-0">
                  <Building2 className="text-amber-600 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-500 text-[10px] sm:text-xs font-medium truncate">Empresa ({companyFeePct}%)</p>
                  <p className="text-base sm:text-lg font-bold">{formatCurrency(results.companyFee)}</p>
                </div>
              </div>

              <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 flex items-center gap-3 sm:gap-4">
                <div className="bg-purple-100 p-2 sm:p-3 rounded-xl sm:rounded-2xl shrink-0">
                  <User className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-500 text-[10px] sm:text-xs font-medium truncate">Chofer ({driverPayPct}%)</p>
                  <p className="text-base sm:text-lg font-bold">{formatCurrency(results.driverPay)}</p>
                </div>
              </div>

              <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 flex items-center gap-3 sm:gap-4">
                <div className="bg-emerald-100 p-2 sm:p-3 rounded-xl sm:rounded-2xl shrink-0">
                  <Fuel className="text-emerald-600 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-500 text-[10px] sm:text-xs font-medium">Combustible</p>
                  <p className="text-base sm:text-lg font-bold">{formatCurrency(results.fuelCost)}</p>
                </div>
              </div>

              <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 flex items-center gap-3 sm:gap-4">
                <div className="bg-slate-100 p-2 sm:p-3 rounded-xl sm:rounded-2xl shrink-0">
                  <Wallet className="text-slate-600 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-500 text-[10px] sm:text-xs font-medium">Peajes</p>
                  <p className="text-base sm:text-lg font-bold">{formatCurrency(results.tolls)}</p>
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100">
              <h3 className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4 text-slate-700">Distribución del Pago Bruto</h3>
              <div className="w-full h-3 sm:h-4 bg-slate-100 rounded-full overflow-hidden flex">
                <div style={{ width: `${(results.companyFee/grossPayment)*100}%` }} className="bg-amber-400 h-full" title="Empresa"></div>
                <div style={{ width: `${(results.driverPay/grossPayment)*100}%` }} className="bg-purple-500 h-full" title="Chofer"></div>
                <div style={{ width: `${(results.fuelCost/grossPayment)*100}%` }} className="bg-emerald-500 h-full" title="Combustible"></div>
                <div style={{ width: `${(results.tolls/grossPayment)*100}%` }} className="bg-slate-400 h-full" title="Peajes"></div>
                <div style={{ width: `${(results.netProfit/grossPayment)*100}%` }} className="bg-blue-600 h-full" title="Ganancia"></div>
              </div>
              <div className="mt-3 sm:mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold">
                  <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></div> Empresa
                </div>
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold">
                  <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></div> Chofer
                </div>
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div> Diesel
                </div>
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold">
                  <div className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></div> Peajes
                </div>
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold">
                  <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></div> Ganancia
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
