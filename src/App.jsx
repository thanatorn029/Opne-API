import { useState, useRef, useEffect } from "react";
import { MessageCircle, Sparkles, Send, Trash2, RefreshCw, CheckCircle, Inbox, Zap, ChevronDown, X } from "lucide-react";

const MOCK_COMMENTS = [
  { id: 1, author: "คุณมินนี่", text: "สินค้าส่งมาช้ามาก สั่งไป 2 อาทิตย์แล้วยังไม่ได้เลย!!!", status: "pending", sentiment: null, draft: null },
  { id: 2, author: "คุณนิด", text: "ของดีมากเลยค่ะ คุ้มมากๆ แอดมินตอบไวด้วย ขอบคุณนะคะ 💕", status: "pending", sentiment: null, draft: null },
  { id: 3, author: "คุณปอ", text: "สั่งครั้งแรก ยังไม่แน่ใจว่าสินค้าตรงปกไหม รอดูก่อนนะคะ", status: "pending", sentiment: null, draft: null },
  { id: 4, author: "คุณบอส", text: "ทำไมราคาขึ้นอีกแล้ว เดือนที่แล้วราคาต่างกันมากเลยนะ", status: "pending", sentiment: null, draft: null },
  { id: 5, author: "คุณฝน", text: "ได้รับของแล้วค่า แพ็คมาดีมากเลย ไม่มีรอยชำรุดเลยสักนิด ประทับใจมากค่า", status: "pending", sentiment: null, draft: null },
];

