"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ResourceCard } from "./resource-card";
import { useAppStore } from "@/store/app-store";

const categories = ["All", "Tracking", "Rebound Control", "Crease Movement", "Post Play", "Preparation"];

export function LibraryScreen() {
  const state = useAppStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const assigned = state.resources.filter((resource) => state.progress[resource.id] && !state.progress[resource.id].completed);
  const activeFocusIds = new Set(state.focuses.filter((focus) => focus.status !== "completed").map((focus) => focus.id));
  const recommended = state.resources.filter((resource) => resource.focusIds.some((id) => activeFocusIds.has(id)) && !state.progress[resource.id]?.completed && !assigned.some((item) => item.id === resource.id));
  const recentlyViewed = state.resources.filter((resource) => state.progress[resource.id]?.lastViewedAt).toSorted((a, b) => new Date(state.progress[b.id].lastViewedAt ?? 0).getTime() - new Date(state.progress[a.id].lastViewedAt ?? 0).getTime());
  const filtered = useMemo(() => state.resources.filter((resource) => {
    const matchesQuery = resource.title.toLowerCase().includes(query.toLowerCase()) || resource.category.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All" || resource.category.includes(category) || (category === "Preparation" && resource.type === "prep");
    return matchesQuery && matchesCategory;
  }), [category, query, state.resources]);

  return (
    <main className="page library-page">
      <PageHeader />
      <div className="page-title-row"><div><p className="eyebrow">Between sessions</p><h1>Library</h1></div><span className="library-count">{state.resources.length} resources</span></div>
      <label className="library-search"><Search size={18} /><span className="sr-only">Search resources</span><input type="search" placeholder="Search your resources" value={query} onChange={(event) => setQuery(event.target.value)} /><SlidersHorizontal size={17} /></label>

      {!query && category === "All" ? (
        <>
          <section className="library-section"><div className="section-heading"><div><p className="eyebrow">Assigned to you</p><h2>Review next</h2></div><span>{assigned.length} open</span></div><div className="resource-feature-grid">{assigned.map((resource) => <ResourceCard key={resource.id} resource={resource} progress={state.progress[resource.id]} />)}</div></section>
          {recommended.length ? <section className="library-section"><div className="section-heading"><div><p className="eyebrow">Recommended</p><h2>For your Blueprint</h2></div></div><div className="horizontal-resources">{recommended.map((resource) => <ResourceCard compact key={resource.id} resource={resource} progress={state.progress[resource.id]} />)}</div></section> : null}
          {recentlyViewed.length ? <section className="library-section"><div className="section-heading"><div><p className="eyebrow">Continue & recent</p><h2>Pick up where you left off</h2></div></div><div className="horizontal-resources">{recentlyViewed.map((resource) => <ResourceCard compact key={resource.id} resource={resource} progress={state.progress[resource.id]} />)}</div></section> : null}
        </>
      ) : null}

      <section className="library-section browse-section">
        <div className="section-heading"><div><p className="eyebrow">Browse</p><h2>Development resources</h2></div></div>
        <div className="scroll-filters" role="group" aria-label="Resource category">
          {categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        {filtered.length ? <div className="resource-browse-grid">{filtered.map((resource) => <ResourceCard key={resource.id} resource={resource} progress={state.progress[resource.id]} />)}</div> : <div className="empty-search"><Search size={22} /><h3>No matching review</h3><p>Try another focus or search term.</p><button className="button secondary" onClick={() => { setQuery(""); setCategory("All"); }}>Clear filters</button></div>}
      </section>
    </main>
  );
}
