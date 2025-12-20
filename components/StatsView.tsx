
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Language } from '../types';
import { translations } from '../i18n';

const dataAr = [
  { name: 'بلاستيك', value: 45 },
  { name: 'ورق', value: 25 },
  { name: 'زجاج', value: 15 },
  { name: 'معادن', value: 10 },
  { name: 'عضوي', value: 5 },
];

const dataFr = [
  { name: 'Plastique', value: 45 },
  { name: 'Papier', value: 25 },
  { name: 'Verre', value: 15 },
  { name: 'Métal', value: 10 },
  { name: 'Organique', value: 5 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export const StatsView: React.FC<{ lang: Language }> = ({ lang }) => {
  const data = lang === 'ar' ? dataAr : dataFr;
  const t = translations[lang];

  return (
    <div className="space-y-8 py-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">{t.statsTitle}</h2>
        <p className="text-slate-600">{t.statsDesc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96">
          <h3 className="text-lg font-semibold mb-4 text-center">
            {lang === 'ar' ? 'توزيع النفايات العالمية' : 'Distribution Mondiale des Déchets'}
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96">
          <h3 className="text-lg font-semibold mb-4 text-center">
            {lang === 'ar' ? 'كفاءة إعادة التدوير بالذكاء الاصطناعي' : 'Efficacité du Recyclage par IA'}
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
