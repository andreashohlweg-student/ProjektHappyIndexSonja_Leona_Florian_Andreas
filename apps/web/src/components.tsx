import type {ReactNode} from 'react';
import type {Country,DataSource,Observation} from '@happiness/contracts';
export const number=(value:number|null|undefined,digits=2)=>value==null?'—':value.toLocaleString('de-DE',{minimumFractionDigits:digits,maximumFractionDigits:digits});
export const signed=(value:number)=>`${value>0?'+':''}${number(value)}`;
export function Icon({name}:{name:string}) {
  const paths:Record<string,ReactNode>={
    overview:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    history:<><path d="M3 3v18h18M6 15l4-5 4 3 6-8"/></>,
    compare:<><path d="M5 4v16M19 4v16M9 8h6m-3-3 3 3-3 3M15 16H9m3-3-3 3 3 3"/></>,
    trends:<><path d="m3 17 6-6 4 4 8-10m-6 0h6v6"/></>,
    source:<><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/></>,
    search:<><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]??paths.overview}</svg>;
}
export function SourceBadge({source}:{source:DataSource}) {
  return <span className={`source-badge ${source==='postgres'?'live':''}`} title={source==='postgres'?'Antwort aus PostgreSQL':'Echte Quelldaten aus dem vorbereiteten Referenzadapter. Die SQL-Lernaufgabe für diesen Endpunkt ist noch offen.'}><i/>{source==='postgres'?'PostgreSQL':'Übungsmodus · Referenzdaten'}</span>;
}
export function Status({loading,error,retry}:{loading:boolean;error:string|null;retry:()=>void}) {
  if(error)return <div className="state error" role="alert"><strong>Die Daten konnten nicht geladen werden.</strong><p>{error}</p><button className="button" onClick={retry}>Erneut versuchen</button></div>;
  if(loading)return <div className="state loading" role="status"><span className="spinner"/>Daten werden geladen …</div>;
  return null;
}
export function YearSelect({years,value,onChange,label='Quellenjahr'}:{years:number[];value:number;onChange:(v:number)=>void;label?:string}) {
  return <label className="field"><span>{label}</span><select aria-label={label} value={value} onChange={e=>onChange(Number(e.target.value))}>{[...years].reverse().map(y=><option key={y} value={y}>{y}</option>)}</select></label>;
}
export function CountrySelect({countries,value,onChange,label}:{countries:Country[];value:string;onChange:(v:string)=>void;label:string}) {
  return <label className="field country-select"><span>{label}</span><select aria-label={label} value={value} onChange={e=>onChange(e.target.value)}>{countries.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>;
}
export function Stat({label,value,detail,accent=false}:{label:string;value:ReactNode;detail:ReactNode;accent?:boolean}) {
  return <article className={`stat ${accent?'accent':''}`}><span className="eyebrow">{label}</span><strong>{value}</strong><span className="stat-detail">{detail}</span></article>;
}
export function SectionTitle({kicker,title,children}:{kicker?:string;title:string;children?:ReactNode}) {
  return <div className="section-heading"><div>{kicker&&<span className="eyebrow">{kicker}</span>}<h2>{title}</h2></div>{children}</div>;
}
export function LineChart({series}:{series:{name:string;values:Observation[];color:string}[]}) {
  const all=series.flatMap(s=>s.values);
  if(!all.length)return <p className="state">Keine Beobachtungen vorhanden.</p>;
  const minYear=Math.min(...all.map(r=>r.year)),maxYear=Math.max(...all.map(r=>r.year));
  const low=Math.max(0,Math.floor(Math.min(...all.map(r=>r.score))-.3)),high=Math.min(10,Math.ceil(Math.max(...all.map(r=>r.score))+.3));
  const w=900,h=285,left=42,right=22,top=28,bottom=35;
  const x=(y:number)=>left+(y-minYear)/Math.max(1,maxYear-minYear)*(w-left-right);
  const y=(s:number)=>h-bottom-(s-low)/Math.max(1,high-low)*(h-top-bottom);
  const years=Array.from({length:maxYear-minYear+1},(_,i)=>minYear+i);
  return <div className="line-chart"><div className="legend">{series.map(s=><span key={s.name}><i style={{background:s.color}}/>{s.name}</span>)}<span className="muted">Score · 0 bis 10</span></div><svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Lebensbewertung nach Quellenjahr. Datenlücken werden nicht verbunden. Exakte Werte stehen in der Tabelle darunter.">
    {Array.from({length:high-low+1},(_,i)=>low+i).map(n=><g key={n}><line x1={left} x2={w-right} y1={y(n)} y2={y(n)} stroke="#e4e8e4"/><text x={left-14} y={y(n)+4} textAnchor="end">{n}</text></g>)}
    {years.map(yr=><text key={yr} x={x(yr)} y={h-9} textAnchor="middle">{yr}</text>)}
    {series.map(s=>{
      const rows=[...s.values].sort((a,b)=>a.year-b.year);
      let path='';rows.forEach((r,i)=>{path+=`${i===0 || r.year-rows[i-1].year>1?'M':'L'}${x(r.year)},${y(r.score)} `;});
      return <g key={s.name}><path d={path} fill="none" stroke={s.color} strokeWidth="3" strokeLinejoin="round"/>{rows.map(r=><circle key={r.year} cx={x(r.year)} cy={y(r.score)} r="4.8" fill={s.color} stroke="white" strokeWidth="2"><title>{`${s.name} · ${r.year}: ${number(r.score,3)}`}</title></circle>)}</g>;
    })}
  </svg><p className="chart-note">Quellenjahr · Mehrjahresmittel; Unterbrechungen zeigen fehlende Zeitstände. Die Achsenskalierung ist beschriftet.</p></div>;
}
