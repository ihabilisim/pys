
import type { User, UserProfile } from '../types';

export const DEMO_PROFILE: UserProfile = {
    name: 'Ibrahim Halil ACIOGLU',
    title: 'Survey Technician',
    email: 'ibrahim.acioglu@makyol.com',
    phone: '+40 700 123 456',
    avatarUrl: null
};

export const DEMO_USERS: User[] = [
    {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Valid UUID
        username: 'admin',
        password: '123',
        fullName: 'Sistem Yöneticisi',
        jobTitle: 'Senior Administrator',
        email: 'admin@makyol.com',
        phone: '+40 700 000 000',
        address: 'Main Camp, Avrig',
        role: 'admin',
        permissions: ['manage_users', 'manage_daily_log', 'manage_stats', 'manage_machinery', 'manage_timeline', 'manage_notifications', 'manage_files', 'manage_map', 'manage_drone', 'manage_settings', 'manage_quality', 'manage_materials']
    }
];
