
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, TranslationJob } from '@/contexts/TranslationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { Download, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { getUserJobs } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get user's jobs
  const jobs = getUserJobs();
  
  // Filter jobs by search query
  const filteredJobs = jobs.filter(job => 
    job.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.sourceLanguage.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.targetLanguage.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group jobs by status
  const activeJobs = filteredJobs.filter(job => 
    ['queued', 'processing', 'translating'].includes(job.status)
  );
  
  const completedJobs = filteredJobs.filter(job => 
    job.status === 'completed'
  );
  
  const failedJobs = filteredJobs.filter(job => 
    job.status === 'error'
  );

  const handleDownload = (job: TranslationJob) => {
    // In a real app, this would download the translated file
    toast.success(`Downloaded translation for ${job.fileName}`);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Translation Dashboard</h1>
          <p className="text-gray-500 mt-1">View and manage your translation jobs</p>
        </div>
        
        <Link to="/new-translation">
          <Button className="gap-2">
            <Plus size={16} />
            <span>New Translation</span>
          </Button>
        </Link>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <Input
          className="pl-10"
          placeholder="Search by filename, language..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Active Jobs Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Active Jobs</h2>
        {activeJobs.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full bg-white">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">File</th>
                  <th className="py-3 px-4 text-left">Languages</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {activeJobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-start">
                        <div className="flex-1 truncate">
                          <div className="font-medium truncate" title={job.fileName}>
                            {job.fileName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatFileSize(job.fileSize)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-sm font-medium">From: {job.sourceLanguage}</div>
                        <div className="text-sm">To: {job.targetLanguage}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap">
                      {formatDate(job.uploadDate)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={job.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 border rounded-lg p-8 text-center">
            <p className="text-gray-500">No active jobs</p>
          </div>
        )}
      </div>
      
      {/* Completed Jobs Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Completed Jobs</h2>
        {completedJobs.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full bg-white">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">File</th>
                  <th className="py-3 px-4 text-left">Languages</th>
                  <th className="py-3 px-4 text-left">Date Completed</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {completedJobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-start">
                        <div className="flex-1 truncate">
                          <div className="font-medium truncate" title={job.fileName}>
                            {job.fileName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatFileSize(job.fileSize)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-sm font-medium">From: {job.sourceLanguage}</div>
                        <div className="text-sm">To: {job.targetLanguage}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap">
                      {job.completedDate ? formatDate(job.completedDate) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="py-3 px-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => handleDownload(job)}
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 border rounded-lg p-8 text-center">
            <p className="text-gray-500">No completed jobs</p>
          </div>
        )}
      </div>
      
      {/* Failed Jobs Section */}
      {failedJobs.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Failed Jobs</h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full bg-white">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">File</th>
                  <th className="py-3 px-4 text-left">Languages</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {failedJobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-start">
                        <div className="flex-1 truncate">
                          <div className="font-medium truncate" title={job.fileName}>
                            {job.fileName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatFileSize(job.fileSize)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-sm font-medium">From: {job.sourceLanguage}</div>
                        <div className="text-sm">To: {job.targetLanguage}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap">
                      {formatDate(job.uploadDate)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="py-3 px-4 text-sm text-red-600">
                      {job.error || 'Unknown error'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {jobs.length === 0 && (
        <div className="bg-gray-50 border rounded-lg p-12 text-center space-y-4">
          <p className="text-gray-500 text-lg">You haven't submitted any translation jobs yet</p>
          <Link to="/new-translation">
            <Button>Start a New Translation</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
