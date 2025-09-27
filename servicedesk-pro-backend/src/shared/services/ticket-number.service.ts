import { Injectable } from '@nestjs/common';

@Injectable()
export class TicketNumberService {
    generateTicketNumber(): string {
        const prefix = 'SD';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }

    isValidTicketNumber(ticketNumber: string): boolean {
        const pattern = /^SD-[A-Z0-9]+-[A-Z0-9]+$/;
        return pattern.test(ticketNumber);
    }
}