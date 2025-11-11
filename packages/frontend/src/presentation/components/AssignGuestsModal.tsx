/**
 * Presentation Layer - Assign Guests Modal
 * Modal for assigning guests to tables with search and filtering
 */

import { FC, useState, useMemo } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Users, Search, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useGuests } from '../../application/hooks/useGuests';
import { useAssignGuestToTable } from '../../application/hooks/useTables';
import { TableWithStats } from '../../domain/entities/Table';
import { Guest, GuestStatus } from '../../domain/entities/Guest';

interface AssignGuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: TableWithStats;
  eventId: string;
}

export const AssignGuestsModal: FC<AssignGuestsModalProps> = ({
  isOpen,
  onClose,
  table,
  eventId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyUnassigned, setShowOnlyUnassigned] = useState(true);

  const { data: allGuests = [], isLoading } = useGuests({ eventId });
  const assignMutation = useAssignGuestToTable();

  // Filter guests
  const filteredGuests = useMemo(() => {
    return allGuests.filter(guest => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(query);
        if (!matchesName) return false;
      }

      // Unassigned filter
      if (showOnlyUnassigned) {
        return !guest.tableNumber || guest.tableNumber === null;
      }

      return true;
    });
  }, [allGuests, searchQuery, showOnlyUnassigned]);

  // Guests currently at this table
  const currentGuests = useMemo(() => {
    return allGuests.filter(g => g.tableNumber === table.tableNumber);
  }, [allGuests, table.tableNumber]);

  // Calculate available seats
  const availableSeats = table.capacity - table.occupiedSeats;

  const handleAssign = (guest: Guest) => {
    // Check capacity
    const wouldExceedCapacity = table.occupiedSeats + guest.numberOfGuests > table.capacity;
    
    if (wouldExceedCapacity) {
      if (!window.confirm(
        `שיוך אורח זה יעבור את הקיבולת של השולחן (${table.occupiedSeats + guest.numberOfGuests}/${table.capacity}). להמשיך?`
      )) {
        return;
      }
    }

    assignMutation.mutate({
      guestId: guest.id,
      tableNumber: table.tableNumber,
      eventId,
    });
  };

  const handleUnassign = (guest: Guest) => {
    assignMutation.mutate({
      guestId: guest.id,
      tableNumber: null,
      eventId,
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`👥 שיוך אורחים לשולחן ${table.tableNumber}`}
      size="large"
    >
      <div className="space-y-6">
        {/* Table Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                שולחן {table.tableNumber}
                {table.section && <span className="text-sm text-blue-700"> • {table.section}</span>}
              </h4>
              <p className="text-sm text-blue-700">
                {table.occupiedSeats}/{table.capacity} מקומות תפוסים
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              availableSeats > 0
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {availableSeats > 0 ? `${availableSeats} מקומות פנויים` : 'מלא'}
            </div>
          </div>
        </div>

        {/* Current Guests */}
        {currentGuests.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              אורחים נוכחיים ({currentGuests.length})
            </h4>
            <div className="space-y-2">
              {currentGuests.map(guest => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {guest.firstName} {guest.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {guest.numberOfGuests} {guest.numberOfGuests === 1 ? 'מקום' : 'מקומות'}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="danger"
                    icon={<UserMinus className="h-4 w-4" />}
                    onClick={() => handleUnassign(guest)}
                    disabled={assignMutation.isPending}
                  >
                    הסר
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש אורח..."
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyUnassigned}
              onChange={(e) => setShowOnlyUnassigned(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">הצג רק אורחים שלא שוייכו לשולחן</span>
          </label>
        </div>

        {/* Available Guests */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            אורחים זמינים ({filteredGuests.length})
          </h4>
          
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">טוען אורחים...</p>
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">
                {searchQuery ? 'לא נמצאו אורחים התואמים לחיפוש' : 'אין אורחים זמינים'}
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredGuests.map(guest => {
                const isConfirmed = guest.status === GuestStatus.CONFIRMED;
                const isAssignedToThisTable = guest.tableNumber === table.tableNumber;
                const wouldExceedCapacity = !isAssignedToThisTable && 
                  (table.occupiedSeats + guest.numberOfGuests > table.capacity);

                return (
                  <div
                    key={guest.id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      isAssignedToThisTable
                        ? 'bg-green-50 border-green-200'
                        : guest.tableNumber
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-white border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className={`h-5 w-5 ${
                        isAssignedToThisTable
                          ? 'text-green-600'
                          : guest.tableNumber
                          ? 'text-gray-400'
                          : 'text-blue-600'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">
                          {guest.firstName} {guest.lastName}
                          {isConfirmed && <span className="text-green-600 mr-2">✓</span>}
                        </p>
                        <p className="text-sm text-gray-600">
                          {guest.numberOfGuests} {guest.numberOfGuests === 1 ? 'מקום' : 'מקומות'}
                          {guest.tableNumber && guest.tableNumber !== table.tableNumber && (
                            <span className="text-gray-500"> • שולחן {guest.tableNumber}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {!isAssignedToThisTable && (
                      <Button
                        size="sm"
                        variant={wouldExceedCapacity ? 'warning' : 'primary'}
                        icon={<UserPlus className="h-4 w-4" />}
                        onClick={() => handleAssign(guest)}
                        disabled={assignMutation.isPending}
                      >
                        {wouldExceedCapacity ? 'שייך (חריגה)' : 'שייך'}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            סגור
          </Button>
        </div>
      </div>
    </Modal>
  );
};

