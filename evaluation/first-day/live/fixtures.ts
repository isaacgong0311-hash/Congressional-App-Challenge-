export type LiveFixture = {
  id: string;
  language: "English" | "Spanish";
  sourceFormat: "image" | "pdf-rendered";
  quality: "clean" | "degraded";
  heading: string;
  body: string;
};

export const liveFixtures: LiveFixture[] = [
  { id: "live-01", language: "English", sourceFormat: "image", quality: "clean", heading: "Enrollment documents", body: "Please bring a certified birth certificate." },
  { id: "live-02", language: "Spanish", sourceFormat: "image", quality: "clean", heading: "Orientation reminder", body: "Orientation begins on August 14, 2026." },
  { id: "live-03", language: "English", sourceFormat: "image", quality: "clean", heading: "Welcome night", body: "Families should meet at the north gym entrance." },
  { id: "live-04", language: "Spanish", sourceFormat: "image", quality: "clean", heading: "Need help?", body: "Call the enrollment office at 512-555-0114." },
  { id: "live-05", language: "English", sourceFormat: "image", quality: "clean", heading: "Health record", body: "Upload the student's immunization record." },
  { id: "live-06", language: "Spanish", sourceFormat: "image", quality: "degraded", heading: "Nurse appointment", body: "The nurse review is September 3, 2026 at 2:30 p.m." },
  { id: "live-07", language: "English", sourceFormat: "image", quality: "degraded", heading: "Address check", body: "Bring one current utility bill as proof of residence." },
  { id: "live-08", language: "Spanish", sourceFormat: "image", quality: "degraded", heading: "Registration office", body: "Registration is located at 1311 Round Rock Avenue." },
  { id: "live-09", language: "English", sourceFormat: "image", quality: "degraded", heading: "Parent meeting", body: "The parent meeting starts October 6, 2026." },
  { id: "live-10", language: "Spanish", sourceFormat: "image", quality: "degraded", heading: "Contact", body: "Email enrollment@example.edu with questions." },
  { id: "live-11", language: "English", sourceFormat: "pdf-rendered", quality: "clean", heading: "School packet · Page 1", body: "Provide the child's Social Security card only if available." },
  { id: "live-12", language: "Spanish", sourceFormat: "pdf-rendered", quality: "clean", heading: "School packet · Page 2", body: "The first day of class is August 19, 2026." },
  { id: "live-13", language: "English", sourceFormat: "pdf-rendered", quality: "clean", heading: "School packet · Page 3", body: "Bus questions are answered at 512-555-0130." },
  { id: "live-14", language: "Spanish", sourceFormat: "pdf-rendered", quality: "clean", heading: "School packet · Page 4", body: "Meet the registrar in Building C, Room 104." },
  { id: "live-15", language: "English", sourceFormat: "pdf-rendered", quality: "clean", heading: "School packet · Page 5", body: "Bring the most recent report card." },
  { id: "live-16", language: "Spanish", sourceFormat: "pdf-rendered", quality: "degraded", heading: "Follow-up packet · Page 1", body: "Your registration appointment is November 12, 2026 at 9:15 a.m." },
  { id: "live-17", language: "English", sourceFormat: "pdf-rendered", quality: "degraded", heading: "Follow-up packet · Page 2", body: "Upload a copy of the parent or guardian photo ID." },
  { id: "live-18", language: "Spanish", sourceFormat: "pdf-rendered", quality: "degraded", heading: "Follow-up packet · Page 3", body: "The language assessment is in the west library." },
  { id: "live-19", language: "English", sourceFormat: "pdf-rendered", quality: "degraded", heading: "Follow-up packet · Page 4", body: "The records office closes on December 18, 2026." },
  { id: "live-20", language: "Spanish", sourceFormat: "pdf-rendered", quality: "degraded", heading: "Follow-up packet · Page 5", body: "Call 512-555-0199 to change the appointment." },
];