const SENTIMENT_CONFIG = {
  Positive: { bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7", icon: "😊" },
  Negative: { bg: "#FFE4E6", text: "#9F1239", border: "#FDA4AF", icon: "😤" },
  Neutral:  { bg: "#F1F5F9", text: "#334155", border: "#CBD5E1", icon: "😐" },
};

async function callClaude(commentText) {
  const systemPrompt = `คุณคือ AI ผู้ช่วยแอดมินร้านขายของออนไลน์ วิเคราะห์ sentiment และร่างคำตอบภาษาไทยที่สุภาพเป็นกันเอง

ตอบกลับในรูปแบบ JSON เท่านั้น ห้ามมีข้อความอื่น:
{
  "sentiment": "Positive" หรือ "Negative" หรือ "Neutral",
  "reason": "เหตุผลสั้นๆ ว่าทำไมถึงวิเคราะห์แบบนี้ (1 ประโยค)",
  "draft": "ข้อความตอบกลับที่ร่างไว้สำหรับแอดมิน สุภาพ เป็นกันเอง และเหมาะสม"
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: `คอมเมนต์จากลูกค้า: "${commentText}"` }],
    }),
  });

  const data = await res.json();
  const raw = data.content?.map(b => b.text || "").join("").trim();
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

function SentimentBadge({ sentiment }) {
  if (!sentiment) return (
    <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "#F8FAFC", color: "#94A3B8", border: "1px solid #E2E8F0" }}>NEW</span>
  );
  const cfg = SENTIMENT_CONFIG[sentiment];
  return (
    <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, letterSpacing: "0.04em" }}>
      {cfg.icon} {sentiment.toUpperCase()}
    </span>
  );
}

function PulsingDot() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EC4899", animation: "pulse 1.2s ease-in-out infinite", display: "inline-block" }} />
      <span style={{ fontSize: 13, color: "#BE185D", fontWeight: 500 }}>AI กำลังวิเคราะห์...</span>
    </span>
  );
}

export default function App() {
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [selectedId, setSelectedId] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [editedDraft, setEditedDraft] = useState("");
  const [toast, setToast] = useState(null);
  const textareaRef = useRef(null);

  const selected = comments.find(c => c.id === selectedId);

  useEffect(() => {
    if (selected?.draft) setEditedDraft(selected.draft);
    else setEditedDraft("");
  }, [selectedId]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelect = async (id) => {
    setSelectedId(id);
    const c = comments.find(x => x.id === id);
    if (!c || c.sentiment || c.status === "replied") return;

    setAnalyzing(true);
    try {
      const result = await callClaude(c.text);
      setComments(prev => prev.map(x => x.id === id ? { ...x, sentiment: result.sentiment, draft: result.draft, reason: result.reason } : x));
      setEditedDraft(result.draft);
      showToast("AI วิเคราะห์เสร็จแล้ว ✨");
    } catch {
      showToast("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRegenerate = async () => {
    if (!selected) return;
    setAnalyzing(true);
    try {
      const result = await callClaude(selected.text);
      setComments(prev => prev.map(x => x.id === selectedId ? { ...x, sentiment: result.sentiment, draft: result.draft, reason: result.reason } : x));
      setEditedDraft(result.draft);
      showToast("ร่างใหม่เรียบร้อย 🔄");
    } catch {
      showToast("เกิดข้อผิดพลาด", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApprove = () => {
    if (!editedDraft.trim()) return;
    setComments(prev => prev.map(x => x.id === selectedId ? { ...x, status: "replied", draft: editedDraft } : x));
    showToast("ส่งข้อความตอบกลับแล้ว ✅");
    setSelectedId(null);
  };

  const handleClear = () => {
    setComments(MOCK_COMMENTS.map(c => ({ ...c, sentiment: null, draft: null, reason: null, status: "pending" })));
    setSelectedId(null);
    showToast("รีเซ็ตข้อมูลแล้ว");
  };

  const pending = comments.filter(c => c.status === "pending").length;
  const replied = comments.filter(c => c.status === "replied").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sarabun', sans-serif; background: linear-gradient(135deg, #FFF1F2 0%, #FCE7F3 50%, #EDE9FE 100%); min-height: 100vh; }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(1.5); } }
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes toastIn { from { opacity:0; transform:translateX(100%); } to { opacity:1; transform:translateX(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .comment-row { transition: all .18s ease; border-radius: 12px; cursor: pointer; }
        .comment-row:hover { background: rgba(255,255,255,0.7) !important; transform: translateX(2px); }
        .comment-row.active { background: rgba(255,255,255,0.95) !important; border-left: 3px solid #EC4899 !important; box-shadow: 0 2px 16px rgba(236,72,153,0.12); }
        textarea { font-family: 'Sarabun', sans-serif; }
        textarea:focus { outline: none; border-color: #EC4899 !important; box-shadow: 0 0 0 3px rgba(236,72,153,0.12); }
        .btn-pink { background: linear-gradient(135deg,#EC4899,#F43F5E); color:#fff; border:none; border-radius:999px; padding: 10px 24px; font-family:'Sarabun',sans-serif; font-size:14px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px; transition:all .2s; box-shadow:0 4px 14px rgba(236,72,153,0.3); }
        .btn-pink:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 20px rgba(236,72,153,0.4); }
        .btn-pink:disabled { background:#CBD5E1; box-shadow:none; cursor:not-allowed; }
        .btn-ghost { background:rgba(255,255,255,0.8); color:#64748B; border:1px solid #E2E8F0; border-radius:999px; padding:8px 18px; font-family:'Sarabun',sans-serif; font-size:13px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:all .2s; }
        .btn-ghost:hover { background:#fff; border-color:#CBD5E1; }
        .spinner { width:20px; height:20px; border:2.5px solid rgba(236,72,153,0.3); border-top-color:#EC4899; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; }
      `}</style>

      {toast && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:9999, background: toast.type==="error" ? "#FEE2E2" : "#D1FAE5", color: toast.type==="error" ? "#991B1B" : "#065F46", padding:"12px 20px", borderRadius:12, fontWeight:600, fontSize:14, animation:"toastIn .3s ease", boxShadow:"0 4px 20px rgba(0,0,0,0.1)", border:`1px solid ${toast.type==="error" ? "#FDA4AF" : "#6EE7B7"}` }}>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"2rem 1.5rem", minHeight:"100vh", display:"flex", flexDirection:"column", gap:"1.5rem" }}>
        
        {/* Header */}
        <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ background:"linear-gradient(135deg,#EC4899,#8B5CF6)", borderRadius:14, width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Sparkles size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize:22, fontWeight:800, color:"#BE185D", lineHeight:1.2 }}>AI Sentiment & Auto-Reply</h1>
              <p style={{ fontSize:13, color:"#9D174D", fontWeight:500 }}>ระบบวิเคราะห์อารมณ์ลูกค้าและร่างคำตอบอัตโนมัติ</p>
            </div>
          </div>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <div style={{ display:"flex", gap:8 }}>
              <span style={{ background:"#FFE4E6", color:"#9F1239", padding:"4px 14px", borderRadius:999, fontSize:12, fontWeight:700 }}>⏳ {pending} รอดำเนินการ</span>
              <span style={{ background:"#D1FAE5", color:"#065F46", padding:"4px 14px", borderRadius:999, fontSize:12, fontWeight:700 }}>✅ {replied} ตอบแล้ว</span>
            </div>
            <button className="btn-ghost" onClick={handleClear}><Trash2 size={14} /> รีเซ็ต</button>
          </div>
        </header>

        {/* Main grid */}
        <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:"1.5rem", flex:1 }}>
          
          {/* Left: Comment list */}
          <div style={{ background:"rgba(255,255,255,0.6)", backdropFilter:"blur(16px)", borderRadius:20, border:"1px solid rgba(255,255,255,0.8)", overflow:"hidden", boxShadow:"0 8px 32px rgba(236,72,153,0.08)" }}>
            <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.6)", background:"rgba(255,255,255,0.3)", display:"flex", alignItems:"center", gap:8 }}>
              <Inbox size={18} color="#BE185D" />
              <span style={{ fontWeight:800, fontSize:15, color:"#BE185D" }}>กล่องข้อความ</span>
              <span style={{ marginLeft:"auto", background:"#FBCFE8", color:"#9D174D", borderRadius:999, fontSize:11, fontWeight:700, padding:"2px 8px" }}>{comments.length}</span>
            </div>
            <div style={{ padding:12, display:"flex", flexDirection:"column", gap:6, overflowY:"auto", maxHeight:"calc(100vh - 220px)" }}>
              {comments.map(c => (
                <div key={c.id}
                  className={`comment-row ${selectedId===c.id ? "active" : ""}`}
                  onClick={() => handleSelect(c.id)}
                  style={{ padding:"12px 14px", border:"1px solid rgba(255,255,255,0.4)", borderLeft: selectedId===c.id ? "3px solid #EC4899" : "1px solid rgba(255,255,255,0.4)", opacity: c.status==="replied" ? 0.65 : 1, background: selectedId===c.id ? "rgba(255,255,255,0.95)" : "transparent" }}
                >
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#FBCFE8,#DDD6FE)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#BE185D" }}>
                        {c.author[3] || "?"}
                      </div>
                      <span style={{ fontSize:13, fontWeight:700, color:"#4C1D95" }}>{c.author}</span>
                    </div>
                    {c.status==="replied" ? (
                      <span style={{ padding:"2px 8px", borderRadius:999, fontSize:10, fontWeight:700, background:"#DBEAFE", color:"#1E40AF", border:"1px solid #BFDBFE" }}>ส่งแล้ว</span>
                    ) : (
                      <SentimentBadge sentiment={c.sentiment} />
                    )}
                  </div>
                  <p style={{ fontSize:12.5, color:"#831843", lineHeight:1.5, overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                    "{c.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Workspace */}
          <div style={{ background:"rgba(255,255,255,0.65)", backdropFilter:"blur(16px)", borderRadius:20, border:"1px solid rgba(255,255,255,0.8)", overflow:"hidden", boxShadow:"0 8px 32px rgba(236,72,153,0.08)", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"16px 24px", borderBottom:"1px solid rgba(255,255,255,0.6)", background:"rgba(255,255,255,0.3)", display:"flex", alignItems:"center", gap:8 }}>
              <Zap size={18} color="#BE185D" />
              <span style={{ fontWeight:800, fontSize:15, color:"#BE185D" }}>AI Workspace</span>
            </div>

            <div style={{ flex:1, padding:"2rem", display:"flex", flexDirection:"column", gap:"1.5rem", overflowY:"auto" }}>
              
              {!selected && (
                <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, color:"#C4B5FD", textAlign:"center", padding:"4rem 2rem", animation:"fadeSlideIn .4s ease" }}>
                  <MessageCircle size={56} strokeWidth={1.2} />
                  <div>
                    <p style={{ fontSize:17, fontWeight:600, color:"#9D174D", marginBottom:4 }}>เลือกคอมเมนต์จากกล่องข้อความ</p>
                    <p style={{ fontSize:13.5, color:"#BE185D", opacity:0.7 }}>AI จะวิเคราะห์อารมณ์และร่างคำตอบให้อัตโนมัติ</p>
                  </div>
                </div>
              )}

              {selected && selected.status === "replied" && (
                <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, animation:"fadeSlideIn .4s ease" }}>
                  <CheckCircle size={56} color="#10B981" strokeWidth={1.5} />
                  <h3 style={{ color:"#065F46", fontWeight:700, fontSize:18 }}>ส่งข้อความตอบกลับแล้ว</h3>
                  <div style={{ background:"#D1FAE5", border:"1px solid #6EE7B7", borderRadius:16, padding:"16px 24px", maxWidth:480, textAlign:"center" }}>
                    <p style={{ color:"#065F46", fontSize:14.5, lineHeight:1.6 }}>{selected.draft}</p>
                  </div>
                </div>
              )}

              {selected && selected.status !== "replied" && (
                <div style={{ animation:"fadeSlideIn .35s ease", display:"flex", flexDirection:"column", gap:"1.5rem" }}>
                  
                  {/* Original comment */}
                  <div style={{ background:"rgba(255,255,255,0.7)", border:"1px solid #FCE7F3", borderRadius:14, padding:"16px 20px" }}>
                    <p style={{ fontSize:11.5, fontWeight:700, color:"#9D174D", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>💬 คอมเมนต์จากลูกค้า</p>
                    <p style={{ fontStyle:"italic", color:"#4C1D95", fontSize:15, lineHeight:1.65 }}>"{selected.text}"</p>
                    <div style={{ marginTop:8, fontSize:12, color:"#BE185D", fontWeight:600 }}>— {selected.author}</div>
                  </div>

                  {/* Analyzing state */}
                  {analyzing && (
                    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"20px 24px", background:"#FFF1F2", borderRadius:14, border:"1px dashed #FBCFE8" }}>
                      <div className="spinner" />
                      <PulsingDot />
                    </div>
                  )}

                  {/* Sentiment result */}
                  {selected.sentiment && !analyzing && (
                    <>
                      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 20px", background: SENTIMENT_CONFIG[selected.sentiment].bg, borderRadius:14, border:`1px solid ${SENTIMENT_CONFIG[selected.sentiment].border}` }}>
                        <span style={{ fontSize:24 }}>{SENTIMENT_CONFIG[selected.sentiment].icon}</span>
                        <div>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <span style={{ fontSize:13, fontWeight:600, color:"#9D174D" }}>ผลวิเคราะห์ Sentiment:</span>
                            <SentimentBadge sentiment={selected.sentiment} />
                          </div>
                          {selected.reason && (
                            <p style={{ fontSize:13, color:"#64748B", marginTop:4, lineHeight:1.5 }}>{selected.reason}</p>
                          )}
                        </div>
                      </div>

                      {/* Draft reply editor */}
                      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                        <label style={{ fontSize:13, fontWeight:700, color:"#BE185D", display:"flex", alignItems:"center", gap:6 }}>
                          <Sparkles size={15} /> AI Draft Reply (แก้ไขได้ก่อนส่ง)
                        </label>
                        <textarea
                          ref={textareaRef}
                          value={editedDraft}
                          onChange={e => setEditedDraft(e.target.value)}
                          rows={5}
                          style={{ width:"100%", padding:"14px 16px", borderRadius:14, border:"1.5px solid #FBCFE8", fontSize:14.5, color:"#4C1D95", lineHeight:1.65, resize:"vertical", background:"rgba(255,255,255,0.8)" }}
                        />
                      </div>

                      {/* Action buttons */}
                      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", flexWrap:"wrap" }}>
                        <button className="btn-ghost" onClick={handleRegenerate} disabled={analyzing}>
                          <RefreshCw size={14} /> ร่างใหม่
                        </button>
                        <button className="btn-pink" onClick={handleApprove} disabled={!editedDraft.trim()}>
                          <Send size={15} /> ยืนยันส่งข้อความ
                        </button>
                      </div>
                    </>
                  )}

                  {/* Not yet analyzed — prompt to click */}
                  {!selected.sentiment && !analyzing && (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, padding:"2rem", background:"rgba(255,255,255,0.5)", borderRadius:16, textAlign:"center" }}>
                      <div className="spinner" style={{ width:32, height:32, borderWidth:3 }} />
                      <p style={{ color:"#9D174D", fontSize:14 }}>กำลังโหลด AI...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}