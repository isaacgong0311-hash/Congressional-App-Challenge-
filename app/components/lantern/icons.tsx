import type { ReactNode, SVGProps } from "react";

export type LanternIconProps = SVGProps<SVGSVGElement>;

function IconFrame({ children, ...props }: LanternIconProps & { children: ReactNode }) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      {children}
    </svg>
  );
}

export function UploadIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4.5A1.5 1.5 0 006.5 20h11a1.5 1.5 0 001.5-1.5V14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function SlidersIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M4 7h7m4 0h5M4 17h3m4 0h9M11 4v6M7 14v6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /><circle cx="13" cy="7" r="2" stroke="currentColor" strokeWidth="1.8" /><circle cx="9" cy="17" r="2" stroke="currentColor" strokeWidth="1.8" /></IconFrame>;
}

export function LockIcon(props: LanternIconProps) {
  return <IconFrame {...props}><rect height="9" rx="2" stroke="currentColor" strokeWidth="1.8" width="14" x="5" y="11" /><path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></IconFrame>;
}

export function CameraIcon(props: LanternIconProps) {
  return <IconFrame {...props}><rect height="13" rx="3" stroke="currentColor" strokeWidth="1.8" width="18" x="3" y="7" /><path d="M8 7l1.5-2.5h5L16 7" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" /><circle cx="12" cy="13.5" r="3.2" stroke="currentColor" strokeWidth="1.8" /></IconFrame>;
}

export function VolumeIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M5 10v4h3l4 3V7L8 10H5zm10-1.5a5 5 0 010 7M17.5 6a9 9 0 010 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function StopIcon(props: LanternIconProps) {
  return <IconFrame {...props}><rect height="12" rx="2" stroke="currentColor" strokeWidth="1.8" width="12" x="6" y="6" /></IconFrame>;
}

export function CalendarIcon(props: LanternIconProps) {
  return <IconFrame {...props}><rect height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" width="18" x="3" y="5" /><path d="M8 3v4m8-4v4M3 10h18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></IconFrame>;
}

export function LightbulbIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M9 18h6m-5 3h4m-2-18a7 7 0 00-4 12.7c.7.5 1 1.3 1 2.3h6c0-1 .3-1.8 1-2.3A7 7 0 0012 3z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function PhoneIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M7.2 3.8l2.1 4.4-2 1.6a15 15 0 006.9 6.9l1.6-2 4.4 2.1-.8 3.2c-.2.7-.8 1.1-1.5 1A18.5 18.5 0 013 6.1c-.1-.7.3-1.3 1-1.5l3.2-.8z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function ShieldAlertIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M12 3l7 3v5c0 4.4-2.8 8.3-7 10-4.2-1.7-7-5.6-7-10V6l7-3zM12 8v5m0 3h.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function CheckIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" /></IconFrame>;
}

export function SearchIcon(props: LanternIconProps) {
  return <IconFrame {...props}><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" /><path d="M15.5 15.5L21 21" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></IconFrame>;
}

export function DocumentIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M6 3h8l4 4v14H6V3zM14 3v5h4M9 13h6m-6 4h6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function HomeIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M3 11.5L12 4l9 7.5M5.5 10v10h13V10M10 20v-6h4v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function HealthcareIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5V4z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function BenefitsIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M12 21c5-3.2 8-7.2 8-12a5 5 0 00-8-4 5 5 0 00-8 4c0 4.8 3 8.8 8 12z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function LegalIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M12 3v18M6 6h12M6 6l-3 7h6L6 6zm12 0l-3 7h6l-3-7zM7 21h10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function SchoolIcon(props: LanternIconProps) {
  return <IconFrame {...props}><path d="M3 9l9-5 9 5-9 5-9-5zm3 3v5l6 3 6-3v-5M21 9v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconFrame>;
}

export function FinanceIcon(props: LanternIconProps) {
  return <IconFrame {...props}><rect height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" width="18" x="3" y="5" /><path d="M3 10h18M7 15h3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></IconFrame>;
}

export function ImmigrationIcon(props: LanternIconProps) {
  return <IconFrame {...props}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></IconFrame>;
}

export function HelpIcon(props: LanternIconProps) {
  return <IconFrame {...props}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M9.8 9a2.4 2.4 0 114.1 1.7c-1.4 1.1-1.9 1.6-1.9 3.1M12 17h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></IconFrame>;
}
