/**
 * Presentation Layer - Seating Page
 * Complete seating arrangement management with real-time data
 */

import { FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus, Users, AlertCircle, Edit, Trash2, UserPlus, Loader2 } from 'lucide-react';
import { useTableStats, useDeleteTable } from '../../application/hooks/useTables';
import { CreateTableModal } from '../components/CreateTableModal';
import { EditTableModal } from '../components/EditTableModal';
import { AssignGuestsModal } from '../components/AssignGuestsModal';
import { SeatingOptimizationModal } from '../components/SeatingOptimizationModal';
import { TableWithStats } from '../../domain/entities/Table';

const SeatingPage: FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  
  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isOptimizationModalOpen, setIsOptimizationModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableWithStats | null>(null);

  // Fetch data
  const { data: stats, isLoading } = useTableStats(eventId!);
  const deleteMutation = useDeleteTable();

  if (!eventId) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Event ID not found</p>
      </div>
    );
  }

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

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">אין נתוני שולחנות</p>
        <Button 
          variant="primary" 
          icon={<Plus className="h-5 w-5" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          הוסף שולחן ראשון
        </Button>
      </div>
    );
  }

  const { totalTables, totalCapacity, totalOccupied, emptySeats, tables } = stats;

  const getTableColor = (occupiedSeats: number, capacity: number) => {
    const percentage = (occupiedSeats / capacity) * 100;
    if (percentage === 0) return 'bg-gray-100 border-gray-300 hover:border-gray-400';
    if (percentage < 50) return 'bg-yellow-100 border-yellow-300 hover:border-yellow-400';
    if (percentage < 100) return 'bg-blue-100 border-blue-300 hover:border-blue-400';
    return 'bg-green-100 border-green-300 hover:border-green-400';
  };

  const handleEdit = (table: TableWithStats) => {
    setSelectedTable(table);
    setIsEditModalOpen(true);
  };

  const handleAssign = (table: TableWithStats) => {
    setSelectedTable(table);
    setIsAssignModalOpen(true);
  };

  const handleDelete = (table: TableWithStats) => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את שולחן ${table.tableNumber}?`)) {
      deleteMutation.mutate({ id: table.id, eventId: eventId! });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">סידורי הושבה</h1>
          <p className="text-gray-500">
            {totalOccupied} מתוך {totalCapacity} מקומות תפוסים
          </p>
        </div>
        <Button 
          variant="primary" 
          icon={<Plus className="h-5 w-5" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          הוסף שולחן
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalTables}</p>
              <p className="text-sm text-gray-500">שולחנות</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-100 rounded-lg">
              <Users className="h-6 w-6 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalOccupied}</p>
              <p className="text-sm text-gray-500">מקומות תפוסים</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${emptySeats > 10 ? 'bg-warning-100' : 'bg-success-100'}`}>
              <AlertCircle className={`h-6 w-6 ${emptySeats > 10 ? 'text-warning-600' : 'text-success-600'}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{emptySeats}</p>
              <p className="text-sm text-gray-500">מקומות פנויים</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Seating Optimization Alert */}
      {emptySeats > 10 && (
        <Card className="bg-warning-50 border-warning-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-warning-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-warning-900 mb-1">
                💡 זוהו {emptySeats} מקומות פנויים
              </h4>
              <p className="text-sm text-warning-700">
                ניתן לחסוך כסף על ידי סגירת שולחן אחד ומיקום מחדש של האורחים.
                ניתן לבצע אופטימיזציה אוטומטית של סידור הישיבה.
              </p>
            </div>
            <Button 
              size="sm" 
              variant="warning"
              onClick={() => setIsOptimizationModalOpen(true)}
            >
              אופטימיזציה אוטומטית
            </Button>
          </div>
        </Card>
      )}

      {/* Tables Grid */}
      <Card title="פריסת שולחנות">
        {tables.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">אין שולחנות עדיין</p>
            <Button 
              variant="primary" 
              icon={<Plus className="h-5 w-5" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              הוסף שולחן ראשון
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`relative p-6 rounded-xl border-2 transition-all ${getTableColor(
                  table.occupiedSeats,
                  table.capacity
                )}`}
              >
                {/* Table Info */}
                <div className="text-center mb-4">
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    שולחן {table.tableNumber}
                  </p>
                  {table.section && (
                    <p className="text-xs text-gray-600 mb-2">{table.section}</p>
                  )}
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {table.occupiedSeats}/{table.capacity}
                    </span>
                  </div>
                </div>

                {/* Guests List */}
                {table.guests.length > 0 && (
                  <div className="mb-4 space-y-1">
                    {table.guests.map((guest) => (
                      <div
                        key={guest.id}
                        className="text-xs text-gray-600 bg-white/50 rounded px-2 py-1"
                      >
                        {guest.name} ({guest.numberOfGuests})
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleAssign(table)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="שייך אורחים"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(table)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="ערוך"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(table)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="מחק"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modals */}
      <CreateTableModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        eventId={eventId}
      />

      {selectedTable && (
        <>
          <EditTableModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedTable(null);
            }}
            table={selectedTable}
          />

          <AssignGuestsModal
            isOpen={isAssignModalOpen}
            onClose={() => {
              setIsAssignModalOpen(false);
              setSelectedTable(null);
            }}
            table={selectedTable}
            eventId={eventId}
          />
        </>
      )}

      {stats && (
        <SeatingOptimizationModal
          isOpen={isOptimizationModalOpen}
          onClose={() => setIsOptimizationModalOpen(false)}
          stats={stats}
        />
      )}
    </div>
  );
};

export default SeatingPage;
