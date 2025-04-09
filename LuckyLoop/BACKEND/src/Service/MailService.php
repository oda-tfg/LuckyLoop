<?php
namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class MailService
{
    private MailerInterface $mailer;

    public function __construct(MailerInterface $mailer) {
        $this->mailer = $mailer;
    }

    public function enviarEmail(string $para, string $asunto, string $mensaje, string $motivo, string $de = 'odatfg@gmail.com'): void
    {
        $htmlTemplate = '
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
                <h2 style="color: #4CAF50; text-align: center;">🎰 LuckyLoop</h2>
                <h3 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px;">' . htmlspecialchars($motivo) . '</h3>
                <div style="margin-top: 20px; font-size: 16px; color: #444;">
                    ' . nl2br($mensaje) . '
                </div>
                <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #888; text-align: center;">
                    Este correo fue generado automáticamente por LuckyLoop. Por favor, no respondas a este mensaje.
                </p>
            </div>
        ';
    
        $email = (new Email())
            ->from($de)
            ->to($para)
            ->subject($asunto)
            ->html($htmlTemplate);
    
        $this->mailer->send($email);
    }
    
}
