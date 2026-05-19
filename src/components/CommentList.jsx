import { MessageCircle } from 'lucide-react';

export default function CommentList({ comments, selectedId, onSelect }) {
  if (comments.length === 0) {
    return <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>ไม่มีคอมเมนต์ใหม่</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {comments.map((comment) => (
        <div 
          key={comment.id}
          className={`comment-item ${selectedId === comment.id ? 'selected' : ''}`}
          onClick={() => onSelect(comment.id)}
        >
          <div className="comment-header">
            <span className="comment-author" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageCircle size={16} /> {comment.author}
            </span>
            {comment.status === 'replied' ? (
              <span className="sentiment-badge neutral" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>
                ยืนยันส่งแล้ว
              </span>
            ) : comment.sentiment ? (
              <span className={`sentiment-badge ${comment.sentiment.toLowerCase()}`}>
                {comment.sentiment}
              </span>
            ) : (
              <span className="sentiment-badge neutral">
                New
              </span>
            )}
          </div>
          <p className="comment-text">"{comment.text}"</p>
        </div>
      ))}
    </div>
  );
}
