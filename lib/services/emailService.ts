import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface WelcomeEmailData {
  name: string;
  email: string;
  magicLinkUrl: string;
  companyName?: string;
}

export async function sendWelcomeEmail({ name, email, magicLinkUrl, companyName }: WelcomeEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY not configured. Email will be logged to console instead.');
    console.log(`
📧 Welcome Email would be sent to: ${email}
👤 Name: ${name}
🔗 Magic Link: ${magicLinkUrl}
    `);
    return { success: true, method: 'console' };
  }

  try {
    const companyDisplayName = companyName || process.env.COMPANY_NAME || 'ERP System';
    const fromEmail = process.env.EMAIL_FROM || 'noreply@example.com';

    const emailResult = await resend.emails.send({
      from: `${companyDisplayName} <${fromEmail}>`,
      to: [email],
      subject: `Bienvenue dans ${companyDisplayName}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenue</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              padding: 20px 0;
              border-bottom: 2px solid #f0f0f0;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .content {
              padding: 30px 0;
            }
            .button {
              display: inline-block;
              background-color: #2563eb;
              color: white;
              padding: 14px 28px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              margin: 20px 0;
              text-align: center;
            }
            .button:hover {
              background-color: #1d4ed8;
            }
            .info-box {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 20px;
              margin: 20px 0;
            }
            .footer {
              border-top: 2px solid #f0f0f0;
              padding: 20px 0;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .warning {
              color: #dc2626;
              font-size: 14px;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">${companyDisplayName}</div>
            <p>Système de Gestion des Ressources</p>
          </div>

          <div class="content">
            <h2>Bonjour ${name},</h2>

            <p>Votre compte a été créé avec succès dans notre système de gestion des ressources humaines.</p>

            <p>Pour accéder à votre compte, cliquez sur le bouton ci-dessous :</p>

            <div style="text-align: center;">
              <a href="${magicLinkUrl}" class="button">
                🔐 Accéder à mon compte
              </a>
            </div>

            <div class="info-box">
              <h3>📋 Ce que vous pouvez faire :</h3>
              <ul>
                <li>Consulter vos informations personnelles</li>
                <li>Accéder aux fonctionnalités selon votre rôle</li>
                <li>Gérer vos données RH (selon permissions)</li>
                <li>Consulter les rapports de paie</li>
              </ul>
            </div>

            <p class="warning">
              ⚠️ <strong>Important :</strong> Ce lien expire dans 15 minutes pour des raisons de sécurité.
            </p>

            <p>Si vous rencontrez des difficultés pour accéder à votre compte, contactez votre administrateur système.</p>
          </div>

          <div class="footer">
            <p>Cet email a été envoyé automatiquement par ${companyDisplayName}</p>
            <p>Si vous avez reçu cet email par erreur, veuillez l'ignorer.</p>
          </div>
        </body>
        </html>
      `,
      text: `
Bienvenue ${name},

Votre compte a été créé avec succès dans ${companyDisplayName}.

Pour accéder à votre compte, cliquez sur le lien suivant :
${magicLinkUrl}

IMPORTANT: Ce lien expire dans 15 minutes.

Si vous rencontrez des difficultés, contactez votre administrateur système.

Cordialement,
L'équipe ${companyDisplayName}
      `
    });

    if (emailResult.error) {
      console.error('❌ Erreur Resend:', emailResult.error);
      throw new Error(`Erreur d'envoi d'email: ${emailResult.error.message}`);
    }

    console.log(`✅ Email envoyé avec succès à ${email} (ID: ${emailResult.data?.id})`);
    return {
      success: true,
      method: 'resend',
      messageId: emailResult.data?.id
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);

    // Fallback to console logging if email fails
    console.log(`
📧 FALLBACK - Welcome Email for: ${email}
👤 Name: ${name}
🔗 Magic Link: ${magicLinkUrl}
    `);

    throw new Error(`Échec de l'envoi de l'email: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

// Email template for password reset (for future use)
export async function sendPasswordResetEmail({ name, email, resetUrl }: { name: string; email: string; resetUrl: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`Password reset email for ${email}: ${resetUrl}`);
    return { success: true, method: 'console' };
  }

  try {
    const companyDisplayName = process.env.COMPANY_NAME || 'ERP System';
    const fromEmail = process.env.EMAIL_FROM || 'noreply@example.com';

    const emailResult = await resend.emails.send({
      from: `${companyDisplayName} <${fromEmail}>`,
      to: [email],
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Réinitialisation de mot de passe</h2>
          <p>Bonjour ${name},</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p><a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Réinitialiser mon mot de passe</a></p>
          <p>Ce lien expire dans 1 heure.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        </body>
        </html>
      `
    });

    return { success: true, method: 'resend', messageId: emailResult.data?.id };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}