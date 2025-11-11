/**
 * Presentation Layer - Guest Controller
 */

import { Response } from 'express';
import { CreateGuestUseCase } from '../../application/use-cases/guest/CreateGuestUseCase';
import { UpdateGuestUseCase } from '../../application/use-cases/UpdateGuestUseCase';
import { ConfirmGuestUseCase } from '../../application/use-cases/guest/ConfirmGuestUseCase';
import { ImportGuestsFromExcelUseCase } from '../../application/use-cases/guest/ImportGuestsFromExcelUseCase';
import { IGuestRepository } from '../../domain/repositories/IGuestRepository';
import { IEventRepository } from '../../domain/repositories/IEventRepository';
import { ICacheService } from '../../domain/services/ICacheService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { generateGuestImportTemplate } from '../../infrastructure/utils/excelTemplate';

export class GuestController {
  constructor(
    private guestRepository: IGuestRepository,
    private eventRepository: IEventRepository,
    private cacheService: ICacheService
  ) {}

  // Clear all guest cache for debugging
  clearCache = async (req: AuthRequest, res: Response) => {
    try {
      const { eventId } = req.params;
      console.log('🗑️ Clearing all cache for event:', eventId);
      
      // Clear common cache patterns
      await this.cacheService.delete(`guests:${eventId}:all:`);
      await this.cacheService.delete(`guests:${eventId}:undefined:`);
      await this.cacheService.deletePattern(`guests:${eventId}:*`);
      
      return res.json({
        success: true,
        message: 'Cache cleared successfully',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  createGuest = async (req: AuthRequest, res: Response) => {
    try {
      console.log('🎯 Backend: Creating guest with data:', req.body);
      const useCase = new CreateGuestUseCase(this.guestRepository, this.eventRepository);
      const guest = await useCase.execute(req.body);

      // Invalidate cache for this event
      const eventId = req.body.eventId;
      const cachePattern = `guests:${eventId}:*`;
      console.log('🗑️ Backend: Invalidating cache for pattern:', cachePattern);
      // Note: Redis wildcard delete would be better, but for now we'll clear common keys
      await this.cacheService.delete(`guests:${eventId}:all:`);
      await this.cacheService.delete(`guests:${eventId}:undefined:`);

      console.log('✅ Backend: Guest created successfully:', guest.toObject());
      res.status(201).json({
        success: true,
        data: guest.toObject(),
      });
    } catch (error: any) {
      console.error('❌ Backend: Error creating guest:', error.message);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  getGuests = async (req: AuthRequest, res: Response) => {
    try {
      const { eventId } = req.params;
      const { status, search } = req.query;

      console.log('🎯 Backend: Fetching guests for eventId:', eventId, 'status:', status, 'search:', search);

      // Try cache first
      const cacheKey = `guests:${eventId}:${status || 'all'}:${search || ''}`;
      const cached = await this.cacheService.get<any[]>(cacheKey);

      if (cached && Array.isArray(cached)) {
        console.log('📦 Backend: Returning cached guests:', cached.length);
        return res.json({
          success: true,
          data: cached,
          cached: true,
        });
      }

      // Fetch from repository
      const guests = await this.guestRepository.findByFilters({
        eventId,
        status: status as any,
        search: search as string,
      });

      console.log('✅ Backend: Found guests:', guests.length);

      // Convert to plain objects
      const guestsData = guests.map((g) => g.toObject());

      // Cache for 5 minutes (store plain objects, not entities!)
      await this.cacheService.set(cacheKey, guestsData, 300);

      return res.json({
        success: true,
        data: guestsData,
      });
    } catch (error: any) {
      console.error('❌ Backend: Error fetching guests:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  getGuestById = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const guest = await this.guestRepository.findById(id);

      if (!guest) {
        return res.status(404).json({
          success: false,
          error: 'Guest not found',
        });
      }

      return res.json({
        success: true,
        data: guest.toObject(),
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  confirmGuest = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const useCase = new ConfirmGuestUseCase(
        this.guestRepository,
        this.eventRepository,
        this.cacheService
      );

      const guest = await useCase.execute({
        guestId: id,
        numberOfGuests: req.body.numberOfGuests,
      });

      res.json({
        success: true,
        data: guest.toObject(),
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  updateGuest = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      console.log('🎯 Backend: Updating guest:', id, 'with data:', req.body);

      const useCase = new UpdateGuestUseCase(this.guestRepository, this.eventRepository);
      const updatedGuest = await useCase.execute({
        guestId: id,
        ...req.body,
      });

      // Invalidate cache for this event
      const eventId = updatedGuest.eventId;
      console.log('🗑️ Backend: Clearing cache after guest update for event:', eventId);
      await this.cacheService.delete(`guests:${eventId}:all:`);
      await this.cacheService.delete(`guests:${eventId}:undefined:`);
      await this.cacheService.deletePattern(`guests:${eventId}:*`);

      console.log('✅ Backend: Guest updated successfully:', updatedGuest.toObject());
      return res.json({
        success: true,
        data: updatedGuest.toObject(),
      });
    } catch (error: any) {
      console.error('❌ Backend: Error updating guest:', error.message);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  importFromExcel = async (req: AuthRequest, res: Response) => {
    try {
      const { eventId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
      }

      console.log('📥 Backend: Importing guests from Excel for event:', eventId);

      const useCase = new ImportGuestsFromExcelUseCase(
        this.guestRepository,
        this.eventRepository
      );

      const result = await useCase.execute(eventId, req.file.buffer);

      // Invalidate cache for this event after successful import
      console.log('🗑️ Backend: Clearing cache after Excel import for event:', eventId);
      await this.cacheService.delete(`guests:${eventId}:all:`);
      await this.cacheService.delete(`guests:${eventId}:undefined:`);
      await this.cacheService.deletePattern(`guests:${eventId}:*`);

      console.log('✅ Backend: Import completed. Success:', result.successCount, 'Failed:', result.failureCount);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('❌ Backend: Error importing Excel:', error.message);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  deleteGuest = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      // Get guest before deletion to know which event to invalidate cache for
      const guest = await this.guestRepository.findById(id);
      if (!guest) {
        return res.status(404).json({
          success: false,
          error: 'Guest not found',
        });
      }

      const eventId = guest.eventId;
      
      // Delete guest
      await this.guestRepository.delete(id);

      // Invalidate cache for this event
      console.log('🗑️ Backend: Clearing cache after guest deletion for event:', eventId);
      await this.cacheService.delete(`guests:${eventId}:all:`);
      await this.cacheService.delete(`guests:${eventId}:undefined:`);
      await this.cacheService.deletePattern(`guests:${eventId}:*`);

      return res.json({
        success: true,
        message: 'Guest deleted successfully',
        data: { eventId }, // Return eventId so frontend knows which cache to invalidate
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  // Download Excel template
  downloadTemplate = async (_req: AuthRequest, res: Response) => {
    try {
      console.log('📥 Generating Excel template...');
      
      const template = generateGuestImportTemplate();
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=guest-import-template.xlsx');
      res.setHeader('Content-Length', template.length);
      
      console.log('✅ Template generated successfully');
      return res.send(template);
    } catch (error: any) {
      console.error('❌ Error generating template:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };
}

