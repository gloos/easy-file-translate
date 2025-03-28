
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText, 
  RotateCw 
} from "lucide-react";

type StatusBadgeProps = {
  status: 'queued' | 'processing' | 'translating' | 'completed' | 'error';
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'queued':
        return {
          color: 'bg-status-queued text-white',
          icon: Clock,
          text: 'Queued'
        };
      case 'processing':
        return {
          color: 'bg-status-processing text-white',
          icon: FileText,
          text: 'OCR Processing'
        };
      case 'translating':
        return {
          color: 'bg-status-translating text-white',
          icon: RotateCw,
          text: 'Translating'
        };
      case 'completed':
        return {
          color: 'bg-status-completed text-white',
          icon: CheckCircle,
          text: 'Completed'
        };
      case 'error':
        return {
          color: 'bg-status-error text-white',
          icon: AlertCircle,
          text: 'Error'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} flex items-center gap-1 px-2.5 py-1`}>
      <Icon className="h-3.5 w-3.5" />
      <span>{config.text}</span>
    </Badge>
  );
}
