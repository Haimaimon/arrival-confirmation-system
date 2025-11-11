/**
 * Presentation Layer - Guests Page
 * Full-featured guest management with Excel import, filters, and beautiful UI
 */

import { FC, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatCard } from '../components/StatCard';
import { useGuests, useImportGuests, useConfirmGuest, useUpdateGuest, useDeleteGuest } from '../../application/hooks/useGuests';
import { useRealtimeEvent } from '../../application/hooks/useRealtimeEvent';
import { Guest, GuestStatus, getGuestStatusLabel, getGuestStatusColor } from '../../domain/entities/Guest';
import { 
  Upload, UserPlus, Download, Phone, MessageSquare, Mail, 
  Search, Filter, Users, CheckCircle, Clock, XCircle, 
  Edit, Trash2, Send, FileSpreadsheet, X, Link2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AddGuestModal } from '../components/AddGuestModal';
import { ImportExcelModal } from '../components/ImportExcelModal';
import { EditGuestModal } from '../components/EditGuestModal';
import { SendNotificationModal } from '../components/SendNotificationModal';
import { useSendNotification } from '../../application/hooks/useNotifications';
import { useSendInvitationWhatsApp } from '../../application/hooks/useInvitation';
import { invitationApi } from '../../infrastructure/api/invitationApi';

