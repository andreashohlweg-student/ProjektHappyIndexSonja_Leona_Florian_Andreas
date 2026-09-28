import {useEffect,useState} from 'react';
import type {CountriesData,DatasetMetadata,YearsData} from '@happiness/contracts';
import {useApi} from './api';
import {Icon,Status} from './components';
import {Overview} from './pages/Overview';
import {History} from './pages/History';
import {Compare} from './pages/Compare';
import {Trends} from './pages/Trends';
import {Source} from './pages/Source';
const pages=[{id:'overview',name:'Überblick'},{id:'history',name:'Länderverlauf'},{id:'compare',name:'Ländervergleich'},{id:'trends',name:'Veränderungen'},{id:'source',name:'Daten & Methodik'}];
const currentPage=()=>pages.some(p=>p.id===location.hash.slice(1))?location.hash.slice(1):'overview';
export function App() {
  const [page,setPage]=useState(currentPage),[year,setYear]=useState(2025),[country,setCountry]=useState('germany');
  const countries=useApi<CountriesData>('/countries'),years=useApi<YearsData>('/years'),meta=useApi<DatasetMetadata>('/meta');
  useEffect(()=>{const changed=()=>{setPage(currentPage());window.scrollTo({top:0});};window.addEventListener('hashchange',changed);return()=>window.removeEventListener('hashchange',changed);},[]);
  useEffect(()=>{if(years.result && !years.result.data.years.includes(year))setYear(years.result.data.latest);},[years.result,year]);
  const showCountry=(id:string)=>{setCountry(id);location.hash='history';};
  const ready=countries.result&&years.result&&meta.result;
  return <div className="app"><a href="#main-content" className="skip-link" onClick={e=>{e.preventDefault();document.getElementById('main-content')?.focus();}}>Zum Inhalt springen</a><aside className="sidebar"><a className="brand" href="#overview"><span className="brand-symbol">h<span>·</span></span><span>HEALTH &<br/>SOCIETY<span className="brand-sub">DATA JOURNAL</span></span></a><div className="sidebar-label">HAPPINESS ATLAS</div><nav aria-label="Hauptnavigation">{pages.map(p=><a href={`#${p.id}`} key={p.id} aria-current={page===p.id?'page':undefined} className={page===p.id?'active':''}><Icon name={p.id}/>{p.name}{page===p.id&&<span className="nav-dot"/>}</a>)}</nav><div className="sidebar-bottom"><span className="edition">2026</span><p>Eine Welt voller<br/>Perspektiven.</p><span>World Happiness Report</span></div></aside><div className="workspace"><header className="topbar"><div><span className="breadcrumb">Happiness Atlas</span><span className="slash">/</span><span>{pages.find(p=>p.id===page)?.name}</span></div><a href="#source" className="edition-badge"><span/> DATENSTAND · WHR 2026</a></header><main id="main-content" tabIndex={-1}>
    {!ready&&<Status loading={countries.loading||years.loading||meta.loading} error={countries.error??years.error??meta.error} retry={()=>{countries.retry();years.retry();meta.retry();}}/>}
    {ready&&<>{page==='overview'&&<Overview years={years.result!.data.years} year={year} onYear={setYear} onCountry={showCountry}/>} {page==='history'&&<History countries={countries.result!.data.countries} countryId={country} onCountry={setCountry}/>} {page==='compare'&&<Compare countries={countries.result!.data.countries} years={years.result!.data.years} year={year} onYear={setYear}/>} {page==='trends'&&<Trends years={years.result!.data.years} onCountry={showCountry}/>} {page==='source'&&<Source meta={meta.result!.data}/>}</>}
    <footer><span>HEALTH & SOCIETY <b>·</b> HAPPINESS ATLAS</span><span>Quelle: World Happiness Report 2026 <a href="#source">Daten verstehen ↗</a></span></footer>
  </main></div></div>;
}
