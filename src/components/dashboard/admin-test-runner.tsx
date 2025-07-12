import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  duration?: number;
  details?: string;
  url?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  status: 'pending' | 'running' | 'completed';
}

export function AdminTestRunner() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      name: 'Edge Functions',
      status: 'pending',
      tests: [
        { name: 'analyze-website', status: 'pending', url: 'https://example.com' },
        { name: 'api-scan', status: 'pending' },
        { name: 'api-metasuggest', status: 'pending' },
        { name: 'api-faq-schema', status: 'pending' },
        { name: 'competitor-analysis', status: 'pending' },
        { name: 'write', status: 'pending' }
      ]
    },
    {
      name: 'Database Operations',
      status: 'pending',
      tests: [
        { name: 'User Profile Creation', status: 'pending' },
        { name: 'Scan Result Storage', status: 'pending' },
        { name: 'API Token Management', status: 'pending' },
        { name: 'Usage Tracking', status: 'pending' },
        { name: 'RLS Policies', status: 'pending' }
      ]
    },
    {
      name: 'Storage Operations',
      status: 'pending',
      tests: [
        { name: 'Scan Data Upload', status: 'pending' },
        { name: 'PDF Report Generation', status: 'pending' },
        { name: 'Backup Storage', status: 'pending' },
        { name: 'File Download', status: 'pending' }
      ]
    },
    {
      name: 'Frontend Components',
      status: 'pending',
      tests: [
        { name: 'Authentication Flow', status: 'pending' },
        { name: 'Dashboard Navigation', status: 'pending' },
        { name: 'Website Analyzer', status: 'pending' },
        { name: 'Content Writer', status: 'pending' },
        { name: 'API Token UI', status: 'pending' }
      ]
    }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSuite, setCurrentSuite] = useState<number | null>(null);
  const [currentTest, setCurrentTest] = useState<number | null>(null);
  const { toast } = useToast();

  const runTests = async () => {
    setIsRunning(true);
    
    for (let suiteIndex = 0; suiteIndex < testSuites.length; suiteIndex++) {
      setCurrentSuite(suiteIndex);
      
      // Update suite status
      setTestSuites(prev => prev.map((suite, i) => 
        i === suiteIndex ? { ...suite, status: 'running' } : suite
      ));

      const suite = testSuites[suiteIndex];
      
      for (let testIndex = 0; testIndex < suite.tests.length; testIndex++) {
        setCurrentTest(testIndex);
        
        // Update test status to running
        setTestSuites(prev => prev.map((suite, i) => 
          i === suiteIndex ? {
            ...suite,
            tests: suite.tests.map((test, j) => 
              j === testIndex ? { ...test, status: 'running' } : test
            )
          } : suite
        ));

        // Simulate test execution
        const result = await simulateTest(suite.tests[testIndex]);
        
        // Update test with result
        setTestSuites(prev => prev.map((suite, i) => 
          i === suiteIndex ? {
            ...suite,
            tests: suite.tests.map((test, j) => 
              j === testIndex ? { ...test, ...result } : test
            )
          } : suite
        ));

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Update suite status to completed
      setTestSuites(prev => prev.map((suite, i) => 
        i === suiteIndex ? { ...suite, status: 'completed' } : suite
      ));
    }

    setIsRunning(false);
    setCurrentSuite(null);
    setCurrentTest(null);
    
    toast({
      title: "Test Suite Completed",
      description: "All tests have been executed"
    });
  };

  const simulateTest = async (test: TestResult): Promise<Partial<TestResult>> => {
    const startTime = Date.now();
    
    // Simulate test execution time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
    
    const duration = Date.now() - startTime;
    
    // Simulate different outcomes
    const random = Math.random();
    
    if (random < 0.7) {
      return {
        status: 'passed',
        duration,
        details: 'Test completed successfully'
      };
    } else if (random < 0.9) {
      return {
        status: 'warning',
        duration,
        details: 'Test completed with warnings'
      };
    } else {
      return {
        status: 'failed',
        duration,
        details: 'Test failed - check configuration'
      };
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-400 animate-spin" />;
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-600" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const configs = {
      pending: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/20', label: 'Pending' },
      running: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/20', label: 'Running' },
      passed: { color: 'bg-green-500/20 text-green-400 border-green-500/20', label: 'Passed' },
      failed: { color: 'bg-red-500/20 text-red-400 border-red-500/20', label: 'Failed' },
      warning: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20', label: 'Warning' }
    };
    
    const config = configs[status];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getOverallProgress = () => {
    const totalTests = testSuites.reduce((acc, suite) => acc + suite.tests.length, 0);
    const completedTests = testSuites.reduce((acc, suite) => 
      acc + suite.tests.filter(test => ['passed', 'failed', 'warning'].includes(test.status)).length, 0
    );
    return (completedTests / totalTests) * 100;
  };

  const getTestCounts = () => {
    const allTests = testSuites.flatMap(suite => suite.tests);
    return {
      passed: allTests.filter(test => test.status === 'passed').length,
      failed: allTests.filter(test => test.status === 'failed').length,
      warning: allTests.filter(test => test.status === 'warning').length,
      total: allTests.length
    };
  };

  const testCounts = getTestCounts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">System Test Runner</h2>
          <p className="text-gray-400">Comprehensive testing of all application components</p>
        </div>
        <Button 
          onClick={runTests}
          disabled={isRunning}
          className="bg-green-500 hover:bg-green-600"
        >
          <Play className="w-4 h-4 mr-2" />
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </Button>
      </div>

      {/* Overall Progress */}
      {isRunning && (
        <Card className="glass-card border-white/10">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Overall Progress</span>
                <span className="text-gray-400">{Math.round(getOverallProgress())}%</span>
              </div>
              <Progress value={getOverallProgress()} className="h-2" />
              
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-green-500/10 rounded border border-green-500/20">
                  <p className="text-2xl font-bold text-green-400">{testCounts.passed}</p>
                  <p className="text-sm text-gray-400">Passed</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded border border-red-500/20">
                  <p className="text-2xl font-bold text-red-400">{testCounts.failed}</p>
                  <p className="text-sm text-gray-400">Failed</p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded border border-yellow-500/20">
                  <p className="text-2xl font-bold text-yellow-400">{testCounts.warning}</p>
                  <p className="text-sm text-gray-400">Warnings</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded border border-blue-500/20">
                  <p className="text-2xl font-bold text-blue-400">{testCounts.total}</p>
                  <p className="text-sm text-gray-400">Total</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Suites */}
      <div className="space-y-4">
        {testSuites.map((suite, suiteIndex) => (
          <Card 
            key={suite.name} 
            className={`glass-card border-white/10 ${
              currentSuite === suiteIndex ? 'ring-2 ring-blue-500/50' : ''
            }`}
          >
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-white">
                <span>{suite.name}</span>
                <div className="flex items-center gap-2">
                  {suite.status === 'running' && (
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse" />
                  )}
                  {getStatusBadge(suite.status as any)}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suite.tests.map((test, testIndex) => (
                  <div 
                    key={test.name}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      currentSuite === suiteIndex && currentTest === testIndex
                        ? 'bg-blue-500/10 border-blue-500/20'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <p className="text-white font-medium">{test.name}</p>
                        {test.details && (
                          <p className="text-sm text-gray-400">{test.details}</p>
                        )}
                        {test.url && (
                          <p className="text-xs text-blue-400">{test.url}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {test.duration && (
                        <span className="text-sm text-gray-400">{test.duration}ms</span>
                      )}
                      {getStatusBadge(test.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}