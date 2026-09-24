import Image from "next/image";

export default function ProjectsSection() {
  return (
    <section id="work" className="flex flex-col items-center gap-3 max-w-5xl mx-auto px-8">
      <h2 className="text-center text-2xl">Here&apos;s what I&apos;ve done so far</h2>
      <p className="text-center mb-7 italic">(Github link is embedded into the images)</p>

      <div className="flex flex-col gap-8 w-full max-w-3xl">
        {/* Project 1 */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <a href="https://github.com/Mangon3/Stock-Agent" className="w-full md:w-1/2 overflow-hidden rounded-xl">
            <Image
              src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fuploads-ssl.webflow.com%2F61030bcaa0d6b42a17a67182%2F63ceace46746b4033262b276_VXz4gHBc96hdkvzoEDKHyoHZET_Xj5L1hup3Bu6ygF5DegNwktwSz9pl8-B0xP3HsG4KovRag9ITJmCmMrAPVMMOI_da2lLXRBGpC-eJi9jQeIvzPbuQH7D2Mn0RFw6qEqdCKx0Xrkg1a_7sCsuAArYP6KaDp0MmzBDzWzFgmUOkjELLIgpp715XMxunKQ.png&f=1&nofb=1&ipt=44c6e09e8e3450155f27c39f6e875619358b1e18b2566f6bf4b848d7fefe594e"
              alt="project-1"
              width={1920}
              height={1080}
              className="w-full h-auto object-cover rounded-lg aspect-video hover:scale-105 transition-transform duration-300"
            />
          </a>
          <p className="w-full md:w-1/2 text-center md:text-left text-base">
            A <strong>stock analysis agent</strong> that assists with investments.
          </p>
        </div>

        {/* Project 2 */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <a href="https://github.com/Mangon3/Ecosave" className="w-full md:w-1/2 overflow-hidden rounded-xl">
            <Image
              src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fassets.hipcv.com%2Fcontent%2FIllustrations-for-content%2Fbudgeting.jpeg&f=1&nofb=1&ipt=4c3677b67d05e9db2be956a26eaa8bed8a7ea97f1cf8aeb9ef4ed4d24931e8aa"
              alt="project-2"
              width={1920}
              height={1080}
              className="w-full h-auto object-cover rounded-lg aspect-video hover:scale-105 transition-transform duration-300"
            />
          </a>
          <p className="w-full md:w-1/2 text-center md:text-left text-base">
            A <strong>budget tracking Android app</strong> that helps with finance management.
          </p>
        </div>
      </div>
    </section>
  );
}