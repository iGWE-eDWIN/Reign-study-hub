'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main id="main" className="container py-24"><h1 className="text-3xl">We couldn’t load this page.</h1><p className="mt-4 text-slate-500">Please try again or contact reignstudyabroad@gmail.com.</p><button className="btn mt-6" onClick={reset}>Try again</button></main>}
