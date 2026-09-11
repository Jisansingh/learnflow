'use client';

import { useState, useEffect } from 'react';

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState({});

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/resources');
        if (!response.ok) {
          throw new Error('Failed to fetch resources');
        }
        const data = await response.json();
        setResources(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-[#FAF9F5] min-h-screen py-10 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-stone-300 border-t-stone-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#FAF9F5] min-h-screen py-10 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm text-center">
          <span className="material-symbols-outlined text-red-500 text-4xl mb-2 block">error</span>
          <h2 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Resources</h2>
          <p className="text-stone-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const categoryMap = {
    'All': null,
    'Documentation': 'doc',
    'Videos': 'video',
    'Other': 'other',
  };
  const categories = ['All', 'Documentation', 'Videos', 'Other'];

  const toggleBookmark = (id) => {
    setBookmarks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const openResource = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const filteredResources = resources.filter((res) => {
    const backendCategory = categoryMap[selectedCategory];
    const matchesCategory = backendCategory === null || res.category === backendCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (res.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full bg-[#FAF9F5] min-h-screen py-10 px-4 md:px-12 max-w-7xl mx-auto space-y-10">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Knowledge Library
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1b1c1a] mt-1">
            Learning Resources & Documentation
          </h1>
          <p className="text-stone-600 text-sm md:text-base mt-2 max-w-xl">
            Explore curated articles, interactive coding labs, video walkthroughs, and technical documentation.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, tag, or title..."
            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-400 shadow-sm pr-10"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          ) : (
            <span className="material-symbols-outlined absolute right-3 top-3 text-stone-400 text-[18px]">
              search
            </span>
          )}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                active
                  ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Resource Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>Showing {filteredResources.length} resources</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => {
            const isBookmarked = bookmarks[res.id];
            return (
              <div
                key={res.id}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-bold rounded-lg">
                      {res.category || 'General'}
                    </span>
                    <button
                      onClick={() => toggleBookmark(res.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isBookmarked
                          ? 'bg-stone-900 border-stone-900 text-white'
                          : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-700'
                      }`}
                      aria-label="Bookmark resource"
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={isBookmarked ? { fontVariationSettings: "'FILL' 1" } : {}}
                      >
                        bookmark
                      </span>
                    </button>
                  </div>

                  <h3
                    onClick={() => openResource(res.url)}
                    className="font-bold text-lg text-stone-900 leading-snug hover:text-stone-600 cursor-pointer transition-colors"
                  >
                    {res.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                    {res.description || 'No description available'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(res.tags || []).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 bg-stone-50 border border-stone-200 text-stone-600 text-[10px] font-medium rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-end text-xs text-stone-500">
                  <button
                    onClick={() => openResource(res.url)}
                    className="font-bold text-stone-900 hover:underline flex items-center gap-1"
                  >
                    <span>Read Now</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredResources.length === 0 && (
            <div className="col-span-full text-center py-12">
              <span className="material-symbols-outlined text-stone-400 text-4xl mb-2 block">search_off</span>
              <p className="text-stone-600">No resources match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}