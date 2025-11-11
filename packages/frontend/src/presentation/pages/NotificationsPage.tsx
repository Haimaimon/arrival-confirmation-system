/**
 * Presentation Layer - Notifications Page
 */

import { FC } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Table } from '../components/Table';
import { MessageSquare, Phone, Mail, Send } from 'lucide-react';

const NotificationsPage: FC = () => {
  const pageTitle = 'התראות והודעות';

  // TODO: Fetch real notifications data
  const notifications = [
    {
      id: '1',
      guest: 'דוד כהן',
      type: 'SMS',
      status: 'SENT',
      message: 'שלום דוד, מזמינים אותך...',
      sentAt: '2025-01-10 10:30',
    },
    {
      id: '2',
      guest: 'רחל לוי',
      type: 'WHATSAPP',
      status: 'DELIVERED',
      message: 'היי רחל, נשמח לראות אותך...',
      sentAt: '2025-01-10 11:00',
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SMS':
        return <MessageSquare className="h-4 w-4" />;
      case 'WHATSAPP':
        return <MessageSquare className="h-4 w-4" />;
      case 'PHONE_CALL':
        return <Phone className="h-4 w-4" />;
      case 'EMAIL':
        return <Mail className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'text-success-600 bg-success-50';
      case 'DELIVERED':
        return 'text-primary-600 bg-primary-50';
      case 'FAILED':
        return 'text-danger-600 bg-danger-50';
      case 'PENDING':
        return 'text-warning-600 bg-warning-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const columns = [
    {
      key: 'guest',
      header: 'אורח',
      render: (notification: any) => (
        <span className="font-medium text-gray-900">{notification.guest}</span>
      ),
    },
    {
      key: 'type',
      header: 'סוג',
      render: (notification: any) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(notification.type)}
          <span className="text-sm text-gray-600">{notification.type}</span>
        </div>
      ),
    },
    {
      key: 'message',
      header: 'הודעה',
      render: (notification: any) => (
        <span className="text-sm text-gray-600 line-clamp-1">
          {notification.message}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'סטטוס',
      render: (notification: any) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
            notification.status
          )}`}
        >
          {notification.status}
        </span>
      ),
    },
    {
      key: 'sentAt',
      header: 'נשלח ב',
      render: (notification: any) => (
        <span className="text-sm text-gray-600">{notification.sentAt}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
          <p className="text-gray-500">{notifications.length} הודעות נשלחו</p>
        </div>
        <Button variant="primary" icon={<Send className="h-5 w-5" />}>
          שלח הודעות
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-sm text-gray-500">הודעות SMS</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-success-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-500">WhatsApp</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <Phone className="h-8 w-8 text-warning-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">4</p>
              <p className="text-sm text-gray-500">שיחות טלפון</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <Mail className="h-8 w-8 text-gray-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">1</p>
              <p className="text-sm text-gray-500">אימיילים</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Notifications Table */}
      <Card title="היסטוריית הודעות">
        <Table
          columns={columns}
          data={notifications}
          keyExtractor={(n) => n.id}
          emptyMessage="אין הודעות עדיין"
        />
      </Card>
    </div>
  );
};

export default NotificationsPage;

