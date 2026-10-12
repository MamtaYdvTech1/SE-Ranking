'use client';

import React, { useState } from 'react';
import { Search, Star, Filter, Download, ExternalLink } from 'lucide-react';
export interface ReviewItem {
  id: string;
  source: string;
  sourceIcon?: string;
  rating: number | null;
  date: string;
  text: string;
  author: string;
  status?: string;
  language?: string;
  reply?: string | null;
}

interface InsightsViewProps {
  reviews?: ReviewItem[];
  onSelectReview?: (review: ReviewItem) => void;
}

export function InsightsView({ reviews = [], onSelectReview }: InsightsViewProps) {
  const [selectedKeyword, setSelectedKeyword] = useState<string>('all');
  const [searchKw, setSearchKw] = useState('');

  const keywordsData = [
    { kw: 'food', score: 3.8, count: 25, lang: 'EN' },
    { kw: 'pasta', score: 3.9, count: 18, lang: 'EN, ES' },
    { kw: 'italian', score: 4.2, count: 12, lang: 'EN' },
    { kw: 'restaurant', score: 4.0, count: 10, lang: 'EN' },
    { kw: 'service', score: 3.8, count: 9, lang: 'EN' },
    { kw: 'waiters', score: 4.1, count: 8, lang: 'EN' },
    { kw: 'order', score: 4.0, count: 8, lang: 'EN' },
    { kw: 'people', score: 3.9, count: 7, lang: 'EN' },
    { kw: 'experience', score: 4.0, count: 6, lang: 'EN' },
    { kw: 'servicio', score: 3.9, count: 5, lang: 'ES' },
    { kw: 'precio', score: 4.0, count: 4, lang: 'ES' },
    { kw: 'terraza', score: 4.2, count: 3, lang: 'ES' },
  ];

  const filteredKw = keywordsData.filter((k) =>
    k.kw.toLowerCase().includes(searchKw.toLowerCase())
  );

  const sampleReviews: ReviewItem[] = [
    {
      id: 'rev-1',
      source: 'Google',
      sourceIcon: 'G',
      rating: 5,
      date: 'Sep 25 2026',
      text: 'I loved the place so much. The owner greets you with a smile which makes the overall atmosphere wonderful and welcoming. Definitely coming back soon!',
      author: 'Ben A.',
      status: 'Read',
      language: 'EN',
    },
    {
      id: 'rev-2',
      source: 'Google',
      sourceIcon: 'G',
      rating: 5,
      date: 'Sep 25 2026',
      text: 'It was absolutely incredible. There was amazing service, absolutely delicious food, and wonderful wines to pair.',
      author: 'Sabrina Taylor',
      status: 'Answered',
      language: 'EN',
    },
    {
      id: 'rev-3',
      source: "Judy's Book",
      sourceIcon: '📖',
      rating: 2,
      date: 'Sep 23 2026',
      text: 'The atmosphere was great. Location seemed convenient. The Philly sandwich I ordered, however, was quite greasy and cold when brought out.',
      author: 'George Kent',
      status: 'Needs attention',
      language: 'EN',
    },
    {
      id: 'rev-4',
      source: 'FindOpen',
      sourceIcon: '📍',
      rating: 4,
      date: 'Sep 23 2026',
      text: 'Super popular place. We even had to stand in the line to get in. Food was great overall, especially the handmade pasta.',
      author: 'Minka Lawson',
      status: 'Read',
      language: 'EN',
    },
    {
      id: 'rev-5',
      source: 'EZlocal',
      sourceIcon: '🌐',
      rating: 3,
      date: 'Sep 21 2026',
      text: "First time here. Tried the pasta on pasta Friday. It was okay... didn't taste much like true Italian seasoning.",
      author: 'Emma Conte',
      status: 'Needs attention',
      language: 'EN',
    },
    {
      id: 'rev-6',
      source: 'Tripadvisor',
      sourceIcon: '🦉',
      rating: 5,
      date: 'Sep 20 2026',
      text: 'Genuine Italian food. Tasty and looks great. Nice wine too. Waiters are pleasant and fast.',
      author: 'Jerry_213',
      status: 'Not read',
      language: 'EN',
    },
    {
      id: 'rev-7',
      source: 'City squares',
      sourceIcon: '🏙️',
      rating: 5,
      date: 'Sep 19 2026',
      text: 'The food is delicious and full of flavor. The only complaint I have this time around that it was a bit loud inside.',
      author: 'Alan Pascot',
      status: 'Read',
      language: 'EN',
    },
    {
      id: 'rev-10',
      source: 'ShowMeLocal',
      sourceIcon: '🏷️',
      rating: 5,
      date: 'Sep 10 2026',
      text: 'Reasonable prices, amazing food, fast service. Very clean, friendly staff, a chill atmosphere.',
      author: 'Monica Dutton',
      status: 'Answered',
      language: 'EN',
    },
    {
      id: 'rev-11',
      source: 'City squares',
      sourceIcon: '🏙️',
      rating: 4,
      date: 'Sep 15 2026',
      text: 'Fine place that is just about giving good service and solid, good food. We got a lot of food for a good price.',
      author: 'Diana Krawitz',
      status: 'Read',
      language: 'EN',
    },
    {
      id: 'rev-12',
      source: 'Facebook',
      sourceIcon: 'f',
      rating: 5,
      date: 'Sep 07 2026',
      text: 'one of the best Italian Restaurants in the state, hands down!',
      author: 'Bryant John Carter',
      status: 'Read',
      language: 'EN',
    },
    {
      id: 'rev-13',
      source: 'Google',
      sourceIcon: 'G',
      rating: 5,
      date: 'Sep 07 2026',
      text: 'Es un restaurante de calidad, cuenta con un salón espectacular, terraza y está al lado del parque marítimo.',
      author: 'Juan González',
      status: 'Answered',
      language: 'ES',
    },
  ];

  const displayReviews = sampleReviews.filter((r) => {
    if (selectedKeyword === 'all') return true;
    return r.text.toLowerCase().includes(selectedKeyword.toLowerCase());
  });

  return (
    <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Insights</h1>
        <p className="text-xs text-gray-500">
          Sentiment and keyword analysis extracted from customer reviews across all monitored sources
        </p>
      </div>

      {/* Two Column Layout matching Screenshot 19 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Keywords Sentiment Table (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-gray-200 flex items-center justify-between">
            <span className="font-bold text-xs text-gray-800">
              Keywords (1 out of {keywordsData.length})
            </span>
            <div className="relative w-40">
              <Search className="w-3 h-3 text-gray-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search keyword..."
                value={searchKw}
                onChange={(e) => setSearchKw(e.target.value)}
                className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">KEYWORD</th>
                  <th className="px-4 py-3">AVG SCORE</th>
                  <th className="px-4 py-3">FREQUENCY</th>
                  <th className="px-4 py-3">LANG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                <tr
                  onClick={() => setSelectedKeyword('all')}
                  className={`cursor-pointer transition-colors ${
                    selectedKeyword === 'all' ? 'bg-blue-50 font-bold text-[#0B69FF]' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3" colSpan={4}>
                    ✨ Show all reviews ({sampleReviews.length})
                  </td>
                </tr>
                {filteredKw.map((item) => {
                  const isSelected = selectedKeyword === item.kw;
                  return (
                    <tr
                      key={item.kw}
                      onClick={() => setSelectedKeyword(item.kw)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 font-bold text-[#0B69FF]' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900">{item.kw}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="flex items-center gap-1 font-bold text-amber-500">
                          <span>{item.score}</span>
                          <span>★</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-800">{item.count}</td>
                      <td className="px-4 py-3 text-gray-500 font-semibold">{item.lang}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Customer Review Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>
              Showing reviews for: <strong className="text-gray-900 capitalize">{selectedKeyword}</strong> (
              {displayReviews.length} found)
            </span>
          </div>

          <div className="space-y-3">
            {displayReviews.map((rev) => (
              <div
                key={rev.id}
                onClick={() => onSelectReview && onSelectReview(rev)}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#EBF3FC] text-[#0B69FF] font-bold text-xs flex items-center justify-center">
                      {rev.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-gray-900">{rev.author}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{rev.date}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      {rev.rating !== null ? (
                        <>
                          <span>{rev.rating}</span>
                          <span>★</span>
                        </>
                      ) : (
                        <span className="text-gray-400">Not rated</span>
                      )}
                    </div>
                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs">
                      {rev.sourceIcon}
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {rev.language}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed italic">"{rev.text}"</p>

                {rev.reply && (
                  <div className="bg-blue-50 border border-blue-100 rounded p-2.5 text-[11px] text-blue-900 space-y-1">
                    <span className="font-bold">Official Response:</span>
                    <p className="text-blue-800">{rev.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
