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
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#10B981] border-t-transparent"></div>
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

  const featuredResource = resources.find((r) => r.isFeatured) || resources[0];

  return (
    <div className="w-full bg-[#FAF9F5] min-h-screen py-10 px-4 md:px-12 max-w-7xl mx-auto space-y-10">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-[#006c49] uppercase tracking-wider">
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
            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-[#10B981] shadow-sm pr-10"
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
                  ? 'bg-[#10B981] text-white border-[#10B981] shadow-sm'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Featured Resource Hero Card */}
      {selectedCategory === 'All' && !searchQuery && featuredResource && (
        <div className="bg-[#1B1C1A] text-white rounded-3xl p-6 md:p-10 shadow-xl border border-stone-800 relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#10B981]/20 border border-[#10B981]/40 rounded-full text-xs font-semibold text-[#10B981]">
              <span className="material-symbols-outlined text-[16px]">star</span>
              <span>Featured Resource</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-snug">
              {featuredResource.title}
            </h2>
            <p className="text-stone-300 text-sm leading-relaxed max-w-2xl">
              {featuredResource.description || 'No description available'}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 pt-2">
              {featuredResource.duration && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#10B981]">schedule</span>
                  {featuredResource.duration}
                </span>
              )}
              {featuredResource.level && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#FF72B1]">bar_chart</span>
                  {featuredResource.level}
                </span>
              )}
              {featuredResource.rating && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-amber-400">star</span>
                  {featuredResource.rating} Rating
                </span>
              )}
            </div>
            <div className="pt-4">
              <button className="px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-xs rounded-xl transition-all shadow inline-flex items-center gap-2">
                <span>View Resource</span>
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
                          ? 'bg-pink-50 border-pink-200 text-[#b4136d]'
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

                  <h3 className="font-bold text-lg text-stone-900 leading-snug hover:text-[#006c49] cursor-pointer transition-colors">
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

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span className="font-medium">{res.duration || 'N/A'}</span>
                  <button className="font-bold text-[#006c49] hover:underline flex items-center gap-1">
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