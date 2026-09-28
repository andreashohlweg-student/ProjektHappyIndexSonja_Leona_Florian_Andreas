import {useEffect,useState} from 'react';
import type {ApiResponse,ApiError} from '@happiness/contracts';
export async function request<T>(path:string, signal?:AbortSignal):Promise<ApiResponse<T>> {
  const response=await fetch(`/api${path}`,{signal});
  if(!response.ok) {
    const body=await response.json().catch(()=>null) as ApiError|null;
    throw new Error(body?.error?.message ?? `Die API ist gerade nicht erreichbar (${response.status}).`);
  }
  return response.json();
}
export function useApi<T>(path:string) {
  const [result,setResult]=useState<ApiResponse<T>|null>(null);
  const [error,setError]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    setLoading(true);setError(null);
    request<T>(path,controller.signal).then(r=>{if(!controller.signal.aborted)setResult(r);})
      .catch(e=>{if(!controller.signal.aborted){setResult(null);setError(e instanceof Error?e.message:'Unbekannter Fehler');}})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return ()=>controller.abort();
  },[path,attempt]);
  return {result,error,loading,retry:()=>setAttempt(n=>n+1)};
}
export function useDebounce(value:string,delay=250) {
  const [debounced,setDebounced]=useState(value);
  useEffect(()=>{const timer=setTimeout(()=>setDebounced(value),delay);return()=>clearTimeout(timer);},[value,delay]);
  return debounced;
}
