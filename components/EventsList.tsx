import { Card, CardBody, Chip, Link } from '@heroui/react';
import type { DisasterEvent } from '@/types/disaster';

interface EventsListProps {
  events: DisasterEvent[];
  maxItems?: number;
}

export default function EventsList({ events, maxItems = 20 }: EventsListProps) {
  const displayEvents = events.slice(0, maxItems);

  const getTypeEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      earthquake: '🌍',
      fire: '🔥',
      cyclone: '🌪️',
      flood: '🌊',
      volcano: '🌋',
      drought: '☀️',
      storm: '⛈️',
      other: '📍',
    };

    return emojis[type] || '📍';
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = {
      low: 'success',
      medium: 'warning',
      high: 'warning',
      critical: 'danger',
    };

    return colors[severity] || 'default';
  };

  const getSeverityLabel = (severity: string) => {
    const labels: Record<string, string> = {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé',
      critical: 'Critique',
    };

    return labels[severity] || severity;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return new Intl.DateTimeFormat('fr-FR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    }
  };

  if (displayEvents.length === 0) {
    return (
      <Card className="w-full">
        <CardBody>
          <p className="text-center text-default-400">Aucun événement à afficher</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {displayEvents.map((event) => (
        <Card key={event.id} className="w-full hover:bg-default-100 transition-colors">
          <CardBody className="p-4">
            <div className="flex flex-col gap-2">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <span className="text-2xl">{getTypeEmoji(event.type)}</span>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-semibold line-clamp-2">{event.title}</h4>
                    {event.description && (
                      <p className="text-xs text-default-500 line-clamp-1">{event.description}</p>
                    )}
                  </div>
                </div>
                <Chip color={getSeverityColor(event.severity)} size="sm" variant="flat">
                  {getSeverityLabel(event.severity)}
                </Chip>
              </div>

              {/* Details */}
              <div className="flex items-center gap-3 text-xs text-default-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formatDate(event.startDate)}
                </span>

                <span className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {event.latitude.toFixed(2)}°, {event.longitude.toFixed(2)}°
                </span>

                {event.magnitude && (
                  <span className="flex items-center gap-1 font-semibold">
                    M {event.magnitude.toFixed(1)}
                  </span>
                )}

                <span className="text-primary">
                  {event.source}
                </span>

                {event.sourceUrl && (
                  <Link
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    className="text-xs"
                  >
                    Plus d'infos →
                  </Link>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
