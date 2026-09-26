import React from 'react';
import { Activity, Trash2, CheckCircle2, XCircle, Info } from 'lucide-react';

export interface LogEvent {
  id: string;
  type: 'onSuccess' | 'onClose' | 'onError' | 'onReady';
  timestamp: string;
  payload: Record<string, unknown>;
}

interface EventInspectorProps {
  logs: LogEvent[];
  onClear: () => void;
}

export const EventInspector: React.FC<EventInspectorProps> = ({ logs, onClear }) => {
  const getBadgeClass = (type: LogEvent['type']) => {
    switch (type) {
      case 'onSuccess':
        return 'event-success';
      case 'onError':
        return 'event-error';
      case 'onClose':
        return 'event-close';
      default:
        return 'event-ready';
    }
  };

  const getIcon = (type: LogEvent['type']) => {
    switch (type) {
      case 'onSuccess':
        return <CheckCircle2 size={13} color="#10b981" />;
      case 'onError':
        return <XCircle size={13} color="#f43f5e" />;
      default:
        return <Info size={13} color="#6366f1" />;
    }
  };

  return (
    <div className="panel-box">
      <div className="panel-header">
        <div className="panel-title">
          <Activity size={16} color="#6366f1" />
          <span>SDK Callback Events ({logs.length})</span>
        </div>
        {logs.length > 0 && (
          <button type="button" className="clear-btn" onClick={onClear} title="Clear logs">
            <Trash2 size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Clear
          </button>
        )}
      </div>

      <div className="event-logs-list">
        {logs.length === 0 ? (
          <div className="empty-logs">
            No events fired yet. Click a "Buy" button to open checkout and inspect callbacks in real-time.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="log-entry">
              <div className="log-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {getIcon(log.type)}
                  <span className={`event-badge ${getBadgeClass(log.type)}`}>{log.type}()</span>
                </div>
                <span className="log-time">{log.timestamp}</span>
              </div>
              <pre className="log-payload">{JSON.stringify(log.payload, null, 2)}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
