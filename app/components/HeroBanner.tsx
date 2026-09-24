import Image from "next/image";

// Banner section
export default function HeroBanner() {
  return (
    <header className="group relative w-full max-w-5xl mx-auto mt-8 overflow-hidden cursor-pointer">
      <Image
        src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.nriaffairs.com%2Fwp-content%2Fuploads%2F2023%2F11%2FDeakin-Gift-City.jpg&f=1&nofb=1&ipt=f569115f5c8f04d02592d968fd19d48bcfab34e7203aacd7a1fe3dc2b240daf8"
        alt="header-image"
        width={1920}
        height={1080}
        priority
        className="w-full h-auto object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <h1 className="absolute bottom-8 left-0 right-0 text-center text-4xl text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 tracking-wide">
        Hey, I&apos;m Liam
      </h1>
    </header>
  );
}
