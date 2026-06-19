'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { BookOpen, Code, Terminal, Zap, Shield, Search, ChevronRight, ExternalLink } from 'lucide-react';
import { useState } from 'react';

const docsCategories = [
  { id: 'getting-started', label: 'Getting Started', icon: BookOpen, count: 5 },
  { id: 'api-reference', label: 'API Reference', icon: Code, count: 12 },
  { id: 'guides', label: 'Guides & Tutorials', icon: Terminal, count: 8 },
  { id: 'best-practices', label: 'Best Practices', icon: Zap, count: 6 },
  { id: 'security', label: 'Security', icon: Shield, count: 4 },
];

const docs = [
  {
    category: 'getting-started',
    title: 'Quick Start Guide',
    description: 'Get up and running with FreeModel in 5 minutes',
    readTime: '3 min',
    popular: true,
  },
  {
    category: 'getting-started',
    title: 'Authentication',
    description: 'How to authenticate your API requests securely',
    readTime: '4 min',
    popular: false,
  },
  {
    category: 'getting-started',
    title: 'Creating Your First API Key',
    description: 'Step-by-step guide to create and manage API keys',
    readTime: '2 min',
    popular: true,
  },
  {
    category: 'getting-started',
    title: 'Rate Limits',
    description: 'Understanding and working with rate limits',
    readTime: '5 min',
    popular: false,
  },
  {
    category: 'getting-started',
    title: 'Error Handling',
    description: 'Common errors and how to handle them',
    readTime: '6 min',
    popular: false,
  },
  {
    category: 'api-reference',
    title: 'Chat Completions API',
    description: 'Generate text completions with GPT models',
    readTime: '8 min',
    popular: true,
  },
  {
    category: 'api-reference',
    title: 'Embeddings API',
    description: 'Create vector embeddings for search and clustering',
    readTime: '6 min',
    popular: false,
  },
  {
    category: 'api-reference',
    title: 'Models API',
    description: 'List and retrieve available models',
    readTime: '3 min',
    popular: false,
  },
  {
    category: 'api-reference',
    title: 'Moderation API',
    description: 'Content moderation for safe outputs',
    readTime: '4 min',
    popular: false,
  },
  {
    category: 'guides',
    title: 'Building a Chatbot',
    description: 'Complete tutorial for building a chatbot',
    readTime: '15 min',
    popular: true,
  },
  {
    category: 'guides',
    title: 'Streaming Responses',
    description: 'Implement real-time streaming in your app',
    readTime: '10 min',
    popular: false,
  },
  {
    category: 'guides',
    title: 'Function Calling',
    description: 'Connect models to external tools and APIs',
    readTime: '12 min',
    popular: true,
  },
  {
    category: 'guides',
    title: 'Fine-tuning Guide',
    description: 'Customize models for your specific use case',
    readTime: '20 min',
    popular: false,
  },
  {
    category: 'best-practices',
    title: 'Prompt Engineering',
    description: 'Techniques for better model outputs',
    readTime: '10 min',
    popular: true,
  },
  {
    category: 'best-practices',
    title: 'Cost Optimization',
    description: 'Reduce API costs without sacrificing quality',
    readTime: '8 min',
    popular: true,
  },
  {
    category: 'best-practices',
    title: 'Caching Strategies',
    description: 'Implement effective caching for embeddings',
    readTime: '7 min',
    popular: false,
  },
  {
    category: 'security',
    title: 'Data Privacy',
    description: 'How we handle and protect your data',
    readTime: '5 min',
    popular: false,
  },
  {
    category: 'security',
    title: 'API Key Security',
    description: 'Best practices for securing your API keys',
    readTime: '4 min',
    popular: true,
  },
];

export default function DocsPage() {
  const [selectedCategory, setSelectedCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = docs.filter(doc => 
    doc.category === selectedCategory &&
    (doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-fm-text-dim mb-1">§ DOCS</p>
        <h1 className="text-3xl font-bold text-fm-text">Documentation</h1>
        <p className="text-fm-text-muted mt-1">Learn how to integrate and optimize FreeModel in your applications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-fm-surface border border-fm-border rounded-xl p-4 sticky top-24">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fm-text-dim" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search docs..."
                className="input-field pl-10"
              />
            </div>
            <nav aria-label="Documentation categories">
              {docsCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setSearchQuery(''); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-fm-green/10 text-fm-green'
                      : 'text-fm-text-muted hover:bg-fm-surface-hover hover:text-fm-text'
                  }`}
                >
                  <cat.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1">{cat.label}</span>
                  <span className="text-xs text-fm-text-dim bg-fm-bg px-2 py-0.5 rounded">{cat.count}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-fm-surface border border-fm-border rounded-xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-fm-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-fm-text">
                {docsCategories.find(c => c.id === selectedCategory)?.label}
              </h2>
              <span className="text-sm text-fm-text-dim">{filteredDocs.length} articles</span>
            </div>
            <div className="divide-y divide-fm-border/50">
              {filteredDocs.map((doc, i) => (
                <a
                  key={i}
                  href={`/docs/${doc.category}/${doc.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="block p-5 hover:bg-fm-surface-hover transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-fm-text">{doc.title}</h3>
                      {doc.popular && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-fm-amber/10 text-fm-amber rounded">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-fm-text-muted text-sm">{doc.description}</p>
                  </div>
                  <div className="flex items-center gap-3 text-fm-text-dim flex-shrink-0">
                    <span className="text-sm">{doc.readTime}</span>
                    <ExternalLink className="w-4 h-4 hover:text-fm-green transition-colors" />
                  </div>
                </a>
              ))}
              {filteredDocs.length === 0 && (
                <div className="p-12 text-center text-fm-text-dim">
                  No articles found matching your search
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: 'API Reference', desc: 'Complete API documentation', icon: Code, href: '/docs/api-reference' },
              { title: 'SDKs & Libraries', desc: 'Official client libraries', icon: Shield, href: '/docs/sdks' },
              { title: 'Changelog', desc: 'Recent updates and changes', icon: Zap, href: '/changelog' },
            ].map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="stat-card hover:border-fm-green/30 text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="stat-label">{link.title}</span>
                  <link.icon className="w-10 h-10 rounded-lg bg-fm-surface-hover flex items-center justify-center text-fm-green group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-fm-text-muted">{link.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}