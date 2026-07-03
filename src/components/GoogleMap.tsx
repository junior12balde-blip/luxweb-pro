import { googleMapsEmbedSrc } from "@/lib/constants";

type GoogleMapProps = {
  title: string;
  className?: string;
  address?: { street: string; city: string; postalCode: string; country?: string };
};

export default function GoogleMap({ title, className, address }: GoogleMapProps) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 ${className ?? ""}`}>
      <iframe
        src={googleMapsEmbedSrc(address)}
        title={title}
        width="100%"
        height="100%"
        style={{ border: 0, minHeight: 320 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
