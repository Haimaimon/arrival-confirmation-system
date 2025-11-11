/**
 * Presentation Layer - Dashboard Page
 * Shows real-time statistics from all user events
 */

import { FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/Card';
import { Users, CheckCircle, XCircle, Clock, Calendar, Loader2 } from 'lucide-react';
import { useEvents } from '../../application/hooks/useEvents';
import { getEventTypeLabel, formatEventDate } from '../../domain/entities/Event';

const DashboardPage: FC = () => {
  const navigate = useNavigate();
  const { events, isLoading } = useEvents();

  // Calculate total statistics from ALL events
  const stats = useMemo(() => {
    const totals = {
      totalInvited: 0,
      confirmed: 0,
      declined: 0,
      pending: 0,
    };

    events.forEach(event => {
      totals.totalInvited += event.totalInvited || 0;
      totals.confirmed += event.totalConfirmed || 0;
      totals.declined += event.totalDeclined || 0;
      totals.pending += event.totalPending || 0;
    });

    return totals;
  }, [events]);

  // Get upcoming events (sorted by date)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(event => new Date(event.eventDate) >= now)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .slice(0, 3); // Show max 3 upcoming events
  }, [events]);

  // Calculate confirmation rate
  const confirmationRate = stats.totalInvited > 0 
    ? Math.round((stats.confirmed / stats.totalInvited) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">דשבורד</h1>
        <p className="text-gray-500">סקירה כללית של האירועים שלך ({events.length} אירועים)</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="סה״כ מוזמנים"
          value={stats.totalInvited}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="אישרו הגעה"
          value={stats.confirmed}
          icon={<CheckCircle className="h-6 w-6" />}
          color="green"
          trend={{ value: confirmationRate, isPositive: true }}
        />
        <StatCard
          title="סירבו"
          value={stats.declined}
          icon={<XCircle className="h-6 w-6" />}
          color="red"
        />
        <StatCard
          title="ממתינים"
          value={stats.pending}
          icon={<Clock className="h-6 w-6" />}
          color="yellow"
        />
      </div>

      {/* Recent Events */}
      <Card title="אירועים קרובים" subtitle="האירועים הבאים שלך">
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">אין אירועים קרובים</p>
            <button
              onClick={() => navigate('/events')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              צור אירוע חדש
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => navigate(`/events/${event.id}/guests`)}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {event.name || getEventTypeLabel(event.type)}
                    </h4>
                    <p className="text-sm text-gray-500">{formatEventDate(event.eventDate)}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-gray-900">{event.totalConfirmed || 0}</p>
                  <p className="text-sm text-gray-500">מתוך {event.totalInvited || 0} אישרו</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card title="פעולות מהירות">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              if (events.length > 0) {
                navigate(`/events/${events[0].id}/guests`);
              } else {
                navigate('/events');
              }
            }}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">הוסף אורחים</p>
          </button>
          <button
            onClick={() => navigate('/events')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">צור אירוע חדש</p>
          </button>
          <button
            onClick={() => {
              if (events.length > 0) {
                navigate(`/events/${events[0].id}/guests`);
              }
            }}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <CheckCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">שלח תזכורות</p>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;

