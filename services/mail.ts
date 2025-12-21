
import { AppSettings, SmtpConfig } from '../types';

// Client-side simulation of Mail Service.
// In a real production environment, this would call a Supabase Edge Function to keep SMTP credentials secure.
export const mailService = {
    
    async sendTestMail(config: SmtpConfig, toEmail: string): Promise<{ success: boolean; message: string }> {
        console.log("Attempting to send mail with config:", config);
        
        // Simulating network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (!config) {
             return { success: false, message: 'SMTP ayarları eksik veya yüklenemedi.' };
        }

        if (!config.host || !config.user || !config.pass) {
            return { success: false, message: 'SMTP ayarları eksik. Lütfen Host, Kullanıcı ve Şifre alanlarını doldurun.' };
        }

        // Mock Success
        return { success: true, message: `Test e-postası başarıyla gönderildi: ${toEmail}` };
    },

    async sendPasswordReset(settings: AppSettings, email: string): Promise<{ success: boolean; message: string }> {
        // This would use the saved settings from the database
        const config = settings?.smtp;
        
        if (!config) {
            return { success: false, message: 'Sistem posta ayarları yapılandırılmamış.' };
        }

        console.log(`Sending Password Reset Link to ${email} via ${config.host}...`);
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (!email.includes('@') || !email.includes('.')) {
             return { success: false, message: 'Geçersiz e-posta adresi.' };
        }

        return { success: true, message: 'Sıfırlama bağlantısı e-posta adresinize gönderildi.' };
    }
};
