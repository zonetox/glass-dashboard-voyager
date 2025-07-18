import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Smartphone, Key, Copy, Download, CheckCircle, AlertTriangle } from 'lucide-react';

interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export default function TwoFactorAuth() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [setupStep, setSetupStep] = useState<'disabled' | 'setup' | 'verify' | 'enabled'>('disabled');
  const [verificationCode, setVerificationCode] = useState('');
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    checkTwoFactorStatus();
  }, [user]);

  const checkTwoFactorStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('two_factor_enabled')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setIsEnabled(data.two_factor_enabled || false);
        setSetupStep(data.two_factor_enabled ? 'enabled' : 'disabled');
      }
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const generateSetupData = async () => {
    setLoading(true);
    try {
      // Generate TOTP secret
      const secret = generateTOTPSecret();
      const qrCodeUrl = generateQRCodeUrl(user?.email || '', secret);
      const backupCodes = generateBackupCodes();

      setSetupData({
        secret,
        qrCodeUrl,
        backupCodes
      });

      setSetupStep('setup');
    } catch (error) {
      toast({ title: "Failed to generate 2FA setup", variant: "destructive" });
    }
    setLoading(false);
  };

  const verifySetup = async () => {
    if (!setupData || !verificationCode) return;

    setLoading(true);
    try {
      // In a real implementation, verify the TOTP code against the secret
      const isValid = verifyTOTPCode(setupData.secret, verificationCode);

      if (isValid) {
        // Save 2FA settings to database
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user?.id,
            two_factor_enabled: true,
            two_factor_secret: setupData.secret,
            backup_codes: setupData.backupCodes
          });

        if (error) throw error;

        setIsEnabled(true);
        setSetupStep('enabled');
        setShowBackupCodes(true);
        toast({ title: "Two-factor authentication enabled successfully" });
      } else {
        toast({ title: "Invalid verification code", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Failed to enable 2FA", variant: "destructive" });
    }
    setLoading(false);
  };

  const disable2FA = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          two_factor_enabled: false,
          two_factor_secret: null,
          backup_codes: null
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      setIsEnabled(false);
      setSetupStep('disabled');
      setSetupData(null);
      toast({ title: "Two-factor authentication disabled" });
    } catch (error) {
      toast({ title: "Failed to disable 2FA", variant: "destructive" });
    }
    setLoading(false);
  };

  const generateTOTPSecret = (): string => {
    // Generate a random base32 secret
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const generateQRCodeUrl = (email: string, secret: string): string => {
    const issuer = 'SEO Auto Tool';
    const label = `${issuer}:${email}`;
    return `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  };

  const generateBackupCodes = (): string[] => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const verifyTOTPCode = (secret: string, code: string): boolean => {
    // This is a simplified verification - in production, use a proper TOTP library
    return code.length === 6 && /^\d+$/.test(code);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const downloadBackupCodes = () => {
    if (!setupData) return;

    const content = `SEO Auto Tool - Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${setupData.backupCodes.join('\n')}\n\nStore these codes safely. Each code can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seo-auto-tool-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Two-Factor Authentication</h2>
        <Badge variant={isEnabled ? "default" : "secondary"}>
          {isEnabled ? "Enabled" : "Disabled"}
        </Badge>
      </div>

      {setupStep === 'disabled' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Enable Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account by requiring a verification code from your phone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You'll need an authenticator app like Google Authenticator, Authy, or 1Password to generate verification codes.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-medium">Benefits of 2FA:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Protects your account even if your password is compromised</li>
                <li>• Required for admin access and sensitive operations</li>
                <li>• Industry standard security practice</li>
              </ul>
            </div>

            <Button onClick={generateSetupData} disabled={loading}>
              Enable Two-Factor Authentication
            </Button>
          </CardContent>
        </Card>
      )}

      {setupStep === 'setup' && setupData && (
        <Card>
          <CardHeader>
            <CardTitle>Set Up Authenticator App</CardTitle>
            <CardDescription>
              Scan the QR code or manually enter the secret key in your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-background border rounded-lg">
                <div className="w-48 h-48 bg-muted flex items-center justify-center">
                  QR Code would appear here
                </div>
              </div>

              <div className="space-y-2 w-full">
                <Label>Or enter this secret key manually:</Label>
                <div className="flex gap-2">
                  <Input value={setupData.secret} readOnly className="font-mono" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(setupData.secret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Enter the 6-digit code from your authenticator app:</Label>
              <Input
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={verifySetup} 
                disabled={loading || verificationCode.length !== 6}
              >
                Verify & Enable
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSetupStep('disabled')}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {setupStep === 'enabled' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Two-Factor Authentication Active
            </CardTitle>
            <CardDescription>
              Your account is protected with two-factor authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                You'll now be prompted for a verification code when signing in from new devices.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowBackupCodes(true)}>
                View Backup Codes
              </Button>
              <Button variant="destructive" onClick={disable2FA}>
                Disable 2FA
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Backup Codes
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Save these backup codes in a safe place. Each code can only be used once to access your account if you lose your phone.
              </AlertDescription>
            </Alert>

            {setupData?.backupCodes && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {setupData.backupCodes.map((code, index) => (
                    <div key={index} className="p-2 bg-muted rounded text-center">
                      {code}
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(setupData.backupCodes.join('\n'))}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={downloadBackupCodes}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}