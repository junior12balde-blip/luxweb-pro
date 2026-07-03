"use client";

import { useTranslations } from "next-intl";
import { whatsappLink } from "@/lib/constants";

export default function WhatsAppButton() {
  const t = useTranslations("whatsapp");

  return (
    <a
      href={whatsappLink(t("message"))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/40 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
    >
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M16.001 3C9.096 3 3.5 8.596 3.5 15.5c0 2.352.65 4.55 1.78 6.432L3 29l7.234-2.245A12.44 12.44 0 0016 28c6.905 0 12.5-5.596 12.5-12.5S22.906 3 16.001 3z"
          fill="white"
        />
        <path
          d="M16.001 4.5c6.075 0 11 4.925 11 11s-4.925 11-11 11a10.94 10.94 0 01-5.6-1.535l-.402-.238-4.155 1.29 1.315-4.05-.262-.417A10.93 10.93 0 015.001 15.5c0-6.075 4.925-11 11-11z"
          fill="#25D366"
        />
        <path
          d="M12.02 9.9c-.24-.53-.492-.54-.72-.55l-.614-.008c-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.667 0 1.573 1.146 3.093 1.306 3.307.16.213 2.213 3.547 5.467 4.827 2.703 1.063 3.253.853 3.84.8.587-.053 1.893-.773 2.16-1.52.267-.747.267-1.387.187-1.52-.08-.133-.293-.213-.613-.373-.32-.16-1.893-.933-2.187-1.04-.293-.107-.507-.16-.72.16-.213.32-.827 1.04-1.013 1.253-.187.213-.373.24-.693.08-.32-.16-1.351-.498-2.573-1.588-.951-.848-1.593-1.895-1.78-2.215-.187-.32-.02-.493.14-.653.144-.143.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.706-1.75-.987-2.4z"
          fill="white"
        />
      </svg>
    </a>
  );
}
