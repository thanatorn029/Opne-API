import { useState, useEffect } from 'react';
import { Bot, Send, UserCheck, Loader2 } from 'lucide-react';

export default function ReplyWorkspace({ comment, isAnalyzing, onAnalyze, onApprove }) {
  const [editedReply, setEditedReply] = useState('');

  // Update local state when draft changes
  useEffect(() => {
    if (comment && comment.draft) {
      setEditedReply(comment.draft);
    } else {
      setEditedReply('');
    }
  }, [comment]);

  if (!comment) {
    return (
      <div className="workspace-empty">
        <Bot size={48} />
        <p>คลิกเลือกคอมเมนต์จากช่อง Input (ด้านซ้าย) เพื่อให้ AI เริ่มประมวลผลวิเคราะห์อารมณ์และร่างคำตอบอัตโนมัติ</p>
      </div>
    );
  }

  if (comment.status === 'replied') {
    return (
      <div className="workspace-empty">
        <UserCheck size={48} style={{ color: '#10B981' }} />
        <h3 style={{ color: '#10B981', fontWeight: 600 }}>พนักงานยืนยันส่งข้อความแล้ว (Output)</h3>
        <p>ข้อความ: {comment.draft}</p>
      </div>
    );
  }

  return (
    <div className="analysis-section">
      <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>คอมเมนต์จากลูกค้า</p>
        <p style={{ fontStyle: 'italic', color: '#0F172A' }}>"{comment.text}"</p>
      </div>

      {!comment.sentiment && !isAnalyzing && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', margin: '2rem 0' }}>
          <button 
            className="button btn-primary" 
            style={{ padding: '1rem 2rem', fontSize: '1rem' }}
            onClick={() => onAnalyze(comment.text)}
          >
            <Bot size={24} /> ส่งให้ AI Engine วิเคราะห์ & ร่างคำตอบ
          </button>
        </div>
      )}

      {isAnalyzing && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
          <Loader2 className="loading-spinner" size={32} color="var(--primary-color)" />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>AI กำลังวิเคราะห์อารมณ์และร่างคำตอบ...</p>
        </div>
      )}

      {comment.sentiment && !isAnalyzing && (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>ผลการวิเคราะห์อารมณ์ (Sentiment):</span>
            <span className={`sentiment-badge ${comment.sentiment.toLowerCase()}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
              {comment.sentiment}
            </span>
          </div>

          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <Bot size={20} /> AI Draft Reply (พื้นที่ให้พนักงานตรวจสอบและแก้ไข)
            </label>
            <textarea 
              className="reply-textarea"
              style={{ fontSize: '1rem', padding: '1rem' }}
              value={editedReply}
              onChange={(e) => setEditedReply(e.target.value)}
              placeholder="ข้อความร่างจาก AI จะแสดงที่นี่..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button className="button btn-secondary" onClick={() => onAnalyze(comment.text)}>
              ร่างคำตอบใหม่ (Regenerate)
            </button>
            <button 
              className="button btn-primary" 
              onClick={() => onApprove(editedReply)}
              disabled={!editedReply.trim()}
            >
              <Send size={18} /> กดยืนยันการส่ง (Output)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
