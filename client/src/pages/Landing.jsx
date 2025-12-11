import { Link } from "react-router-dom";
import { Sun, Github, Mail } from "lucide-react";
import { motion } from "framer-motion";

// --- Instance 1: Full-Screen Hero Section (REFACTORED WITH CSS VARIABLES) ---
const FullScreenHero = () => (
  <section className="min-h-screen flex items-center justify-center text-center px-4 relative z-10">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.2, delayChildren: 0.3 }}
      className="flex flex-col items-center"
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeOut", duration: 0.6 }}
        className="text-[var(--text-primary)] text-xl md:text-4xl font-medium"
      >
        Welcome to
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeOut", duration: 0.6, delay: 0.2 }}
        className="flex items-center gap-2 sm:gap-6 mt-4"
      >
        <h1 className="text-[100px] font-semibold bg-gradient-to-b from-[var(--primary)] to-black bg-clip-text text-transparent">
          BookWorm
        </h1>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeOut", duration: 0.6, delay: 0.4 }}
        className="mt-6 text-[var(--text-primary)] text-base md:text-lg max-w-md"
      >
        Your next great read is just a tap away
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeOut", duration: 0.6, delay: 0.6 }}
      >


        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-10 px-10 py-4 border-2 border-[var(--primary)] text-[var(--primary)] rounded-md font-semibold text-lg hover:bg-black hover:text-white transition-all"
          onClick={() => window.location.href = '/signup'}
        >
          Sign Up
        </motion.button>
      </motion.div>
    </motion.div>
  </section>
);

// --- Instance 2: First Laptop Feature (REFACTORED WITH CSS VARIABLES) ---
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

// --- Instance 3: Community Feature (REFACTORED WITH CSS VARIABLES) ---
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

// --- Footer Component (REFACTORED WITH CSS VARIABLES) ---
const PageFooter = () => (
  <footer className="bg-[var(--primary)] text-[var(--text-primary)] pt-10 pb-6 px-6 md:px-12 mt-10 relative z-10">
    <div className="text-center mb-8">
      <p className="text-sm mb-4">
        Built with love <span className="text-[var(--secondary)]">♡</span>
      </p>
      <div className="flex justify-center gap-4 flex-wrap">
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="bg-[var(--surface-dark)] text-[var(--text-primary)] px-4 py-2 rounded-md text-sm hover:bg-[var(--surface-dark-hover)] transition flex items-center gap-2">
          <Github size={16} /> Star on GitHub
        </a>
        <a href="mailto:contact@bookworm.com" className="bg-[var(--accent-light)] text-[var(--text-on-light)] px-4 py-2 rounded-md text-sm hover:bg-[var(--accent-light-hover)] transition flex items-center gap-2">
          <Mail size={16} /> Contact Us
        </a>
      </div>
    </div>
    <div className="border-t border-[var(--text-primary)]/20 flex flex-col md:flex-row justify-between items-center pt-6 text-sm">
      <span className="font-semibold">Bookworm</span>
      <div className="flex gap-4 mt-2 md:mt-0">
        <a href="#" className="hover:underline">Privacy policy</a>
        <a href="#" className="hover:underline">Terms & conditions</a>
      </div>
    </div>
  </footer>
);

// --- Main Landing Page Component (REFACTORED WITH CSS VARIABLES) ---
function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-[var(--background)] font-['Manrope'] overflow-x-hidden overflow-y-auto relative">
      <header className="absolute top-6 right-6 flex items-center gap-3 z-20">
        <Link
          to="/login"
          className="bg-[var(--accent-light)] hover:bg-[var(--accent-light-hover)] transition-colors px-5 py-2 rounded-md font-medium text-[var(--text-on-light)] shadow"
        >
          Login
        </Link>
        <Sun className="text-[var(--text-primary)]" size={20} />
      </header>

      {/* Decorative background blobs now use CSS variables */}
      <div className="absolute -top-40 -left-52 w-[500px] h-[500px] bg-[var(--secondary)] rounded-full opacity-30 z-0"></div>
      <div className="absolute -bottom-40 -left-44 w-[378px] h-[189px] bg-[var(--secondary)] rounded-t-full opacity-30 z-0"></div>
      <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-[var(--secondary)] rounded-full opacity-20 z-0"></div>

      <main>
        <FullScreenHero />
        <FirstLaptopFeature />
        <CommunityFeature />
      </main>

      <PageFooter />
    </div>
  );
}

export default LandingPage;
