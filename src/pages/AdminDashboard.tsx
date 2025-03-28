
import { useState } from 'react';
import { useTranslation, TranslationJob } from '@/contexts/TranslationContext';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { getUserJobs } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get all jobs
  const allJobs = getUserJobs();
  
  // Filter jobs by search query
  const filteredJobs = allJobs.filter(job => 
    job.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.sourceLanguage.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.targetLanguage.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.username.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Count jobs by status
  const jobCounts = {
    total: filteredJobs.length,
    active: filteredJobs.filter(job => ['queued', 'processing', 'translating'].includes(job.status)).length,
    completed: filteredJobs.filter(job => job.status === 'completed').length,
    error: filteredJobs.filter(job => job.status === 'error').length
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage all translation jobs across the organization</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Jobs</p>
          <p className="text-2xl font-bold">{jobCounts.total}</p>
        </div>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <p className="text-sm text-gray-500">Active Jobs</p>
          <p className="text-2xl font-bold text-status-processing">{jobCounts.active}</p>
        </div>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <p className="text-sm text-gray-500">Completed Jobs</p>
          <p className="text-2xl font-bold text-status-completed">{jobCounts.completed}</p>
        </div>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <p className="text-sm text-gray-500">Failed Jobs</p>
          <p className="text-2xl font-bold text-status-error">{jobCounts.error}</p>
        </div>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <Input
          className="pl-10"
          placeholder="Search by filename, language, username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* All Jobs Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Translation Jobs</h2>
        {filteredJobs.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full bg-white">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">User</th>
                  <th className="py-3 px-4 text-left">File</th>
                  <th className="py-3 px-4 text-left">Languages</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredJobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium">
                          {job.username.charAt(0).toUpperCase()}
                        </div>
                        <span>{job.username}</span>
                      </div>
                    </td>
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
                      {job.completedDate && job.status === 'completed' && (
                        <div className="text-xs text-gray-500">
                          Completed: {formatDate(job.completedDate)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={job.status} />
                      {job.error && <div className="text-xs text-red-600 mt-1">{job.error}</div>}
                    </td>
                    <td className="py-3 px-4">
                      {job.status === 'completed' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => handleDownload(job)}
                        >
                          <Download size={14} />
                          <span>Download</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 border rounded-lg p-8 text-center">
            <p className="text-gray-500">No jobs found matching your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
