import type { FactKind } from "../../../app/features/first-day/domain/types";

export type LiveExpectation = {
  fixtureId: string;
  facts: Array<{ kind: FactKind; valueFragment: string }>;
};

export const liveExpectations: LiveExpectation[] = [
  { fixtureId: "live-01", facts: [{ kind: "requested_item", valueFragment: "birth certificate" }] },
  { fixtureId: "live-02", facts: [{ kind: "date", valueFragment: "August 14, 2026" }] },
  { fixtureId: "live-03", facts: [{ kind: "location", valueFragment: "north gym entrance" }] },
  { fixtureId: "live-04", facts: [{ kind: "contact", valueFragment: "512-555-0114" }] },
  { fixtureId: "live-05", facts: [{ kind: "requested_item", valueFragment: "immunization record" }] },
  { fixtureId: "live-06", facts: [{ kind: "appointment", valueFragment: "September 3, 2026" }] },
  { fixtureId: "live-07", facts: [{ kind: "requested_item", valueFragment: "utility bill" }] },
  { fixtureId: "live-08", facts: [{ kind: "location", valueFragment: "1311 Round Rock Avenue" }] },
  { fixtureId: "live-09", facts: [{ kind: "date", valueFragment: "October 6, 2026" }] },
  { fixtureId: "live-10", facts: [{ kind: "contact", valueFragment: "enrollment@example.edu" }] },
  { fixtureId: "live-11", facts: [{ kind: "requested_item", valueFragment: "Social Security card" }] },
  { fixtureId: "live-12", facts: [{ kind: "date", valueFragment: "August 19, 2026" }] },
  { fixtureId: "live-13", facts: [{ kind: "contact", valueFragment: "512-555-0130" }] },
  { fixtureId: "live-14", facts: [{ kind: "location", valueFragment: "Building C" }] },
  { fixtureId: "live-15", facts: [{ kind: "requested_item", valueFragment: "report card" }] },
  { fixtureId: "live-16", facts: [{ kind: "appointment", valueFragment: "November 12, 2026" }] },
  { fixtureId: "live-17", facts: [{ kind: "requested_item", valueFragment: "photo ID" }] },
  { fixtureId: "live-18", facts: [{ kind: "location", valueFragment: "west library" }] },
  { fixtureId: "live-19", facts: [{ kind: "date", valueFragment: "December 18, 2026" }] },
  { fixtureId: "live-20", facts: [{ kind: "contact", valueFragment: "512-555-0199" }] },
];
