import { Mail, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

// --- Hero Section with floating books animation ---
const FullScreenHero = () => (
  <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative z-10 overflow-hidden">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute text-[var(--primary)]"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 600, opacity: 0.7 }}
        transition={{ duration: 10 + i, repeat: Infinity, ease: "linear" }}
        style={{ left: `${i * 15 + 10}%` }}
      >
        <BookOpen size={30} />
      </motion.div>
    ))}

    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3 }}
      className="flex flex-col items-center z-20"
    >
      <h2 className="text-[var(--text-primary)] text-xl md:text-4xl font-medium mb-2">
        Welcome to
      </h2>
      <h1 className="text-[100px] font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
        BookWorm
      </h1>
      <p className="mt-6 text-[var(--text-primary)] text-base md:text-lg max-w-md">
        Discover, organize, and share your personal library in style.
      </p>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="mt-10 px-10 py-4 border-2 border-[var(--primary)] text-[var(--primary)] rounded-lg font-semibold text-lg transition-all"
        onClick={() => (window.location.href = "/signup")}
      >
        Get Started
      </motion.button>
    </motion.div>
  </section>
);

// --- First Laptop Feature ---
const FirstLaptopFeature = () => (
  <section className="py-24 md:py-32 container mx-auto px-6 flex flex-col items-center text-center">
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full flex flex-col items-center"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
        All Your Books, in One Place.
      </h2>
      <p className="text-[var(--secondary)] max-w-2xl mx-auto mb-12">
        Effortlessly manage your library, track reading progress, and discover
        your next favorite book with our intuitive dashboard.
      </p>
      <img
        src="/laptop1.png"
        alt="Dashboard Preview"
        className="rounded-lg shadow-2xl w-full max-w-4xl mx-auto"
      />
    </motion.div>
  </section>
);

// --- Community Feature ---
const CommunityFeature = () => (
  <section className="py-24 md:py-32 relative z-10 overflow-hidden">
    <div className="flex flex-col md:flex-row items-center">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full md:w-5/12 text-center md:text-left px-6 md:pl-12 lg:pl-24"
      >
        <h2 className="text-[var(--text-primary)] font-semibold text-3xl md:text-5xl leading-tight">
          Building <br />
          <span className="text-[var(--secondary)]">communities</span> <br />
          through shared <br />
          reading experiences.
        </h2>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="w-full md:w-7/12 mt-12 md:mt-0"
      >
        <img
          src="/laptop2.png"
          alt="My Library and community features"
          className="w-full rounded-l-lg shadow-2xl"
        />
      </motion.div>
    </div>
  </section>
);

// --- Footer ---
const PageFooter = () => (
  <footer className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white pt-10 pb-6 px-6 md:px-12 mt-auto">
    <div className="text-center mb-4">
      <p className="text-sm mb-2"></p>
      <div className="flex justify-center gap-4 flex-wrap">
        <a
          href="mailto:contact@bookworm.com"
          className="bg-white text-[var(--secondary)] px-4 py-2 rounded-md text-sm hover:bg-gray-100 transition flex items-center gap-2"
        >
          <Mail size={16} /> Contact Us
        </a>
      </div>
    </div>
    <div className="border-t border-white/30 flex flex-col md:flex-row justify-between items-center pt-4 text-sm">
      <span className="font-semibold">Bookworm</span>
      <div className="flex gap-4 mt-2 md:mt-0">
        <a href="#" className="hover:underline">
          Privacy policy
        </a>
        <a href="#" className="hover:underline">
          Terms & conditions
        </a>
      </div>
    </div>
  </footer>
);

// --- Main Landing Page ---
function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-[var(--background)] font-['Manrope'] flex flex-col">
      {/* Decorative Blobs */}
      <div className="absolute -top-40 -left-52 w-[500px] h-[500px] bg-[var(--secondary)] rounded-full opacity-30 z-0"></div>
      <div className="absolute -bottom-40 -left-44 w-[378px] h-[189px] bg-[var(--secondary)] rounded-t-full opacity-30 z-0"></div>
      <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-[var(--secondary)] rounded-full opacity-20 z-0"></div>

      <main className="flex-1">
        <FullScreenHero />
        <FirstLaptopFeature />
        <CommunityFeature />
      </main>

      <PageFooter />
    </div>
  );
}

export default LandingPage;
