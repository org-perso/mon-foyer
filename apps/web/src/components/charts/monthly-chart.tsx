"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney } from "@/lib/format";

export interface MonthlyPoint {
  month: string; // libellé court, ex. « oct. »
  income: string; // montants en chaîne décimale (pas de float côté API)
  expense: string;
}

/**
 * Graphique revenus / dépenses par mois.
 * Les chaînes ne sont converties en nombre que pour le tracé, jamais pour un calcul.
 */
export function MonthlyChart({ data, currency }: { data: MonthlyPoint[]; currency: string }) {
  const series = data.map((d) => ({ ...d, income: Number(d.income), expense: Number(d.expense) }));
  return (
    <figure className="h-64 w-full" aria-label="Revenus et dépenses par mois">
      <ResponsiveContainer>
        <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="var(--muted)" fontSize={12} />
          <YAxis tickLine={false} axisLine={false} stroke="var(--muted)" fontSize={12} width={56} />
          <Tooltip formatter={(value) => formatMoney(String(value), currency)} />
          <Legend />
          <Bar dataKey="income" name="Revenus" fill="var(--income)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Dépenses" fill="var(--expense)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </figure>
  );
}