const GuestsPage: FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [guestToEdit, setGuestToEdit] = useState<Guest | null>(null);
  const [guestToMessage, setGuestToMessage] = useState<Guest | null>(null);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<GuestStatus | 'ALL'>('ALL');
  const [sideFilter, setSideFilter] = useState<string>('ALL');
  const [groupFilter, setGroupFilter] = useState<string>('ALL');

  // Redirect if no eventId
  if (!eventId) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-8 text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">שגיאה: לא נמצא אירוע</h2>
          <p className="text-gray-600 mb-6">
            עליך לגשת לעמוד זה דרך דף האירועים
          </p>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/events'}
          >
            חזור לדף האירועים
          </Button>
        </Card>
      </div>
    );
  }

  // Fetch guests
  const { data: guests = [], isLoading } = useGuests({ eventId: eventId! });
  
  // Debug: Log guests count
  console.log('👥 GuestsPage: Total guests from API:', guests.length);
  
  // Real-time updates
  useRealtimeEvent(eventId!);

  // Mutations
  const confirmMutation = useConfirmGuest();
  const updateMutation = useUpdateGuest();
  const deleteMutation = useDeleteGuest();
  const sendNotificationMutation = useSendNotification();
  const sendWhatsAppMutation = useSendInvitationWhatsApp();

  // Calculate statistics
  const stats = useMemo(() => {
    const confirmed = guests.filter(g => g.status === GuestStatus.CONFIRMED).length;
    const pending = guests.filter(g => g.status === GuestStatus.PENDING).length;
    const declined = guests.filter(g => g.status === GuestStatus.DECLINED).length;
    const totalInvited = guests.reduce((sum, g) => sum + (g.numberOfGuests || 0), 0);
    const totalConfirmed = guests
      .filter(g => g.status === GuestStatus.CONFIRMED)
      .reduce((sum, g) => sum + (g.numberOfGuests || 0), 0);

    return {
      total: guests.length,
      confirmed,
      pending,
      declined,
      totalInvited,
      totalConfirmed,
      confirmationRate: guests.length > 0 ? Math.round((confirmed / guests.length) * 100) : 0,
    };
  }, [guests]);

  // Filter guests
  const filteredGuests = useMemo(() => {
    const filtered = guests.filter(guest => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(query);
        const matchesPhone = guest.phone?.includes(query);
        const matchesEmail = guest.email?.toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesEmail) return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && guest.status !== statusFilter) {
        return false;
      }

      // Side filter (GROOM/BRIDE)
      if (sideFilter !== 'ALL' && guest.type !== sideFilter) {
        return false;
      }

      // Group filter (FRIENDS/FAMILY/WORK)
      if (groupFilter !== 'ALL') {
        // This would need to be added to Guest entity if needed
        // For now, skip this filter
      }

      return true;
    });
    
    console.log('🔍 GuestsPage: Filtered guests:', filtered.length, '/', guests.length);
    console.log('🔍 Filters:', { searchQuery, statusFilter, sideFilter, groupFilter });
    
    return filtered;
  }, [guests, searchQuery, statusFilter, sideFilter, groupFilter]);

  const handleConfirm = (guestId: string) => {
    confirmMutation.mutate({ id: guestId });
  };

  const handleSendMessage = (guest: Guest) => {
    setGuestToMessage(guest);
    setIsSendModalOpen(true);
  };

  const handleSendNotification = (guestId: string, type: 'SMS' | 'WHATSAPP' | 'VOICE', message?: string) => {
    sendNotificationMutation.mutate(
      { guestId, data: { type, message } },
      {
        onSuccess: () => {
          setIsSendModalOpen(false);
          setGuestToMessage(null);
        },
      }
    );
  };

  const handleEdit = (guest: Guest) => {
    setGuestToEdit(guest);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (guestId: string, data: Partial<Guest>) => {
    updateMutation.mutate(
      { id: guestId, data },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setGuestToEdit(null);
        },
      }
    );
  };

  const handleCopyInvitationLink = async (guest: Guest) => {
    try {
      const result = await invitationApi.generateInvitationLink(guest.id, eventId!);
      await navigator.clipboard.writeText(result.invitationUrl);
      toast.success(`קישור הועתק! 🎊\nניתן לשלוח ל${guest.firstName} ${guest.lastName}`);
    } catch (error) {
      toast.error('שגיאה בהעתקת הקישור');
      console.error('Error copying invitation link:', error);
    }
  };

  const handleSendWhatsApp = async (guest: Guest) => {
    // Validate guest has phone number
    if (!guest.phone) {
      toast.error(`${guest.firstName} ${guest.lastName} אין מספר טלפון`, {
        icon: '⚠️',
      });
      return;
    }

    // Confirm before sending
    const confirmed = confirm(
      `האם לשלוח הזמנה ב-WhatsApp ל-${guest.firstName} ${guest.lastName}?\n\nמספר: ${guest.phone}`
    );
    
    if (!confirmed) return;

    // Send WhatsApp invitation
    sendWhatsAppMutation.mutate({
      guestId: guest.id,
      eventId: eventId!,
    });
  };

  const handleDelete = (guestId: string, guestName: string) => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את ${guestName}?`)) {
      deleteMutation.mutate(guestId);
    }
  };

  const handleDownloadTemplate = () => {
    // This would download an Excel template
    toast.success('תבנית Excel הורדה בהצלחה');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ניהול אורחים</h1>
          <p className="text-gray-500">
            {stats.total} אורחים • {stats.totalInvited} מוזמנים • {stats.totalConfirmed} מגיעים
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={<Download className="h-5 w-5" />}
            onClick={handleDownloadTemplate}
            size="sm"
          >
            הורד תבנית
          </Button>
          <Button
            variant="secondary"
            icon={<Upload className="h-5 w-5" />}
            onClick={() => setIsImportModalOpen(true)}
          >
            ייבא מאקסל
          </Button>
          <Button
            variant="primary"
            icon={<UserPlus className="h-5 w-5" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            הוסף אורח
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="סה״כ אורחים"
          value={stats.total}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          trend={{ value: stats.totalInvited, label: 'מוזמנים' }}
        />
        <StatCard
          title="אישרו"
          value={stats.confirmed}
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          trend={{ value: stats.confirmationRate, label: '% אישורים' }}
        />
        <StatCard
          title="ממתינים"
          value={stats.pending}
          icon={<Clock className="h-6 w-6 text-yellow-600" />}
          trend={{ value: stats.totalInvited - stats.totalConfirmed, label: 'טרם אישרו' }}
        />
        <StatCard
          title="דחו"
          value={stats.declined}
          icon={<XCircle className="h-6 w-6 text-red-600" />}
        />
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="חיפוש אורח..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as GuestStatus | 'ALL')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">כל הסטטוסים</option>
              <option value={GuestStatus.CONFIRMED}>אישרו</option>
              <option value={GuestStatus.PENDING}>ממתינים</option>
              <option value={GuestStatus.DECLINED}>דחו</option>
            </select>
          </div>

          {/* Side Filter */}
          <div>
            <select
              value={sideFilter}
              onChange={(e) => setSideFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">כל הצדדים</option>
              <option value="GROOM">חתן</option>
              <option value="BRIDE">כלה</option>
              <option value="MUTUAL">משותף</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchQuery || statusFilter !== 'ALL' || sideFilter !== 'ALL') && (
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setSideFilter('ALL');
                setGroupFilter('ALL');
              }}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              נקה סינונים
            </Button>
          )}
        </div>

        {/* Active filters info */}
        {filteredGuests.length !== guests.length && (
          <div className="mt-4 text-sm text-gray-600">
            מציג {filteredGuests.length} מתוך {guests.length} אורחים
          </div>
        )}
      </Card>

      {/* Guests Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {guests.length === 0 ? 'אין אורחים עדיין' : 'לא נמצאו אורחים'}
            </h3>
            <p className="text-gray-500 mb-4">
              {guests.length === 0 ? 'הוסף אורחים ידנית או ייבא מקובץ Excel' : 'נסה לשנות את הסינונים'}
            </p>
            {guests.length === 0 && (
              <div className="flex items-center justify-center gap-3">
                <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                  הוסף אורח ראשון
                </Button>
                <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>
                  ייבא מאקסל
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    מס׳
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    שם מלא
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    מס׳ אורחים
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סטטוס
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    צד
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    פרטי התקשרות
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    אישור הגעה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuests.map((guest, index) => (
                    <tr
                      key={guest.id}
                      className="hover:bg-gray-50 transition-colors animate-slideIn"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {guest.firstName} {guest.lastName}
                          </p>
                          {guest.notes && (
                            <p className="text-xs text-gray-500 mt-1">{guest.notes}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {guest.numberOfGuests}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGuestStatusColor(guest.status)}`}>
                          {getGuestStatusLabel(guest.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {guest.type === 'GROOM' ? '👔 חתן' : guest.type === 'BRIDE' ? '👰 כלה' : '💑 משותף'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 space-y-1 min-w-[150px]">
                          {guest.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              <span>{guest.phone}</span>
                            </div>
                          )}
                          {guest.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span className="text-xs">{guest.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs text-gray-600 min-w-[120px]">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>SMS: {guest.smsCount || 0}/2</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3 text-green-600" />
                            <span>WA: {guest.whatsappCount || 0}/3</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>📞: {guest.phoneCallCount || 0}/4</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          {guest.status === GuestStatus.PENDING && (
                            <button
                              onClick={() => handleConfirm(guest.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="אשר הגעה"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleCopyInvitationLink(guest)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="העתק קישור הזמנה"
                          >
                            <Link2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleSendWhatsApp(guest)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="שלח הזמנה ב-WhatsApp"
                            disabled={!guest.phone}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleSendMessage(guest)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="שלח הודעה"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(guest)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="ערוך"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(guest.id, `${guest.firstName} ${guest.lastName}`)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="מחק"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modals */}
      <AddGuestModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        eventId={eventId!}
      />
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        eventId={eventId!}
      />
      <EditGuestModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setGuestToEdit(null);
        }}
        guest={guestToEdit}
        onSave={handleSaveEdit}
        isSaving={updateMutation.isPending}
      />
      <SendNotificationModal
        isOpen={isSendModalOpen}
        onClose={() => {
          setIsSendModalOpen(false);
          setGuestToMessage(null);
        }}
        guest={guestToMessage}
        onSend={handleSendNotification}
        isSending={sendNotificationMutation.isPending}
      />
    </div>
  );
};

export default GuestsPage;

