'use client';

import React from 'react';
import { MultiAgentPipelineTimeline } from './MultiAgentPipelineTimeline';
import { InsightPhoneMockup } from './InsightPhoneMockup';

type InsightType = 'ridership' | 'travel-time' | 'walkshed' | 'poi' | 'compliance';

interface PlatformInsight {
  title: string;
  description: string;
  evidence: string;
  primaryMetric: string;
  secondaryMetric: string;
  type: InsightType;
  featured?: boolean;
  warning?: boolean;
}

const PLATFORM_INSIGHTS: PlatformInsight[] = [
  {
    title: 'Open Dataset Foundation & Provenance',
    description: 'Indexes the open metro, ward, census, road, environmental and POI sources used by each specialist, together with their dates, licences and known limitations.',
    evidence: 'SOURCE INDEX',
    primaryMetric: '8,213 indexed POIs',
    secondaryMetric: '198 historical wards',
    type: 'ridership',
  },
  {
    title: 'Travel-Time Scenario Comparison',
    description: 'Compares a GTFS-derived metro schedule estimate with a configurable BPR road-congestion scenario. It is a planning model, not live traffic telemetry.',
    evidence: 'MODELLED',
    primaryMetric: '12.1m Metro vs 33.9m Road',
    secondaryMetric: '21.8m modelled saving',
    type: 'travel-time',
  },
  {
    title: 'Catchment & Census Baseline',
    description: 'Builds a configurable geodesic corridor catchment and estimates population through area-weighted intersection with historical BBMP ward data.',
    evidence: 'HISTORICAL',
    primaryMetric: '170,880 estimated residents',
    secondaryMetric: '1.5 km • Census 2011',
    type: 'walkshed',
  },
  {
    title: 'POI Accessibility & Activity Clusters',
    description: 'Categorises and clusters nearby healthcare, education, employment, commercial, civic and public-transport POIs inside the configured corridor catchment.',
    evidence: 'OSM SNAPSHOT',
    primaryMetric: 'Category counts + clusters',
    secondaryMetric: 'Coverage varies by area',
    type: 'poi',
  },
  {
    title: 'Environmental & Restricted-Area Screening',
    description: 'Screens the corridor against every verified environmental or restricted-area layer available for analysis. Water layers are active; forest, protected-area, flood-risk and other restricted-zone layers are assessed only when verified datasets are supplied.',
    evidence: 'SCREENING',
    primaryMetric: 'Available layers evaluated',
    secondaryMetric: 'Not a statutory clearance',
    type: 'compliance',
    featured: true,
    warning: true,
  },
];

export function ProjectOverviewSection() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-16 select-none">
      <div id="insights" className="mb-28 scroll-mt-20">
        <div className="flex items-baseline gap-2.5 sm:gap-3.5 mb-4">
          <h2 className="font-sans text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight">
            Platform insights
          </h2>
          <span className="size-3 sm:size-4 lg:size-5 rounded-xs bg-[#0ab1ba] inline-block shadow-[0_0_16px_#0ab1ba]" />
        </div>
        <p className="text-zinc-400 text-base sm:text-lg lg:text-xl max-w-3xl mb-12 leading-relaxed">
          Five traceable planning insights, each labelled by evidence type and constrained by the datasets currently available to the prototype.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PLATFORM_INSIGHTS.map((insight) => (
            <article
              key={insight.title}
              className={`group relative overflow-hidden rounded-2xl bg-[#08080a] p-5 sm:p-6 transition-[background-color,border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:bg-[#0c0c0e] ${
                insight.featured
                  ? 'md:col-span-2 border border-amber-300/20 shadow-[0_26px_65px_rgba(0,0,0,0.9)]'
                  : 'border border-white/[0.05] shadow-[0_20px_50px_rgba(0,0,0,0.9)] hover:border-white/20'
              }`}
            >
              <div className={`flex h-full flex-col items-center gap-5 sm:flex-row sm:gap-6 ${
                insight.featured ? 'md:px-8' : ''
              }`}>
                <InsightPhoneMockup type={insight.type} />

                <div className="flex h-full w-full flex-1 flex-col justify-between py-1">
                  <div>
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <h3 className="max-w-md text-lg font-bold text-white">
                        {insight.title}
                      </h3>
                      <span className={`rounded-md border px-2 py-1 font-mono text-[9px] font-semibold tracking-[0.14em] ${
                        insight.warning
                          ? 'border-amber-300/30 bg-amber-300/[0.07] text-amber-200'
                          : 'border-white/10 bg-white/[0.04] text-zinc-400'
                      }`}>
                        {insight.evidence}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-white/[0.05] pt-3 font-mono text-[11px]">
                    <span className={insight.warning ? 'text-amber-200' : 'text-zinc-300'}>
                      {insight.primaryMetric}
                    </span>
                    <span className="text-zinc-700">•</span>
                    <span className="text-zinc-500">{insight.secondaryMetric}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div id="swarm" className="scroll-mt-20">
        <MultiAgentPipelineTimeline />
      </div>
    </section>
  );
}

export default ProjectOverviewSection;
