/**
 * Presentation Layer - Guest Invitation Page
 * Beautiful public page for guests to confirm attendance
 */

import { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invitationApi, InvitationDetails } from '../../infrastructure/api/invitationApi';
import { Heart, Calendar, MapPin, Users, CheckCircle, XCircle, HelpCircle, Loader2, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

type AttendanceResponse = 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE';

const GuestInvitationPage: FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [details, setDetails] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<AttendanceResponse | null>(null);
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [notes, setNotes] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  useEffect(() => {
    if (token) {
      loadInvitation();
    }
  }, [token]);

  const loadInvitation = async () => {
    try {
      setIsLoading(true);
      const data = await invitationApi.getInvitationDetails(token!);
      setDetails(data);
      setNumberOfGuests(data.guest.numberOfGuests);
    } catch (error: any) {
      toast.error('הקישור שגוי או פג תוקפו');
      console.error('Error loading invitation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedResponse) {
      toast.error('נא לבחור תגובה');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await invitationApi.confirmAttendance(token!, {
        response: selectedResponse,
        numberOfGuests: selectedResponse === 'ATTENDING' ? numberOfGuests : undefined,
        notes: notes.trim() || undefined,
      });

      setConfirmationMessage(result.message);
      setIsConfirmed(true);
      toast.success(result.message);
    } catch (error: any) {
      toast.error('שגיאה באישור ההגעה');
      console.error('Error confirming attendance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-xl">טוען הזמנה...</p>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-2xl">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">הקישור שגוי</h2>
          <p className="text-gray-600">לא הצלחנו למצוא את ההזמנה</p>
        </div>
      </div>
    );
  }

  const eventDate = new Date(details.event.eventDate);
  const formattedDate = eventDate.toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center animate-fadeIn">
          <div className="mb-8">
            <Sparkles className="h-20 w-20 text-yellow-500 mx-auto animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {selectedResponse === 'ATTENDING' ? '🎉 תודה על האישור!' : 
             selectedResponse === 'NOT_ATTENDING' ? '💐 תודה על העדכון' :
             '💫 תודה!'}
          </h1>
          <p className="text-xl text-gray-700 mb-8">{confirmationMessage}</p>
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-2xl">
            <p className="text-gray-700">
              {selectedResponse === 'ATTENDING' ? 
                `מצפים לראותכם ב${details.event.name}! ✨` :
                `נצטער שלא תוכלו להגיע 💙`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
          <div className="relative z-10">
            <Heart className="h-16 w-16 mx-auto mb-4 animate-bounce" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">אתם מוזמנים!</h1>
            <p className="text-2xl md:text-3xl font-light">{details.event.name}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-12">
          {/* Guest Name */}
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2">לכבוד</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {details.guest.fullName}
            </h2>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="flex items-start gap-4 bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-2xl md:col-span-2">
              <Calendar className="h-8 w-8 text-pink-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600 mb-1">תאריך</p>
                <p className="text-lg font-semibold text-gray-900">{formattedDate}</p>
              </div>
            </div>

            {details.event.venue && (
              <div className="flex items-start gap-4 bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-2xl md:col-span-2">
                <MapPin className="h-8 w-8 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">מקום</p>
                  <p className="text-lg font-semibold text-gray-900">{details.event.venue}</p>
                  {details.event.address && (
                    <p className="text-gray-600 mt-1">{details.event.address}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RSVP Form */}
          {!details.hasResponded ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Response Selection */}
              <div>
                <p className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  נשמח לדעת אם תגיעו 💕
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedResponse('ATTENDING')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      selectedResponse === 'ATTENDING'
                        ? 'border-green-500 bg-green-50 scale-105 shadow-lg'
                        : 'border-gray-200 hover:border-green-300 hover:scale-102'
                    }`}
                  >
                    <CheckCircle className={`h-12 w-12 mx-auto mb-3 ${
                      selectedResponse === 'ATTENDING' ? 'text-green-500' : 'text-gray-400'
                    }`} />
                    <p className="font-bold text-lg">מגיע</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedResponse('NOT_ATTENDING')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      selectedResponse === 'NOT_ATTENDING'
                        ? 'border-red-500 bg-red-50 scale-105 shadow-lg'
                        : 'border-gray-200 hover:border-red-300 hover:scale-102'
                    }`}
                  >
                    <XCircle className={`h-12 w-12 mx-auto mb-3 ${
                      selectedResponse === 'NOT_ATTENDING' ? 'text-red-500' : 'text-gray-400'
                    }`} />
                    <p className="font-bold text-lg">לא מגיע</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedResponse('MAYBE')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      selectedResponse === 'MAYBE'
                        ? 'border-yellow-500 bg-yellow-50 scale-105 shadow-lg'
                        : 'border-gray-200 hover:border-yellow-300 hover:scale-102'
                    }`}
                  >
                    <HelpCircle className={`h-12 w-12 mx-auto mb-3 ${
                      selectedResponse === 'MAYBE' ? 'text-yellow-500' : 'text-gray-400'
                    }`} />
                    <p className="font-bold text-lg">מתלבט</p>
                  </button>
                </div>
              </div>

              {/* Number of Guests */}
              {selectedResponse === 'ATTENDING' && (
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-2xl animate-fadeIn">
                  <label className="block text-center mb-4">
                    <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <span className="text-lg font-semibold text-gray-900">
                      כמה מתכננים להגיע?
                    </span>
                  </label>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setNumberOfGuests(Math.max(1, numberOfGuests - 1))}
                      className="w-12 h-12 rounded-full bg-white border-2 border-green-500 text-green-500 font-bold text-xl hover:bg-green-50 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-4xl font-bold text-green-600 w-16 text-center">
                      {numberOfGuests}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNumberOfGuests(numberOfGuests + 1)}
                      className="w-12 h-12 rounded-full bg-white border-2 border-green-500 text-green-500 font-bold text-xl hover:bg-green-50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3 text-center">
                  רוצים להוסיף משהו? (אופציונלי)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="הערות, שאלות, מגבלות תזונתיות..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedResponse || isSubmitting}
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white py-4 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    שולח...
                  </>
                ) : (
                  <>
                    <Send className="h-6 w-6" />
                    שלח אישור
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl">
              <CheckCircle className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-900 mb-2">
                כבר אישרת הגעה
              </p>
              <p className="text-gray-600">
                תודה על המשוב! אם תרצו לעדכן את התשובה, צרו קשר עם בעלי השמחה
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 text-center text-gray-600">
          <p className="text-sm">מערכת אישור הגעה דיגיטלית ⚡</p>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default GuestInvitationPage;

