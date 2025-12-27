"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COURSE_DIFFICULTY } from "@/lib/validation";
import { SearchIcon, XIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface Category {
  id: string;
  name: string;
}

interface CourseFiltersProps {
  categories: Category[];
  currentFilters: {
    search?: string;
    categoryId?: string;
    difficulty?: string;
  };
}

export function CourseFilters({ categories, currentFilters }: CourseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentFilters.search || "");

  function updateFilter(key: string, value: string | undefined) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("cursor"); // Reset pagination on filter change
      router.push(`/courses?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateFilter("search", search || undefined);
  }

  function clearFilters() {
    setSearch("");
    router.push("/courses");
  }

  const hasFilters =
    currentFilters.search ||
    currentFilters.categoryId ||
    currentFilters.difficulty;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for courses, topics, or instructors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 rounded-xl pl-12 text-base"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="h-12 rounded-xl px-8"
        >
          {isPending ? "Searching..." : "Search"}
        </Button>
      </form>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={currentFilters.categoryId || "all"}
          onValueChange={(value) => updateFilter("categoryId", value)}
        >
          <SelectTrigger className="h-11 w-[200px] rounded-xl">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentFilters.difficulty || "all"}
          onValueChange={(value) => updateFilter("difficulty", value)}
        >
          <SelectTrigger className="h-11 w-[180px] rounded-xl">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {COURSE_DIFFICULTY.map((diff) => (
              <SelectItem key={diff} value={diff}>
                {diff.charAt(0) + diff.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            disabled={isPending}
            className="h-11 gap-2 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="size-4" />
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
}
