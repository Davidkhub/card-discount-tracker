// 카드 할인 기록 - Supabase 저장소
const SUPABASE_URL = 'https://bufdwbsxcbzgewlbodco.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1ZmR3YnN4Y2J6Z2V3bGJvZGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4ODg3MjMsImV4cCI6MjA5OTQ2NDcyM30.G9SAVkB_7sI9VaUsTaHZaoYm8c-EQttRr_vfgC_uGXk';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DB row <-> JS entry 변환
function toDb(e){
  return {
    id: e.id,
    date: e.date,
    site: e.site,
    kind: e.kind,
    pay: e.pay || '결합없음',
    card: e.card,
    discount_rate: e.rate,
    discount_limit: e.limit || null,
    memo: e.memo || null
  };
}
function fromDb(r){
  return {
    id: r.id,
    date: r.date,
    site: r.site,
    kind: r.kind,
    pay: r.pay || '결합없음',
    card: r.card,
    rate: r.discount_rate,
    limit: r.discount_limit || '',
    memo: r.memo || ''
  };
}

const store = {
  async load(){
    const { data, error } = await sb.from('entries').select('*').order('date', { ascending: false });
    if(error){ console.error('불러오기 실패', error); return []; }
    return data.map(fromDb);
  },
  async add(entry){
    const { error } = await sb.from('entries').insert(toDb(entry));
    if(error){ console.error('저장 실패', error); return false; }
    return true;
  },
  async remove(id){
    const { error } = await sb.from('entries').delete().eq('id', id);
    if(error){ console.error('삭제 실패', error); return false; }
    return true;
  },
  async exportJson(){
    const list = await this.load();
    return JSON.stringify(list, null, 2);
  },
  async importJson(text){
    const arr = JSON.parse(text);
    if(!Array.isArray(arr)) throw new Error('잘못된 형식');
    const rows = arr.map(toDb);
    const { error } = await sb.from('entries').upsert(rows);
    if(error) throw error;
    return true;
  }
};

function escapeHtml(s){
  const d = document.createElement('div');
  d.textContent = (s === null || s === undefined) ? '' : String(s);
  return d.innerHTML;
}

function todayStr(){
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function showToast(msg){
  let t = document.querySelector('.toast');
  if(!t){
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._to);
  t._to = setTimeout(() => t.classList.remove('show'), 1800);
}
