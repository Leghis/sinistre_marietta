import { Card, CardBody, CardHeader, Divider, Checkbox, Select, SelectItem } from '@heroui/react';
import type { DisasterType, SeverityLevel } from '@/types/disaster';

interface FilterPanelProps {
  selectedTypes: DisasterType[];
  onTypeChange: (types: DisasterType[]) => void;
  minSeverity: SeverityLevel | 'all';
  onSeverityChange: (severity: SeverityLevel | 'all') => void;
}

export default function FilterPanel({
  selectedTypes,
  onTypeChange,
  minSeverity,
  onSeverityChange,
}: FilterPanelProps) {
  const disasterTypes: Array<{ value: DisasterType; label: string; emoji: string; color: string }> = [
    { value: 'earthquake', label: 'Séismes', emoji: '🌍', color: 'danger' },
    { value: 'fire', label: 'Incendies', emoji: '🔥', color: 'warning' },
    { value: 'cyclone', label: 'Cyclones', emoji: '🌪️', color: 'primary' },
    { value: 'flood', label: 'Inondations', emoji: '🌊', color: 'success' },
    { value: 'volcano', label: 'Volcans', emoji: '🌋', color: 'secondary' },
    { value: 'drought', label: 'Sécheresses', emoji: '☀️', color: 'warning' },
  ];

  const severityLevels = [
    { value: 'all', label: 'Tous les niveaux' },
    { value: 'low', label: 'Faible et plus' },
    { value: 'medium', label: 'Moyen et plus' },
    { value: 'high', label: 'Élevé et plus' },
    { value: 'critical', label: 'Critique uniquement' },
  ];

  const handleTypeToggle = (type: DisasterType) => {
    if (selectedTypes.includes(type)) {
      onTypeChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypeChange([...selectedTypes, type]);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-md font-semibold">Filtres</p>
          <p className="text-small text-default-500">Affiner les résultats</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="gap-4">
        {/* Filtres par type */}
        <div>
          <p className="text-sm font-semibold mb-2">Types de catastrophes</p>
          <div className="flex flex-col gap-2">
            {disasterTypes.map((type) => (
              <Checkbox
                key={type.value}
                isSelected={selectedTypes.includes(type.value)}
                onValueChange={() => handleTypeToggle(type.value)}
                color={type.color as any}
              >
                <span className="flex items-center gap-2">
                  <span>{type.emoji}</span>
                  <span>{type.label}</span>
                </span>
              </Checkbox>
            ))}
          </div>
        </div>

        <Divider />

        {/* Filtre par gravité */}
        <div>
          <p className="text-sm font-semibold mb-2">Niveau de gravité</p>
          <Select
            label="Niveau minimal"
            placeholder="Sélectionner un niveau"
            selectedKeys={[minSeverity]}
            onChange={(e) => onSeverityChange(e.target.value as SeverityLevel | 'all')}
            className="w-full"
          >
            {severityLevels.map((level) => (
              <SelectItem key={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </CardBody>
    </Card>
  );
}
