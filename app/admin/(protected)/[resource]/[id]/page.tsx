import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { resources } from '@/lib/admin-config';
import { requireAdmin } from '@/lib/auth';
import { ContentEditor, SubmissionDetail } from '@/components/admin-editor';
export default async function Detail({params}:{params:Promise<{resource:string;id:string}>}){const{resource,id}=await params;const config=Object.hasOwn(resources,resource)?resources[resource]:undefined;if(!config||resource==='site_settings')notFound();const{client}=await requireAdmin();if(id==='new'){if(config.record)notFound();return <><Link href={`/admin/${resource}`} className="text-xs text-slate-500">← Back to {config.title.toLowerCase()}</Link><h1 className="mt-4 mb-8 text-3xl">Add {config.singular.toLowerCase()}</h1><ContentEditor resource={resource}/></>}
 if(!z.string().uuid().safeParse(id).success)notFound();const{data,error}=await client.from(resource).select('*').eq('id',id).single();if(error||!data)notFound();return <><Link href={`/admin/${resource}`} className="text-xs text-slate-500">← Back to {config.title.toLowerCase()}</Link><h1 className="mt-4 mb-3 text-3xl">{config.record?config.singular:`Edit ${config.singular.toLowerCase()}`}</h1>{config.record&&<p className="mb-7 font-mono text-xs text-slate-500">{data.reference}</p>}{config.record?<SubmissionDetail resource={resource} row={data}/>:<div className="mt-7"><ContentEditor resource={resource} initial={data}/></div>}</>}
