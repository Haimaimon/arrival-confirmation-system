/**
 * Presentation Layer - Table Controller
 * Handles HTTP requests for table management
 */

import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { CreateTableUseCase } from '../../application/use-cases/table/CreateTableUseCase';
import { UpdateTableUseCase } from '../../application/use-cases/table/UpdateTableUseCase';
import { DeleteTableUseCase } from '../../application/use-cases/table/DeleteTableUseCase';
import { GetTableStatsUseCase } from '../../application/use-cases/table/GetTableStatsUseCase';
import { AssignGuestToTableUseCase } from '../../application/use-cases/table/AssignGuestToTableUseCase';
import { ITableRepository } from '../../domain/repositories/ITableRepository';
import { IGuestRepository } from '../../domain/repositories/IGuestRepository';
import { IEventRepository } from '../../domain/repositories/IEventRepository';
import { ICacheService } from '../../domain/services/ICacheService';

export class TableController {
  constructor(
    private tableRepository: ITableRepository,
    private guestRepository: IGuestRepository,
    private eventRepository: IEventRepository,
    private cacheService: ICacheService
  ) {}

  /**
   * Create a new table
   * POST /api/v1/tables
   */
  createTable = async (req: AuthRequest, res: Response) => {
    try {
      console.log('📋 Backend: Creating table:', req.body);

      const useCase = new CreateTableUseCase(
        this.tableRepository,
        this.eventRepository
      );
      const table = await useCase.execute(req.body);

      // Invalidate cache
      await this.invalidateCache(table.eventId);

      console.log('✅ Backend: Table created:', table.toObject());
      return res.status(201).json({
        success: true,
        data: table.toObject(),
      });
    } catch (error: any) {
      console.error('❌ Backend: Error creating table:', error.message);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Get table statistics for an event
   * GET /api/v1/tables/event/:eventId/stats
   */
  getTableStats = async (req: AuthRequest, res: Response) => {
    try {
      const { eventId } = req.params;
      console.log('📊 Backend: Fetching table stats for event:', eventId);

      // Try cache first
      const cacheKey = `tables:stats:${eventId}`;
      const cached = await this.cacheService.get<any>(cacheKey);

      if (cached) {
        console.log('📦 Backend: Returning cached table stats');
        return res.json({
          success: true,
          data: cached,
          cached: true,
        });
      }

      // Fetch from database
      const useCase = new GetTableStatsUseCase(
        this.tableRepository,
        this.guestRepository,
        this.eventRepository
      );
      const stats = await useCase.execute(eventId);

      // Cache for 5 minutes
      await this.cacheService.set(cacheKey, stats, 300);

      console.log('✅ Backend: Table stats fetched:', {
        totalTables: stats.totalTables,
        totalOccupied: stats.totalOccupied,
      });

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('❌ Backend: Error fetching table stats:', error.message);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Get all tables for an event
   * GET /api/v1/tables/event/:eventId
   */
  getTables = async (req: AuthRequest, res: Response) => {
    try {
      const { eventId } = req.params;
      console.log('📋 Backend: Fetching tables for event:', eventId);

      const tables = await this.tableRepository.findByEventId(eventId);

      console.log('✅ Backend: Tables fetched:', tables.length);
      return res.json({
        success: true,
        data: tables.map(t => t.toObject()),
      });
    } catch (error: any) {
      console.error('❌ Backend: Error fetching tables:', error.message);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Update a table
   * PUT /api/v1/tables/:id
   */
  updateTable = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      console.log('📋 Backend: Updating table:', id, req.body);

      const table = await this.tableRepository.findById(id);
      if (!table) {
        return res.status(404).json({
          success: false,
          error: 'Table not found',
        });
      }

      const useCase = new UpdateTableUseCase(this.tableRepository);
      const updatedTable = await useCase.execute({
        tableId: id,
        ...req.body,
      });

      // Invalidate cache
      await this.invalidateCache(updatedTable.eventId);

      console.log('✅ Backend: Table updated:', updatedTable.toObject());
      return res.json({
        success: true,
        data: updatedTable.toObject(),
      });
    } catch (error: any) {
      console.error('❌ Backend: Error updating table:', error.message);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Delete a table
   * DELETE /api/v1/tables/:id
   */
  deleteTable = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      console.log('📋 Backend: Deleting table:', id);

      const table = await this.tableRepository.findById(id);
      if (!table) {
        return res.status(404).json({
          success: false,
          error: 'Table not found',
        });
      }

      const eventId = table.eventId;

      const useCase = new DeleteTableUseCase(this.tableRepository);
      await useCase.execute(id);

      // Invalidate cache
      await this.invalidateCache(eventId);

      console.log('✅ Backend: Table deleted');
      return res.json({
        success: true,
        message: 'Table deleted successfully',
      });
    } catch (error: any) {
      console.error('❌ Backend: Error deleting table:', error.message);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Assign guest to table
   * POST /api/v1/tables/assign
   */
  assignGuestToTable = async (req: AuthRequest, res: Response) => {
    try {
      console.log('📋 Backend: Assigning guest to table:', req.body);

      const useCase = new AssignGuestToTableUseCase(
        this.guestRepository,
        this.tableRepository
      );
      const guest = await useCase.execute(req.body);

      // Invalidate cache
      await this.invalidateCache(guest.eventId);

      console.log('✅ Backend: Guest assigned to table');
      return res.json({
        success: true,
        data: guest.toObject(),
      });
    } catch (error: any) {
      console.error('❌ Backend: Error assigning guest:', error.message);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Helper method to invalidate cache
   */
  private async invalidateCache(eventId: string): Promise<void> {
    console.log('🗑️ Backend: Clearing table cache for event:', eventId);
    await this.cacheService.deletePattern(`tables:*:${eventId}*`);
    await this.cacheService.delete(`tables:stats:${eventId}`);
    // Also invalidate guest cache as table assignments changed
    await this.cacheService.deletePattern(`guests:${eventId}:*`);
  }
}

