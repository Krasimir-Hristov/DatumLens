import { UploadZone } from '@/components/upload-zone';
import { FileText, MessageSquare, Quote, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className='relative flex min-h-screen flex-col items-center justify-center p-6 md:p-12 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      {/* Animated Background Blobs */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse' />
        <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000' />
      </div>

      {/* Navigation Bar */}
      <div className='relative z-10 w-full max-w-6xl mb-12 animate-in fade-in slide-in-from-top-4 duration-700'>
        <div className='flex items-center justify-between p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm'>
          <div className='flex items-center gap-2'>
            <div className='h-2 w-2 rounded-full bg-blue-500 animate-pulse' />
            <span className='text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400'>
              DatumLens
            </span>
            <span className='ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600 ring-1 ring-inset ring-blue-600/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/20'>
              v1.0
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-slate-500 dark:text-slate-400'>
              Powered by
            </span>
            <Sparkles className='h-4 w-4 text-yellow-500' />
            <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
              AI
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000'>
        {/* Hero Section */}
        <div className='space-y-6'>
          <div className='inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-600 ring-1 ring-inset ring-blue-600/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/20'>
            <Sparkles className='h-4 w-4' />
            RAG-Powered Document Intelligence
          </div>

          <h1 className='text-5xl md:text-7xl font-extrabold tracking-tight leading-tight'>
            <span className='bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-slate-100 dark:via-blue-400 dark:to-slate-100'>
              Your Documents,
            </span>
            <br />
            <span className='bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400'>
              Now Conversational
            </span>
          </h1>

          <p className='text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed'>
            Transform your PDFs into an intelligent knowledge base.
            <br />
            Ask questions in natural language and get precise, cited answers
            instantly.
          </p>
        </div>

        {/* Upload Zone */}
        <div className='w-full max-w-xl'>
          <UploadZone />
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl pt-8'>
          <FeatureCard
            icon={<FileText className='h-6 w-6' />}
            title='Smart Indexing'
            description='AI analyzes and chunks your documents semantically for optimal retrieval accuracy.'
            gradient='from-blue-500 to-cyan-500'
          />
          <FeatureCard
            icon={<MessageSquare className='h-6 w-6' />}
            title='Natural Conversations'
            description='Ask follow-up questions with full context awareness in any language.'
            gradient='from-indigo-500 to-purple-500'
          />
          <FeatureCard
            icon={<Quote className='h-6 w-6' />}
            title='Source Citations'
            description='Every answer includes exact page references and document sources.'
            gradient='from-violet-500 to-pink-500'
          />
        </div>
      </div>

      {/* Footer */}
      <div className='relative z-10 mt-auto pt-12 text-center'>
        <p className='text-sm text-slate-400 dark:text-slate-500'>
          Built with Next.js, FastAPI, and Google Gemini
        </p>
      </div>
    </main>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

function FeatureCard({ icon, title, description, gradient }: FeatureCardProps) {
  return (
    <div className='group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900/50 hover:border-blue-300 dark:hover:border-blue-700'>
      {/* Gradient Overlay on Hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity group-hover:opacity-5`}
      />

      <div className='relative space-y-4'>
        {/* Icon */}
        <div
          className={`inline-flex rounded-xl bg-gradient-to-br ${gradient} p-3 text-white shadow-lg ring-1 ring-white/10`}
        >
          {icon}
        </div>

        {/* Content */}
        <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
          {title}
        </h3>
        <p className='text-sm text-slate-500 dark:text-slate-400 leading-relaxed'>
          {description}
        </p>
      </div>
    </div>
  );
}
