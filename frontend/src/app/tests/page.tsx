'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  ShoppingBag, 
  ArrowUpDown, 
  Sparkles,
  Layers
} from 'lucide-react';
import { ApiClient } from '../../lib/api';
import { TestItem, TestPackage } from '../../types';
import TestCard from '../../components/TestCard';
import PackageCard from '../../components/PackageCard';

export default function TestsCataloguePage() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [packages, setPackages] = useState<TestPackage[]>([]);
  const [activeTab, setActiveTab] = useState<'tests' | 'packages'>('tests');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fastingFilter, setFastingFilter] = useState<'all' | 'fasting' | 'non-fasting'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high'>('popular');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      ApiClient.get<TestItem[]>('/tests'),
      ApiClient.get<TestPackage[]>('/packages'),
    ])
      .then(([testsData, packagesData]) => {
        setTests(testsData || []);
        setPackages(packagesData || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    'All',
    'Full Body',
    'Diabetes',
    'Heart',
    'Thyroid',
    'Vitamins',
    'Liver & Kidney',
  ];

  // Filtering tests
  let filteredTests = tests.filter((t) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchDesc = t.short_description.toLowerCase().includes(q);
      const matchCat = t.category.toLowerCase().includes(q);
      const matchCode = t.code.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat && !matchCode) return false;
    }

    // Category filter
    if (selectedCategory !== 'All') {
      if (!t.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
        return false;
      }
    }

    // Fasting filter
    if (fastingFilter === 'fasting' && !t.fasting_required) return false;
    if (fastingFilter === 'non-fasting' && t.fasting_required) return false;

    return true;
  });

  // Sorting
  if (sortBy === 'price-low') {
    filteredTests.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredTests.sort((a, b) => b.price - a.price);
  } else {
    // Popular first
    filteredTests.sort((a, b) => (b.is_popular ? 1 : 0) - (a.is_popular ? 1 : 0));
  }

  // Filtering packages
  const filteredPackages = packages.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full">
            Clinical Diagnostic Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-2">
            Blood Test & Package Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Certified partner laboratory tests with standardized biological reference ranges.
          </p>
        </div>

        {/* Tab Switcher: Tests vs Packages */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'tests'
                ? 'bg-white text-teal-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Individual Blood Tests ({tests.length})
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'packages'
                ? 'bg-white text-teal-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Full Body Packages ({packages.length})
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-soft border border-teal-100/60 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
            <input
              type="text"
              placeholder="Search by test name, category or condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-teal-500 focus:outline-none font-medium"
            />
          </div>

          {/* Fasting Filter */}
          <div className="md:col-span-3">
            <select
              value={fastingFilter}
              onChange={(e) => setFastingFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-teal-500 focus:outline-none font-semibold text-gray-700"
            >
              <option value="all">All Fasting Requirements</option>
              <option value="non-fasting">No Fasting Required</option>
              <option value="fasting">Fasting Required Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-teal-500 focus:outline-none font-semibold text-gray-700"
            >
              <option value="popular">Sort: Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Categories Bar */}
        {activeTab === 'tests' && (
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-gray-100 scrollbar-none">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500">Loading diagnostic catalogue...</p>
        </div>
      ) : activeTab === 'tests' ? (
        filteredTests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
            <p className="text-sm font-bold text-gray-800">No diagnostic tests match your criteria.</p>
            <p className="text-xs text-gray-500 mt-1">Try resetting your filters or search keywords.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setFastingFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-teal-50 text-teal-800 rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredPackages.map((pkg, idx) => (
            <PackageCard key={pkg.id} pkg={pkg} featured={idx === 0} />
          ))}
        </div>
      )}

      {/* Partner Lab Preparation Compliance Note */}
      <div className="p-5 rounded-3xl bg-teal-50/60 border border-teal-200/80 text-xs text-teal-900 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold mb-0.5">Partner Laboratory Protocol Guidelines:</h4>
          <p className="text-teal-800/90 leading-relaxed">
            All blood sample draws are carried out under strict aseptic technique using CE-certified vacutainers. 
            Fasting parameters require strict overnight caloric restriction (10-12 hours). Water intake is encouraged 
            as proper hydration prevents vein collapse and facilitates effortless venipuncture.
          </p>
        </div>
      </div>
    </div>
  );
}

