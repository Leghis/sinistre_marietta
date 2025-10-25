'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

import type { DisasterEvent, DisasterStatistics } from '@/types/disaster';

// Enregistrer les composants Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface DisasterChartProps {
  events: DisasterEvent[];
}

export default function DisasterChart({ events }: DisasterChartProps) {
  const { theme, systemTheme } = useTheme();

  // Déterminer le thème actuel
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  // Couleurs de texte adaptées au thème
  const textColor = isDark ? '#e8eaf6' : '#1a237e';
  const tooltipBg = isDark ? 'rgba(26, 35, 126, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const tooltipBorder = isDark ? '#7c4dff' : '#5c6bc0';

  // Calculer les statistiques
  const stats: DisasterStatistics = events.reduce(
    (acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      acc.total++;

      return acc;
    },
    {
      earthquake: 0,
      fire: 0,
      cyclone: 0,
      flood: 0,
      volcano: 0,
      drought: 0,
      storm: 0,
      total: 0,
    } as DisasterStatistics
  );

  // Couleurs correspondant aux types de catastrophes
  const colors = {
    earthquake: '#ef5350',
    fire: '#ff9800',
    cyclone: '#42a5f5',
    flood: '#66bb6a',
    volcano: '#ab47bc',
    drought: '#fdd835',
    storm: '#42a5f5',
  };

  // Préparer les données pour le graphique
  const chartData = {
    labels: [
      'Séismes',
      'Incendies',
      'Cyclones',
      'Inondations',
      'Volcans',
      'Sécheresses',
      'Tempêtes',
    ],
    datasets: [
      {
        label: 'Nombre d\'événements',
        data: [
          stats.earthquake,
          stats.fire,
          stats.cyclone,
          stats.flood,
          stats.volcano,
          stats.drought,
          stats.storm,
        ],
        backgroundColor: [
          colors.earthquake,
          colors.fire,
          colors.cyclone,
          colors.flood,
          colors.volcano,
          colors.drought,
          colors.storm,
        ],
        borderColor: [
          colors.earthquake,
          colors.fire,
          colors.cyclone,
          colors.flood,
          colors.volcano,
          colors.drought,
          colors.storm,
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: textColor,
          padding: 10,
          font: {
            size: 11,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%',
  };

  if (stats.total === 0) {
    return (
      <div className="flex items-center justify-center h-full text-default-400">
        <p className="text-sm text-center">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full" style={{ minHeight: '250px', maxHeight: '300px' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
