
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import FileUploader, { FileWithPreview } from '@/components/FileUploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const NewTranslation = () => {
  const { user } = useAuth();
  const { addJob, getLanguages } = useTranslation();
  const navigate = useNavigate();
  
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [sourceLanguage, setSourceLanguage] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { source: sourceLanguages, target: targetLanguages } = getLanguages();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to submit translations');
      return;
    }
    
    if (files.length === 0) {
      toast.error('Please select at least one file to translate');
      return;
    }
    
    if (!sourceLanguage) {
      toast.error('Please select a source language');
      return;
    }
    
    if (!targetLanguage) {
      toast.error('Please select a target language');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Process each file as a separate job
      for (const fileWithPreview of files) {
        const { file } = fileWithPreview;
        
        // Create a translation job
        await addJob({
          fileName: file.name,
          fileSize: file.size,
          sourceLanguage,
          targetLanguage,
        });
      }
      
      // Success message
      toast.success(
        files.length === 1
          ? 'Translation job submitted successfully'
          : `${files.length} translation jobs submitted successfully`
      );
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting translation:', error);
      toast.error('Failed to submit translation job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New Translation</h1>
        <p className="text-gray-500 mt-1">Upload files and select translation options</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
                <FileUploader
                  files={files}
                  onFilesChange={setFiles}
                  maxFiles={10}
                  maxFileSizeMB={10}
                  acceptedFileTypes={['.pdf', '.docx', '.pptx']}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Language Options</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sourceLanguage">Source Language</Label>
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                    <SelectTrigger id="sourceLanguage">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceLanguages.map(lang => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    The original language of your document
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetLanguage">Target Language</Label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger id="targetLanguage">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {targetLanguages.map(lang => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    The language to translate your document into
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            className="gap-2"
            disabled={
              isSubmitting || 
              files.length === 0 || 
              !sourceLanguage || 
              !targetLanguage
            }
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Start Translation</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewTranslation;
