import Image from "next/image";

// About page: static presentational page describing the store and team. 
// This page purely presentational 
export default function AboutPage() {
  return (
    <main className="bg-black text-white min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex justify-center">
          <Image src="/info0.png" alt="About info" width={620} height={360} className="object-contain" />
        </div>

        {/* Who are we section */}
        <div className="text-center mt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-#ffeede font-anton mb-4">Who Are We</h1>
          <p className="max-w-3xl mx-auto text-sm md:text-base text-gray-200 leading-relaxed">
            We are a collective of rock enthusiasts who wanted the convenience of finding records online without
            losing the soul of an authentic record store. Vinyl Store started as a simple idea: make it easy to
            discover rare pressings, classic albums and hidden gems, while keeping the warmth of hand-picked
            recommendations, careful packaging and real people you can talk to about music. Our team scours
            crates, curates collections, and writes thoughtful descriptions so you get the feeling of digging
            through a local shop — even when you’re browsing from your couch.
          </p>

          <p className="max-w-3xl mx-auto text-sm md:text-base text-gray-200 leading-relaxed mt-4">
            Whether you’re hunting for first presses, looking to start a collection, or chasing a single
            favourite track, we’re here to help. We believe in records as objects of culture — beautifully
            designed, sonically rich, and worth sharing. Thanks for supporting indie curation and keeping the
            spirit of rock & roll alive.
          </p>
        </div>

        {/* Meet the team section */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-[#f6efe6] text-[#5a1518] rounded-lg p-6">
              <div className="text-lg font-bold">Maya Turner</div>
              <div className="text-sm italic">Founder & Head Curator</div>
              <p className="mt-3 text-sm">Maya collects vintage UK punk and curates our weekly highlights. She ensures
                every record we ship meets our quality standards.</p>
            </div>

            <div className="bg-[#f6efe6] text-[#5a1518] rounded-lg p-6">
              <div className="text-lg font-bold">Jonah Reed</div>
              <div className="text-sm italic">Operations Manager</div>
              <p className="mt-3 text-sm">Jonah handles sourcing and logistics — from crate finds to doorstep
                delivery. He loves a good live album and an even better packing tape trick.</p>
            </div>

            <div className="bg-[#f6efe6] text-[#5a1518] rounded-lg p-6">
              <div className="text-lg font-bold">Aisha Khan</div>
              <div className="text-sm italic">Community & Content</div>
              <p className="mt-3 text-sm">Aisha runs our social picks and editorial pieces. She writes about music,
                artists and the stories behind the records we sell.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
