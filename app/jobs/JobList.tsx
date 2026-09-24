"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { Chip, money, panelStyles, sinceLabel, Status } from "../components/Ui";
import type { JobRecord } from "../lib/Jobs";

export default function JobList({ jobs }: { jobs: JobRecord[] }) {
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("all");
  const [maxBudget, setMaxBudget] = useState("any");

  // The input stays responsive while the list filters slightly behind it
  const deferredSearch = useDeferredValue(search);
  const filtering = search !== deferredSearch;

  const skills = useMemo(
    () => ["all", ...new Set(jobs.flatMap((job) => job.skills))].sort(),
    [jobs]
  );

  const visible = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();

    return jobs.filter((job) => {
      if (skill !== "all" && !job.skills.includes(skill)) return false;
      if (maxBudget !== "any" && job.budget > Number(maxBudget)) return false;
      if (!term) return true;

      return `${job.title} ${job.description} ${job.skills.join(" ")}`
        .toLowerCase()
        .includes(term);
    });
  }, [jobs, deferredSearch, skill, maxBudget]);

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr] items-start">
      <aside className={`${panelStyles} p-4`}>
        <h2 className="text-xs uppercase tracking-wider text-dim mb-3">
          Sidebar Heading
        </h2>

        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="q" className="text-sm text-dim">
              Job Name
            </label>
            <input
              id="q"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Job title or description..."
              className="w-full px-2.5 py-2 text-sm bg-surface border border-line-strong rounded-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="skill" className="text-sm text-dim">
              Category
            </label>
            <select
              id="skill"
              value={skill}
              onChange={(event) => setSkill(event.target.value)}
              className="w-full px-2.5 py-2 text-sm bg-surface border border-line-strong rounded-sm"
            >
              {skills.map((each) => (
                <option key={each} value={each}>
                  {each === "all" ? "All Categories" : each}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="budget" className="text-sm text-dim">
              Max Budget
            </label>
            <select
              id="budget"
              value={maxBudget}
              onChange={(event) => setMaxBudget(event.target.value)}
              className="w-full px-2.5 py-2 text-sm bg-surface border border-line-strong rounded-sm"
            >
              <option value="any">None</option>
              <option value="500">$500</option>
              <option value="1000">$1,000</option>
              <option value="5000">$5,000</option>
            </select>
          </div>
        </div>
      </aside>

      <section>
        <p
          className={`text-sm mb-3 ${
            filtering ? "text-dim opacity-60" : "text-dim"
          }`}
        >
          <span className="num font-semibold text-ink">
            {visible.length}
          </span>{" "}
          of {jobs.length} items
        </p>

        {visible.length === 0 ? (
          <p className={`${panelStyles} p-8 text-center text-sm text-dim`}>
            Empty State Placeholder
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {visible.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/jobs/${job.id}`}
                  className={`${panelStyles} block p-4 hover:border-line-strong`}
                >
                  <h3 className="text-base font-semibold text-link mb-1">
                    {job.title}
                  </h3>
                  <p className="text-sm text-dim mb-2">
                    {job.clientName} &middot;{" "}
                    <span className="num font-semibold text-ink">
                      {money(job.budget)}
                    </span>{" "}
                    &middot; {sinceLabel(job.createdAt)}
                    {job.status !== "open" && (
                      <>
                        {" "}
                        &middot; <Status state={job.status} />
                      </>
                    )}
                  </p>
                  <p className="text-sm text-dim mb-3 line-clamp-2">
                    {job.description}
                  </p>
                  <span className="flex flex-wrap gap-1.5">
                    {job.skills.map((each) => (
                      <Chip key={each}>{each}</Chip>
                    ))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
