
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  History, 
  Search, 
  Undo2, 
  AlertTriangle,
  Download,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { listBackups, initiateRollback, type BackupInfo, type RollbackCredentials } from '@/lib/rollback-api';
import { Label } from '@/components/ui/label';

interface RollbackManagerProps {
  websiteUrl?: string;
}

export function RollbackManager({ websiteUrl }: RollbackManagerProps) {
  const { toast } = useToast();
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [filteredBackups, setFilteredBackups] = useState<BackupInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchUrl, setSearchUrl] = useState(websiteUrl || '');
  const [selectedBackup, setSelectedBackup] = useState<BackupInfo | null>(null);
  const [isRollbackDialogOpen, setIsRollbackDialogOpen] = useState(false);
  const [wpCredentials, setWpCredentials] = useState<RollbackCredentials>({
    username: '',
    applicationPassword: ''
  });

  const loadBackups = async (url: string) => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    try {
      const backupData = await listBackups(url);
      setBackups(backupData);
      setFilteredBackups(backupData);
    } catch (error) {
      console.error('Error loading backups:', error);
      toast({
        title: "Error",
        description: "Failed to load backups",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (websiteUrl) {
      loadBackups(websiteUrl);
    }
  }, [websiteUrl]);

  const handleSearch = () => {
    loadBackups(searchUrl);
  };

  const handleRollback = async () => {
    if (!selectedBackup) return;

    try {
      const result = await initiateRollback(
        selectedBackup.url,
        selectedBackup.id,
        selectedBackup.backupUrl,
        wpCredentials.username ? wpCredentials : undefined
      );

      toast({
        title: result.success ? "Rollback Initiated" : "Rollback Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });

      if (result.success) {
        setIsRollbackDialogOpen(false);
        loadBackups(selectedBackup.url); // Refresh the list
      }
    } catch (error) {
      toast({
        title: "Rollback Failed",
        description: "An error occurred during rollback",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreChange = (before: number, after: number) => {
    const change = after - before;
    return {
      value: change,
      isPositive: change > 0,
      percentage: Math.abs((change / before) * 100).toFixed(1)
    };
  };

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <History className="h-5 w-5 text-blue-400" />
          Website Rollback Manager
        </CardTitle>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Enter website URL to find backups..."
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={!searchUrl.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Search
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading backups...</p>
          </div>
        ) : filteredBackups.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white font-medium">No backups found</p>
            <p className="text-gray-400">
              {searchUrl ? `No backups available for ${searchUrl}` : 'Search for a website to view available backups'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBackups.map((backup) => {
              const scoreChange = getScoreChange(backup.seoScoreBefore, backup.seoScoreAfter);
              
              return (
                <div
                  key={backup.id}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-white font-medium">
                        {new URL(backup.url).hostname}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {formatDate(backup.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <Badge className={
                      backup.status === 'completed' ? 'bg-green-500/20 border-green-500/20 text-green-400' :
                      backup.status === 'rolled_back' ? 'bg-yellow-500/20 border-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 border-gray-500/20 text-gray-400'
                    }>
                      {backup.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">SEO Score:</span>
                        <span className="text-white">
                          {backup.seoScoreBefore} → {backup.seoScoreAfter}
                        </span>
                        <div className={`flex items-center gap-1 ${
                          scoreChange.isPositive ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {scoreChange.isPositive ? 
                            <TrendingUp className="h-3 w-3" /> : 
                            <TrendingDown className="h-3 w-3" />
                          }
                          <span className="text-xs">
                            {scoreChange.isPositive ? '+' : ''}{scoreChange.value}
                          </span>
                        </div>
                      </div>
                      
                      <Badge className="bg-blue-500/20 border-blue-500/20 text-blue-400">
                        {backup.fixesApplied.length} fixes
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog 
                      open={isRollbackDialogOpen && selectedBackup?.id === backup.id}
                      onOpenChange={(open) => {
                        setIsRollbackDialogOpen(open);
                        if (open) setSelectedBackup(backup);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Undo2 className="h-3 w-3 mr-1" />
                          Rollback
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-white/20">
                        <DialogHeader>
                          <DialogTitle className="text-white">Confirm Rollback</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            This will restore your website to the state it was in on {formatDate(backup.createdAt)}.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-400" />
                              <span className="text-sm font-medium text-yellow-400">Warning</span>
                            </div>
                            <p className="text-xs text-gray-300">
                              This action will overwrite your current website files and database. 
                              Make sure you have a recent backup before proceeding.
                            </p>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-white">WordPress Credentials (Optional)</Label>
                            <p className="text-xs text-gray-400">
                              Provide WordPress credentials for automatic rollback, or leave empty for manual instructions.
                            </p>
                            <Input
                              placeholder="WordPress Username"
                              value={wpCredentials.username}
                              onChange={(e) => setWpCredentials(prev => ({ ...prev, username: e.target.value }))}
                              className="bg-white/5 border-white/20 text-white"
                            />
                            <Input
                              type="password"
                              placeholder="Application Password"
                              value={wpCredentials.applicationPassword}
                              onChange={(e) => setWpCredentials(prev => ({ ...prev, applicationPassword: e.target.value }))}
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>
                        </div>

                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsRollbackDialogOpen(false)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleRollback}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Undo2 className="h-4 w-4 mr-1" />
                            Confirm Rollback
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    {backup.backupUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(backup.backupUrl, '_blank')}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
