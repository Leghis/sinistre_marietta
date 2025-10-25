import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Button, Card, CardBody, CardHeader, Divider, Spinner, Input } from '@heroui/react';
import DefaultLayout from '@/layouts/default';
import StatsCard from '@/components/StatsCard';
import FilterPanel from '@/components/FilterPanel';
import DisasterChart from '@/components/DisasterChart';
import EventsList from '@/components/EventsList';
import { fetchAllDisasterEvents } from '@/services/disasterApi';
import type { DisasterEvent, DisasterType, SeverityLevel, DisasterStatistics } from '@/types/disaster';

// Chargement dynamique du composant Map (Leaflet ne supporte pas le SSR)
const DisasterMap = dynamic(() => import('@/components/DisasterMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-default-100 rounded-lg">
      <Spinner size="lg" label="Chargement de la carte..." />
    </div>
  ),
});

export default function IndexPage() {
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Filtres
  const [selectedTypes, setSelectedTypes] = useState<DisasterType[]>([
    'earthquake',
    'fire',
    'cyclone',
    'flood',
    'volcano',
    'drought',
  ]);
  const [minSeverity, setMinSeverity] = useState<SeverityLevel | 'all'>('all');
  const [countrySearch, setCountrySearch] = useState<string>('');

  // Charger les données
  const loadEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAllDisasterEvents();
      setEvents(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Erreur lors du chargement des événements:', err);
      setError('Impossible de charger les données. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Filtrer les événements
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filtrer par type
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((event) => selectedTypes.includes(event.type));
    }

    // Filtrer par gravité
    if (minSeverity !== 'all') {
      const severityOrder: Record<string, number> = {
        low: 1,
        medium: 2,
        high: 3,
        critical: 4,
      };
      const minLevel = severityOrder[minSeverity];
      filtered = filtered.filter((event) => severityOrder[event.severity] >= minLevel);
    }

    // Filtrer par pays
    if (countrySearch.trim()) {
      const searchLower = countrySearch.toLowerCase();
      filtered = filtered.filter((event) => {
        // Rechercher dans le titre, la description et les pays affectés
        const inTitle = event.title.toLowerCase().includes(searchLower);
        const inDescription = event.description?.toLowerCase().includes(searchLower);
        const inCountries = event.affectedCountries?.some(
          (country) => country.toLowerCase().includes(searchLower)
        );

        return inTitle || inDescription || inCountries;
      });
    }

    return filtered;
  }, [events, selectedTypes, minSeverity, countrySearch]);

  // Calculer les statistiques
  const statistics: DisasterStatistics = useMemo(() => {
    return filteredEvents.reduce(
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
  }, [filteredEvents]);

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return '--:--';

    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <DefaultLayout>
      <div className="w-full min-h-screen">
        {/* Header Section - Simplifié */}
        <section className="flex flex-col items-center justify-center gap-4 py-6">
          <h1 className="text-3xl md:text-5xl font-bold text-center">
            🌍 Catastrophes Naturelles Mondiales
          </h1>

          <div className="flex flex-col md:flex-row gap-3 items-center w-full max-w-4xl px-4">
            <Input
              type="text"
              placeholder="Rechercher par pays ou localisation..."
              value={countrySearch}
              onValueChange={setCountrySearch}
              className="flex-1"
              startContent={
                <svg
                  className="w-5 h-5 text-default-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
              isClearable
              onClear={() => setCountrySearch('')}
            />

            <Button
              color="primary"
              variant="shadow"
              onPress={loadEvents}
              isLoading={loading}
              startContent={
                !loading && (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                )
              }
            >
              Actualiser
            </Button>
          </div>

          {lastUpdate && (
            <p className="text-sm text-default-500">
              Dernière mise à jour : <span className="font-semibold">{formatLastUpdate(lastUpdate)}</span>
            </p>
          )}

          {error && (
            <div className="max-w-2xl w-full px-4">
              <Card className="bg-danger-50 border-2 border-danger">
                <CardBody>
                  <p className="text-danger text-center">{error}</p>
                </CardBody>
              </Card>
            </div>
          )}
        </section>

        {/* Stats Section */}
        <section className="w-full max-w-7xl mx-auto px-6 py-6">
          <StatsCard stats={statistics} />
        </section>

        {/* Main Content */}
        <section className="w-full max-w-7xl mx-auto px-6 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar - Filters & Chart */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <FilterPanel
                selectedTypes={selectedTypes}
                onTypeChange={setSelectedTypes}
                minSeverity={minSeverity}
                onSeverityChange={setMinSeverity}
              />

              <Card>
                <CardHeader>
                  <p className="text-md font-semibold">Répartition par type</p>
                </CardHeader>
                <Divider />
                <CardBody>
                  <DisasterChart events={filteredEvents} />
                </CardBody>
              </Card>
            </div>

            {/* Map Section */}
            <div className="lg:col-span-2">
              <Card className="w-full">
                <CardHeader className="flex justify-between">
                  <div className="flex flex-col">
                    <p className="text-md font-semibold">Carte mondiale des catastrophes</p>
                    <p className="text-small text-default-500">
                      {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} affiché{filteredEvents.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody className="p-0">
                  <div className="w-full" style={{ height: '600px' }}>
                    {!loading && <DisasterMap events={filteredEvents} />}
                    {loading && (
                      <div className="w-full h-full flex items-center justify-center">
                        <Spinner size="lg" label="Chargement des données..." />
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </section>

        {/* Events List Section */}
        <section className="w-full max-w-7xl mx-auto px-6 pb-12">
          <Card>
            <CardHeader>
              <div className="flex flex-col">
                <p className="text-lg font-semibold">Événements récents</p>
                <p className="text-small text-default-500">
                  Les {Math.min(20, filteredEvents.length)} événements les plus récents
                </p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="lg" />
                </div>
              ) : (
                <EventsList events={filteredEvents} maxItems={20} />
              )}
            </CardBody>
          </Card>
        </section>

        {/* Footer Info */}
        <section className="w-full max-w-7xl mx-auto px-6 pb-8">
          <Card>
            <CardBody>
              <div className="text-center text-sm text-default-500">
                <p className="mb-2">
                  Les données proviennent de{' '}
                  <span className="font-semibold text-primary">GDACS</span>,{' '}
                  <span className="font-semibold text-primary">NASA EONET</span>, et{' '}
                  <span className="font-semibold text-primary">USGS</span>
                </p>
                <p className="text-xs mb-3">
                  Cette application affiche les catastrophes naturelles des 7 derniers jours.
                  Les données sont mises à jour en temps réel depuis les sources officielles.
                </p>
                <p className="text-sm font-semibold text-primary">
                  Développé par Njikam
                </p>
              </div>
            </CardBody>
          </Card>
        </section>
      </div>
    </DefaultLayout>
  );
}
