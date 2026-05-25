import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadDocument } from '../../utils/api';

interface UploadZoneProps {
  onSuccess?: () => void;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export default function UploadZone({ onSuccess }: UploadZoneProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const onDrop = useCallback(async (accepted: File[], rejected: any[]) => {
    if (rejected.length > 0) {
      toast.error('Only PDF, Word, or text files under 20MB are accepted');
      return;
    }
    if (!accepted[0]) return;

    const file = accepted[0];
    setFileName(file.name);
    setState('uploading');
    setProgress(0);
    setError('');

    try {
      await uploadDocument(file, setProgress);
      setState('success');
      toast.success(`"${file.name}" uploaded successfully`);
      onSuccess?.();
      setTimeout(() => { setState('idle'); setProgress(0); setFileName(''); }, 3000);
    } catch (e: any) {
      setState('error');
      const msg = e.response?.data?.error || 'Upload failed. Please try again.';
      setError(msg);
      toast.error(msg);
    }
  }, [onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 20 * 1024 * 1024,
    multiple: false,
    disabled: state === 'uploading',
  });

  const borderColor = isDragActive ? '#1eb3ff' : state === 'error' ? '#ef4444' : state === 'success' ? '#10b981' : 'var(--border)';
  const bgColor = isDragActive ? 'rgba(30,179,255,0.04)' : 'transparent';

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${borderColor}`,
          borderRadius: 12,
          padding: '40px 24px',
          textAlign: 'center',
          cursor: state === 'uploading' ? 'not-allowed' : 'pointer',
          background: bgColor,
          transition: 'all 0.2s',
          outline: 'none',
        }}
      >
        <input {...getInputProps()} />

        {state === 'idle' && (
          <div className="animate-fade-in">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(30,179,255,0.08)', border: '1px solid rgba(30,179,255,0.2)' }}>
              <Upload size={24} style={{ color: '#1eb3ff' }} />
            </div>
            <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              {isDragActive ? 'Drop it here' : 'Drag & drop your document'}
            </p>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              or click to browse files
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
              PDF, DOC, DOCX, TXT · Max 20MB
            </p>
          </div>
        )}

        {state === 'uploading' && (
          <div className="animate-fade-in">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(30,179,255,0.08)', border: '1px solid rgba(30,179,255,0.2)' }}>
              <Loader2 size={24} style={{ color: '#1eb3ff' }} className="animate-spin" />
            </div>
            <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Uploading {fileName}
            </p>
            <p className="text-sm mb-4" style={{ color: '#1eb3ff' }}>{progress}%</p>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, maxWidth: 280, margin: '0 auto' }}>
              <div style={{
                height: '100%', width: `${progress}%`, borderRadius: 2,
                background: 'linear-gradient(90deg, #1eb3ff, #0078d4)',
                transition: 'width 0.3s ease-out',
                boxShadow: '0 0 12px rgba(30,179,255,0.4)',
              }} />
            </div>
          </div>
        )}

        {state === 'success' && (
          <div className="animate-fade-in">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <CheckCircle size={24} style={{ color: '#10b981' }} />
            </div>
            <p className="font-medium" style={{ color: '#10b981' }}>Upload complete!</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Analysis is running in the background
            </p>
          </div>
        )}

        {state === 'error' && (
          <div className="animate-fade-in">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertCircle size={24} style={{ color: '#ef4444' }} />
            </div>
            <p className="font-medium mb-1" style={{ color: '#ef4444' }}>Upload failed</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <button className="btn-ghost mt-3 text-xs" onClick={(e) => { e.stopPropagation(); setState('idle'); }}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
