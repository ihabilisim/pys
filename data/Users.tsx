
import { User, UserProfile } from '../types';

export const DEMO_USERS: User[] = [
    {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Fixed UUID matching SQL seed
        username: 'admin',
        password: '123',
        fullName: 'Sistem Yöneticisi',
        role: 'admin',
        permissions: ['manage_users', 'manage_settings', 'manage_daily_log', 'manage_stats', 'manage_machinery', 'manage_materials', 'manage_timeline', 'manage_map', 'manage_files', 'manage_quality', 'manage_drone', 'manage_notifications'],
        jobTitle: 'Senior Administrator',
        email: 'admin@makyol.com',
        phone: '+40 700 000 000',
        address: 'Main Camp, Avrig',
        avatarUrl: null
    }
];

export const DEMO_PROFILE: UserProfile = {
    name: "Admin User",
    title: "Project Manager",
    email: "admin@makyol.com",
    phone: "+40 123 456 789",
    avatarUrl: null
};
