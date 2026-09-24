// Footer section
export default function Footer() {
  return (
    <footer className="w-full bg-zinc-900 text-zinc-400 py-8 mt-4">
      <div className="max-w-5xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm">&copy; {new Date().getFullYear()} Vu Hoang Lam. All rights reserved.</p>
        <div className="flex gap-6 text-sm">
          <a href="#about" className="hover:text-teal-400 transition-colors">About</a>
          <a href="#work" className="hover:text-teal-400 transition-colors">Work</a>
          <a href="#contact" className="hover:text-teal-400 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}