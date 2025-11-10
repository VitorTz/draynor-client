import { useState } from 'react';
import { Bug, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { draynorApi } from '../api/draynor';
import './BugReport.css';
import type { BugType } from '../types';


const BugReport = () => {

  const [title, setTitle] = useState('');
  const [bugType, setBugType] = useState<BugType>('Other');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const bugTypes: BugType[] = [
    'UI', 
    'Backend', 
    'Performance', 
    'Security', 
    'Database',
    'Network', 
    'Crash', 
    'Logic', 
    'Compatibility', 
    'Other'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !bugType) {
      setErrorMessage('Por favor, preencha o título e selecione o tipo de bug.');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      await draynorApi.bugs.reportBug(
        title.trim(),
        bugType,
        description.trim() || undefined
      );

      setSubmitStatus('success');
      setTitle('');
      setBugType('Other');
      setDescription('');

      setTimeout(() => { setSubmitStatus('idle'); }, 5000);
    } catch (error: any) {
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Erro ao enviar relatório. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bug-report-page">
      <div className="bug-report-container">
        <div className="bug-report-header">
          <div className="bug-report-icon">
            <Bug size={32} />
          </div>
          <h1>Bug Report</h1>
          <p>Found a problem? Help us improve by reporting bugs!</p>
        </div>

        <form className="bug-report-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Describe the bug briefly..."
              maxLength={100}
              disabled={isSubmitting}
              required
            />
            <span className="char-count">{title.length}/100</span>
          </div>

          <div className="form-group">
            <label htmlFor="bug-type">
              Bug Type <span className="required">*</span>
            </label>
            <select
              id="bug-type"
              value={bugType}
              onChange={(e) => setBugType(e.target.value as BugType)}
              disabled={isSubmitting}
              required
            >
              <option value="">Select...</option>
              {bugTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o bug em detalhes, como reproduzi-lo, o que esperava acontecer, etc..."
              rows={8}
              maxLength={1000}
              disabled={isSubmitting}
            />
            <span className="char-count">{description.length}/1000</span>
          </div>

          {submitStatus === 'success' && (
            <div className="alert alert-success">
              <CheckCircle size={20} />
              <span>Bug reported successfully! Thank you for your contribution.</span>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                Sending...
              </>
            ) : (
              <>
                <Send size={20} />
                Send
              </>
            )}
          </button>
        </form>

        <div className="bug-report-footer">
          <p className="footer-note">
           <strong>Tip:</strong> The more details you provide, the easier it will be for us to fix the issue!
          </p>
        </div>
      </div>
    </div>
  );
};

export default BugReport;