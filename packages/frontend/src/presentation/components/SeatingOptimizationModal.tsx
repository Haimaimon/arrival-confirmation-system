/**
 * Presentation Layer - Seating Optimization Modal
 * Shows recommendations for optimizing table arrangements to save money
 */

import { FC, useMemo } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Sparkles, TrendingDown, Users, DollarSign, AlertCircle } from 'lucide-react';
import { SeatingStats, TableWithStats } from '../../domain/entities/Table';

interface SeatingOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: SeatingStats;
}

interface OptimizationSuggestion {
  type: 'remove_table' | 'redistribute' | 'consolidate';
  title: string;
  description: string;
  savingsEstimate: number;
  impact: string;
  tablesToRemove?: number[];
  tablesToAdjust?: Array<{ tableNumber: number; currentSeats: number; suggestedCapacity: number }>;
}

export const SeatingOptimizationModal: FC<SeatingOptimizationModalProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  // Calculate optimization suggestions
  const suggestions = useMemo((): OptimizationSuggestion[] => {
    const { tables, emptySeats, totalOccupied } = stats;
    const suggestions: OptimizationSuggestion[] = [];

    // Sort tables by occupancy rate
    const sortedTables = [...tables].sort((a, b) => 
      (a.occupiedSeats / a.capacity) - (b.occupiedSeats / b.capacity)
    );

    // Find nearly empty tables
    const nearlyEmptyTables = sortedTables.filter(
      t => t.occupiedSeats > 0 && t.occupiedSeats <= 3
    );

    // Suggestion 1: Remove empty or nearly empty tables
    if (emptySeats >= 10) {
      const emptyTables = tables.filter(t => t.occupiedSeats === 0);
      const possibleRemoval = nearlyEmptyTables.length > 0 ? nearlyEmptyTables.length : emptyTables.length;

      if (possibleRemoval > 0) {
        suggestions.push({
          type: 'remove_table',
          title: `הסרת ${possibleRemoval} ${possibleRemoval === 1 ? 'שולחן' : 'שולחנות'}`,
          description: nearlyEmptyTables.length > 0
            ? `ניתן להעביר ${nearlyEmptyTables.reduce((sum, t) => sum + t.occupiedSeats, 0)} אורחים לשולחנות אחרים ולחסוך בעלויות.`
            : `יש ${emptyTables.length} שולחנות ריקים שניתן להסיר.`,
          savingsEstimate: possibleRemoval * 200, // ₪200 per table estimate
          impact: `חיסכון של כ-₪${(possibleRemoval * 200).toLocaleString()}`,
          tablesToRemove: (nearlyEmptyTables.length > 0 ? nearlyEmptyTables : emptyTables)
            .map(t => t.tableNumber),
        });
      }
    }

    // Suggestion 2: Consolidate partially filled tables
    const partiallyFilled = tables.filter(
      t => t.occupiedSeats > 0 && t.occupiedSeats < t.capacity * 0.5
    );

    if (partiallyFilled.length >= 2) {
      const totalOccupiedInPartial = partiallyFilled.reduce((sum, t) => sum + t.occupiedSeats, 0);
      const tablesNeeded = Math.ceil(totalOccupiedInPartial / 10); // Assuming 10 per table
      const tablesCanRemove = partiallyFilled.length - tablesNeeded;

      if (tablesCanRemove > 0) {
        suggestions.push({
          type: 'consolidate',
          title: 'איחוד שולחנות מלאים חלקית',
          description: `ניתן לאחד ${partiallyFilled.length} שולחנות ל-${tablesNeeded} שולחנות מלאים יותר.`,
          savingsEstimate: tablesCanRemove * 200,
          impact: `חיסכון של כ-₪${(tablesCanRemove * 200).toLocaleString()}`,
          tablesToAdjust: partiallyFilled.map(t => ({
            tableNumber: t.tableNumber,
            currentSeats: t.occupiedSeats,
            suggestedCapacity: 10,
          })),
        });
      }
    }

    // Suggestion 3: Reduce table sizes for better space utilization
    const oversizedTables = tables.filter(
      t => t.occupiedSeats > 0 && t.capacity - t.occupiedSeats >= 5
    );

    if (oversizedTables.length > 0) {
      suggestions.push({
        type: 'redistribute',
        title: 'התאמת גודל שולחנות',
        description: `${oversizedTables.length} שולחנות גדולים מדי. ניתן להקטין ולהוסיף שולחנות קטנים יותר.`,
        savingsEstimate: oversizedTables.length * 100,
        impact: `חיסכון של כ-₪${(oversizedTables.length * 100).toLocaleString()} + מקום נוסף באולם`,
        tablesToAdjust: oversizedTables.map(t => ({
          tableNumber: t.tableNumber,
          currentSeats: t.capacity,
          suggestedCapacity: t.occupiedSeats + 2, // Leave 2 extra seats
        })),
      });
    }

    return suggestions;
  }, [stats]);

  const totalSavings = suggestions.reduce((sum, s) => sum + s.savingsEstimate, 0);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="✨ אופטימיזציה חכמה של סידור הושבה"
      size="large"
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                המלצות לחיסכון בעלויות
              </h3>
              <p className="text-sm text-purple-700 mb-3">
                בהתבסס על סידור הישיבה הנוכחי, מצאנו {suggestions.length} הזדמנויות לאופטימיזציה.
              </p>
              {totalSavings > 0 && (
                <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-lg inline-flex">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-900">
                    חיסכון פוטנציאלי: ₪{totalSavings.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">סה״כ שולחנות</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTables}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 mb-1">מקומות תפוסים</p>
            <p className="text-2xl font-bold text-blue-900">{stats.totalOccupied}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600 mb-1">מקומות פנויים</p>
            <p className="text-2xl font-bold text-yellow-900">{stats.emptySeats}</p>
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length === 0 ? (
          <div className="text-center py-12 bg-green-50 rounded-lg border border-green-200">
            <AlertCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-green-900 mb-2">
              🎉 מצוין! סידור הישיבה אופטימלי
            </h4>
            <p className="text-green-700">
              אין המלצות נוספות לשיפור. השולחנות מוקצים בצורה יעילה.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">המלצות מפורטות:</h4>
            
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg flex-shrink-0 ${
                    suggestion.type === 'remove_table'
                      ? 'bg-red-100'
                      : suggestion.type === 'consolidate'
                      ? 'bg-yellow-100'
                      : 'bg-blue-100'
                  }`}>
                    {suggestion.type === 'remove_table' ? (
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    ) : suggestion.type === 'consolidate' ? (
                      <Users className="h-6 w-6 text-yellow-600" />
                    ) : (
                      <Users className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">
                      {suggestion.title}
                    </h5>
                    <p className="text-sm text-gray-600 mb-3">
                      {suggestion.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium text-green-600">
                        {suggestion.impact}
                      </span>
                      
                      {suggestion.tablesToRemove && suggestion.tablesToRemove.length > 0 && (
                        <span className="text-gray-600">
                          שולחנות להסרה: {suggestion.tablesToRemove.join(', ')}
                        </span>
                      )}
                    </div>

                    {suggestion.tablesToAdjust && suggestion.tablesToAdjust.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 mb-2">התאמות מוצעות:</p>
                        <div className="space-y-1 text-xs text-gray-600">
                          {suggestion.tablesToAdjust.slice(0, 3).map((adj, i) => (
                            <div key={i}>
                              שולחן {adj.tableNumber}: {adj.currentSeats} → {adj.suggestedCapacity} מקומות
                            </div>
                          ))}
                          {suggestion.tablesToAdjust.length > 3 && (
                            <div className="text-gray-500">
                              ועוד {suggestion.tablesToAdjust.length - 3} שולחנות...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">💡 שים לב:</p>
              <ul className="list-disc mr-5 space-y-1">
                <li>ההמלצות מבוססות על ניתוח אוטומטי ויש לאמת אותן עם ספק האולם</li>
                <li>העלויות הן הערכה בלבד ויכולות להשתנות</li>
                <li>יש להתחשב בדרישות מיוחדות של אורחים בעת סידור מחדש</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            סגור
          </Button>
          {suggestions.length > 0 && (
            <Button variant="primary">
              יישם אוטומטית (בקרוב)
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

