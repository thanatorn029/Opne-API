import { useState } from 'react';
import { Inbox, Sparkles, MessageCircle, Rocket, Loader2, Send, ClipboardList, Trash2 } from 'lucide-react';
import { analyzeAndReply } from './services/aiService';

function App() {
  const [commentText, setCommentText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [commentHistory, setCommentHistory] = useState([]);

  const handleAnalyze = async () => {
    if (!commentText.trim()) return;
    
    setErrorMsg('');
    setIsAnalyzing(true);
    setResult(null);
    
    // บันทึกข้อความลูกค้าที่พิมพ์มา
    setCommentHistory(prev => [{ 
      id: Date.now(), 
      text: commentText, 
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) 
    }, ...prev]);
    
    try {
      const res = await analyzeAndReply(commentText, 'สุภาพ เป็นกันเอง และให้ความช่วยเหลืออย่างดีที่สุด เป็นแอดมินร้านขายของออนไลน์');
      setResult(res);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header" style={{ marginBottom: '2rem', justifyContent: 'center' }}>
        <h1><Sparkles className="header-icon" size={28} /> AI Customer Sentiment & Auto-Reply</h1>
      </header>

      {errorMsg && (
        <div style={{ padding: '1rem', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '0.75rem', marginBottom: '2rem', textAlign: 'center' }}>
          {errorMsg}
        </div>
      )}

      <main className="dashboard-grid">
        {/* Left Card: Input */}
        <section className="card">
          <div className="card-header">
            <h2><Inbox size={20} /> กล่องข้อความจากลูกค้า</h2>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
            <textarea
              style={{
                width: '100%',
                height: '180px',
                padding: '1.5rem',
                borderRadius: '1rem',
                border: '1px solid var(--border-color)',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem',
                color: 'var(--text-main)',
                resize: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}
              placeholder="ตัวอย่าง: สินค้าส่งไวมาก แพ็คมาดี แอดมินตอบน่ารักค่ะ"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button 
                className="button btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={handleAnalyze}
                disabled={isAnalyzing || !commentText.trim()}
              >
                {isAnalyzing ? <Loader2 className="loading-spinner" size={18} /> : <Rocket size={18} />}
                Analyze & Draft Reply
              </button>
            </div>
          </div>
        </section>

        {/* Right Card: Output */}
        <section className="card">
          <div className="card-header">
            <h2><Sparkles size={20} /> ผลลัพธ์จาก AI</h2>
          </div>
          <div className="card-body" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {!isAnalyzing && !result && (
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', gap: '1rem' }}>
                <MessageCircle size={48} strokeWidth={1.5} />
                <p style={{ fontSize: '1.125rem' }}>รอการวิเคราะห์...</p>
              </div>
            )}

            {isAnalyzing && (
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', gap: '1rem' }}>
                <Loader2 className="loading-spinner" size={48} strokeWidth={1.5} />
                <p style={{ fontSize: '1.125rem' }}>AI กำลังวิเคราะห์อารมณ์และร่างคำตอบ...</p>
              </div>
            )}

            {result && !isAnalyzing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 600 }}>อารมณ์ของลูกค้า (Sentiment):</span>
                  <span className={`sentiment-badge ${result.sentiment.toLowerCase()}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                    {result.sentiment}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 600 }}>ข้อความร่างจาก AI (Draft Reply):</span>
                  <textarea
                    style={{
                      width: '100%',
                      height: '140px',
                      padding: '1.5rem',
                      borderRadius: '1rem',
                      border: '1px solid var(--primary-color)',
                      outline: 'none',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '1rem',
                      color: 'var(--text-main)',
                      resize: 'none',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                    }}
                    value={result.draftReply}
                    onChange={(e) => setResult({...result, draftReply: e.target.value})}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button className="button btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.4)' }} onClick={() => alert('ส่งข้อความตอบกลับเรียบร้อยแล้ว!')}>
                    <Send size={18} /> ยืนยันการตอบกลับ
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </section>
      </main>

      {/* Customer Comment History */}
      {commentHistory.length > 0 && (
        <section className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2><ClipboardList size={20} /> ประวัติข้อความจากลูกค้า ({commentHistory.length})</h2>
            <button 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', backgroundColor: '#FECACA', color: '#B91C1C', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'Inter' }}
              onClick={() => setCommentHistory([])}
            >
              <Trash2 size={14} /> ล้าง
            </button>
          </div>
          <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {commentHistory.map((item) => (
              <div key={item.id} style={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(255,255,255,0.5)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(236, 72, 153, 0.1)'
              }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap', marginTop: '2px' }}>{item.time}</span>
                <p style={{ margin: 0, color: 'var(--text-main)', lineHeight: 1.5 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
