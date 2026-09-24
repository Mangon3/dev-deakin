import Image from "next/image";

// Gallery section
export default function PhotoGallery() {
  return (
    <section className="flex flex-col items-center mb-16 max-w-5xl mx-auto px-8">
      <h2 className="text-center text-2xl mb-10">My photos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        <div className="overflow-hidden rounded-lg aspect-4/3">
          <Image
            src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpapercave.com%2Fwp%2Fixmt8JQ.jpg&f=1&nofb=1&ipt=b7ea9d7bb9c2f6254f31e5925e8672be942fa27b1d6a79a1d5677e45f3a86188"
            alt="photo-1" width={1920} height={1080}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="overflow-hidden rounded-lg aspect-4/3">
          <Image
            src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.wallpapersafari.com%2F83%2F59%2FyaXM9U.jpg&f=1&nofb=1&ipt=295dae219f340339a2c86958ec9f71eaeb3b513144d2ec912753b8822fccb705"
            alt="photo-2" width={1920} height={1080}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="overflow-hidden rounded-lg aspect-4/3">
          <Image
            src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpapercave.com%2Fwp%2F8heA1h2.jpg&f=1&nofb=1&ipt=abe19889d676e3f64914a12fcc74df542bde25d418f3413a921d8fe59da2fbe4"
            alt="photo-3" width={1920} height={1080}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </section>
  );
}