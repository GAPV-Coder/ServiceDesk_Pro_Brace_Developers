import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryField, CategorySLA } from '../../modules/categories/entities/category.entity';

@Injectable()
export class CategorySeeder {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) { }

    async seed(): Promise<void> {
        // Verificar si ya existen categorías
        const existingCategories = await this.categoryRepository.count();
        if (existingCategories > 0) {
            console.log('Categories already exist, skipping seeding');
            return;
        }

        const categories = [
            {
                name: 'Hardware Issues',
                description: 'Problems with computer hardware, peripherals, and physical equipment',
                additionalFields: [
                    {
                        id: 'hardware-type',
                        name: 'hardwareType',
                        label: 'Hardware Type',
                        type: 'select',
                        required: true,
                        options: ['Desktop Computer', 'Laptop', 'Monitor', 'Printer', 'Network Equipment', 'Mobile Device', 'Other'],
                    },
                    {
                        id: 'error-details',
                        name: 'errorDetails',
                        label: 'Error Details',
                        type: 'textarea',
                        required: true,
                        validation: { minLength: 10, maxLength: 500 },
                    },
                    {
                        id: 'asset-tag',
                        name: 'assetTag',
                        label: 'Asset Tag (if available)',
                        type: 'text',
                        required: false,
                        validation: {
                            pattern: '^[A-Z]{2}\\d{4}$',
                        },
                    }] as CategoryField[],
                sla: {
                    firstResponseHours: 2,
                    resolutionHours: 8,
                } as CategorySLA,
                color: '#ff6b6b',
                icon: 'hardware',
                sortOrder: 1,
            },
            {
                name: 'Software Issues',
                description: 'Application problems, software installations, and licensing issues',
                additionalFields: [
                    {
                        id: 'software-name',
                        name: 'softwareName',
                        label: 'Software Name',
                        type: 'text',
                        required: true,
                        validation: { minLength: 2, maxLength: 100 },
                    },
                    {
                        id: 'software-version',
                        name: 'softwareVersion',
                        label: 'Software Version',
                        type: 'text',
                        required: false,
                    },
                    {
                        id: 'error-message',
                        name: 'errorMessage',
                        label: 'Error Message (if any)',
                        type: 'textarea',
                        required: false,
                    },
                    {
                        id: 'business-impact',
                        name: 'businessImpact',
                        label: 'Business Impact',
                        type: 'select',
                        required: true,
                        options: ['Low - Can work around', 'Medium - Reduced productivity', 'High - Cannot work', 'Critical - Business stopped'],
                    },
                ] as CategoryField[],
                sla: {
                    firstResponseHours: 4,
                    resolutionHours: 24,
                } as CategorySLA,
                color: '#4ecdc4',
                icon: 'software',
                sortOrder: 2,
            },
            {
                name: 'Network & Connectivity',
                description: 'Internet, WiFi, VPN, and network connectivity problems',
                additionalFields: [
                    {
                        id: 'connection-type',
                        name: 'connectionType',
                        label: 'Connection Type',
                        type: 'select',
                        required: true,
                        options: ['WiFi', 'Ethernet', 'VPN', 'Mobile Data', 'Other'],
                    },
                    {
                        id: 'location',
                        name: 'location',
                        label: 'Location/Office',
                        type: 'text',
                        required: true,
                    },
                    {
                        id: 'devices-affected',
                        name: 'devicesAffected',
                        label: 'Number of Devices Affected',
                        type: 'number',
                        required: true,
                        validation: { min: 1, max: 1000 },
                    },
                ] as CategoryField[],
                sla: {
                    firstResponseHours: 1,
                    resolutionHours: 4,
                } as CategorySLA,
                color: '#45b7d1',
                icon: 'network',
                sortOrder: 3,
            },
            {
                name: 'Account & Access',
                description: 'User account creation, password resets, and permission requests',
                additionalFields: [
                    {
                        id: 'account-type',
                        name: 'accountType',
                        label: 'Account Type',
                        type: 'select',
                        required: true,
                        options: ['New User Account', 'Password Reset', 'Permission Change', 'Account Deactivation', 'Group Access'],
                    },
                    {
                        id: 'systems-needed',
                        name: 'systemsNeeded',
                        label: 'Systems/Applications Needed',
                        type: 'textarea',
                        required: true,
                        validation: { minLength: 5 },
                    },
                    {
                        id: 'manager-approval',
                        name: 'managerApproval',
                        label: 'Manager Approval Received',
                        type: 'boolean',
                        required: true,
                    },
                    {
                        id: 'start-date',
                        name: 'startDate',
                        label: 'Required Start Date',
                        type: 'date',
                        required: true,
                    },
                ] as CategoryField[],
                sla: {
                    firstResponseHours: 2,
                    resolutionHours: 12,
                } as CategorySLA,
                color: '#f39c12',
                icon: 'account',
                sortOrder: 4,
            },
            {
                name: 'Development Support',
                description: 'Repository access, pipeline issues, and development environment problems',
                additionalFields: [
                    {
                        id: 'request-type',
                        name: 'requestType',
                        label: 'Request Type',
                        type: 'select',
                        required: true,
                        options: ['Repository Access', 'Pipeline Issue', 'Environment Setup', 'Deployment Issue', 'Code Review', 'Other'],
                    },
                    {
                        id: 'repository-url',
                        name: 'repositoryUrl',
                        label: 'Repository URL (if applicable)',
                        type: 'text',
                        required: false,
                        validation: { pattern: '^https://(github|gitlab|bitbucket)\\.' },
                    },
                    {
                        id: 'environment',
                        name: 'environment',
                        label: 'Environment',
                        type: 'select',
                        required: false,
                        options: ['Development', 'Staging', 'Production', 'Testing'],
                    },
                    {
                        id: 'urgency-reason',
                        name: 'urgencyReason',
                        label: 'Reason for Urgency',
                        type: 'textarea',
                        required: false,
                    },
                ] as CategoryField[],
                sla: {
                    firstResponseHours: 4,
                    resolutionHours: 16,
                } as CategorySLA,
                color: '#9b59b6',
                icon: 'development',
                sortOrder: 5,
            },
            {
                name: 'General IT Support',
                description: 'Other IT-related requests that don\'t fit specific categories',
                additionalFields: [
                    {
                        id: 'request-details',
                        name: 'requestDetails',
                        label: 'Detailed Description',
                        type: 'textarea',
                        required: true,
                        validation: { minLength: 20, maxLength: 1000 },
                    },
                    {
                        id: 'preferred-contact',
                        name: 'preferredContact',
                        label: 'Preferred Contact Method',
                        type: 'select',
                        required: true,
                        options: ['Email', 'Phone', 'Teams/Slack', 'In Person'],
                    },
                    {
                        id: 'availability',
                        name: 'availability',
                        label: 'Your Availability',
                        type: 'text',
                        required: false,
                        validation: { maxLength: 100 },
                    },
                ] as CategoryField[],
                sla: {
                    firstResponseHours: 8,
                    resolutionHours: 48,
                } as CategorySLA,
                color: '#95a5a6',
                icon: 'support',
                sortOrder: 6,
            },
        ];

        const createdCategories = this.categoryRepository.create(categories);
        await this.categoryRepository.save(createdCategories);

        console.log(`✅ Created ${categories.length} categories`);
    }
}