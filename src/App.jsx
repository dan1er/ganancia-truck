import { useState, useEffect } from 'react';
import {
  Truck,
  Fuel,
  User,
  Building2,
  Navigation,
  Wallet,
  Settings2,
  TrendingUp,
  MapPin
} from 'lucide-react';

const App = () => {
  const [grossPayment, setGrossPayment] = useState(3500);
  const [miles, setMiles] = useState(800);

  const [companyFeePct, setCompanyFeePct] = useState(22.5);
  const [driverPayPct, setDriverPayPct] = useState(30);
  const [mpg, setMpg] = useState(13);
  const [dieselPrice, setDieselPrice] = useState(4.15);
  const [avgTollsPerMile, setAvgTollsPerMile] = useState(0.12);

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

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Millas Totales</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="number"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={miles}
                      onChange={(e) => setMiles(Number(e.target.value))}
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
