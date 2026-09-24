import Image from "next/image";

// Personal profile section
export default function ProfileSection() {
  return (
    <section id="about" className="flex flex-col items-center mt-10 gap-5 max-w-5xl mx-auto px-8">
      <Image  // avatar
        src="/profile.jpg"
        alt="profile-image"
        width={128}
        height={128}
        className="rounded-full w-32 h-32 object-cover"
      />
      <p className="text-center leading-relaxed mx-auto max-w-md">
        I am a full-stack web developer based in Melbourne, Australia.
      </p>
    </section>
  );
}