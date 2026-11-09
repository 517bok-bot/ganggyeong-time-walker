"use client";
import { createContext, useContext, useMemo } from "react";
import { EMPTY_OVERRIDES, mergeCharacters, mergeKnowledge, mergeLocations, type ContentOverrides } from "./content-merge";

function build(o: ContentOverrides) {
  const locations = mergeLocations(o), characters = mergeCharacters(o), knowledge = mergeKnowledge(o);
  return {
    locations, characters, knowledge,
    LOC: Object.fromEntries(locations.map((l) => [l.id, l])),
    CHAR: Object.fromEntries(characters.map((c) => [c.id, c])),
    KD: Object.fromEntries(knowledge.map((k) => [k.id, k])),
  };
}
const Ctx = createContext(build(EMPTY_OVERRIDES));

export function ContentProvider({ overrides, children }: { overrides: ContentOverrides; children: React.ReactNode }) {
  const value = useMemo(() => build(overrides), [overrides]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useContent = () => useContext(Ctx);
