/**
 * Presentation Layer - Events Page
 */

import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CreateEventModal } from '../components/CreateEventModal';
import { useEvents } from '../../application/hooks/useEvents';
import { Calendar, Users, MapPin, Plus, Loader } from 'lucide-react';

const EventsPage: FC = () => {
  const navigate = useNavigate();
  const { events, isLoading, deleteEvent, isDeleting } = useEvents();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את האירוע "${name}"?`)) {
      deleteEvent(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">האירועים שלי</h1>
            <p className="text-gray-500">{events.length} אירועים פעילים</p>
          </div>
          <Button
            variant="primary"
            icon={<Plus className="h-5 w-5" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            אירוע חדש
          </Button>
        </div>

        {events.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">אין אירועים עדיין</h3>
            <p className="text-gray-500 mb-4">צור את האירוע הראשון שלך כדי להתחיל</p>
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              צור אירוע חדש
            </Button>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{event.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.eventDate).toLocaleDateString('he-IL')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>{event.venue.name}, {event.venue.city}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{event.totalInvited}</p>
                    <p className="text-xs text-gray-500">מוזמנים</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{event.totalConfirmed}</p>
                    <p className="text-xs text-gray-500">אישרו</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{event.totalPending}</p>
                    <p className="text-xs text-gray-500">ממתינים</p>
                  </div>
                </div>

                {/* Progress bar */}
                {event.totalInvited > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>אחוז אישורים</span>
                      <span className="font-medium">
                        {Math.round((event.totalConfirmed / event.totalInvited) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${(event.totalConfirmed / event.totalInvited) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/events/${event.id}/guests`)}
                  >
                    <Users className="h-4 w-4" />
                    ניהול אורחים
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/events/${event.id}/seating`)}
                  >
                    סידורי הושבה
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(event.id, event.name)}
                    disabled={isDeleting}
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </>
  );
};

export default EventsPage;

