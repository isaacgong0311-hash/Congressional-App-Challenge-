import { describe, expect, it } from "vitest";

import {
  isoDateFromText,
  normalizeComparable,
  valueSupportedByQuote,
  valuesEquivalent,
} from "../../app/features/first-day/domain/value-normalization";

const same = (left: string, right: string) =>
  valuesEquivalent({ originalValue: left }, { originalValue: right });

describe("value equivalence", () => {
  it("ignores case, accents, punctuation, and leading articles", () => {
    expect(same("The Cafeteria", "cafetería")).toBe(true);
    expect(same("Room 204.", "room 204")).toBe(true);
  });

  it("treats English and Spanish names for one place as equal", () => {
    expect(same("Gymnasium", "Gimnasio")).toBe(true);
    expect(same("Gym", "el gimnasio")).toBe(true);
    expect(same("Main office", "Oficina principal")).toBe(true);
    expect(same("School cafeteria", "Cafeteria")).toBe(true);
  });

  it("keeps different places different", () => {
    expect(same("Cafeteria", "Gym")).toBe(false);
    expect(same("Building A", "Building C")).toBe(false);
    expect(same("Room 204", "Room 240")).toBe(false);
  });

  it("matches the same date written in English, Spanish, or ISO form", () => {
    expect(same("August 14, 2027", "14 de agosto de 2027")).toBe(true);
    expect(
      valuesEquivalent(
        { originalValue: "August 14, 2027", normalizedValue: "2027-08-14" },
        { originalValue: "el 14 de agosto de 2027" },
      ),
    ).toBe(true);
  });

  it("does not merge different dates or different times on one date", () => {
    expect(same("August 13, 2027", "August 14, 2027")).toBe(false);
    expect(same("August 14, 2027 at 5:30 p.m.", "August 14, 2027 at 9:00 a.m.")).toBe(false);
    expect(same("August 14, 2027 at 5:30 p.m.", "14 de agosto de 2027 a las 5:30 p. m.")).toBe(true);
  });

  it("normalizes into a stable comparison string", () => {
    expect(normalizeComparable("Oficina Principal")).toBe(
      normalizeComparable("main office"),
    );
    expect(isoDateFromText("14 de agosto de 2027")).toBe("2027-08-14");
    expect(isoDateFromText("sometime in August")).toBeNull();
  });
});

describe("value support in a quote", () => {
  it("accepts a value the quote states, even when reworded", () => {
    expect(valueSupportedByQuote("Gym", "La orientación será en el gimnasio.")).toBe(true);
    expect(
      valueSupportedByQuote(
        "Utility bill or signed lease",
        "For proof of residence, bring a utility bill or a signed lease.",
      ),
    ).toBe(true);
  });

  it("rejects a value the quote does not contain", () => {
    expect(valueSupportedByQuote("Cafeteria", "Orientation will be held in the gym.")).toBe(false);
    expect(valueSupportedByQuote("August 15, 2027", "Orientation is August 14, 2027.")).toBe(false);
  });
});
