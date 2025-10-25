import { Card, CardBody } from '@heroui/react';
import type { DisasterStatistics } from '@/types/disaster';

interface StatsCardProps {
  stats: DisasterStatistics;
}

interface StatItemProps {
  icon: string;
  label: string;
  value: number;
  color: string;
  gradient: string;
}

function StatItem({ icon, label, value, color, gradient }: StatItemProps) {
  return (
    <Card className="border-none" style={{ background: gradient }}>
      <CardBody className="p-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
            {icon}
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white drop-shadow-lg">{value}</span>
            <span className="text-sm text-white/90">{label}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default function StatsCard({ stats }: StatsCardProps) {
  const statItems = [
    {
      icon: '🌍',
      label: 'Séismes',
      value: stats.earthquake,
      color: '#ef5350',
      gradient: 'linear-gradient(135deg, #ef5350 0%, #e53935 100%)',
    },
    {
      icon: '🔥',
      label: 'Incendies',
      value: stats.fire,
      color: '#ff9800',
      gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
    },
    {
      icon: '🌪️',
      label: 'Cyclones',
      value: stats.cyclone,
      color: '#42a5f5',
      gradient: 'linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)',
    },
    {
      icon: '🌊',
      label: 'Inondations',
      value: stats.flood,
      color: '#66bb6a',
      gradient: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
    },
    {
      icon: '🌋',
      label: 'Volcans',
      value: stats.volcano,
      color: '#ab47bc',
      gradient: 'linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%)',
    },
    {
      icon: '☀️',
      label: 'Sécheresses',
      value: stats.drought,
      color: '#fdd835',
      gradient: 'linear-gradient(135deg, #fdd835 0%, #fbc02d 100%)',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {statItems.map((item, index) => (
        <StatItem key={index} {...item} />
      ))}
    </div>
  );
}
