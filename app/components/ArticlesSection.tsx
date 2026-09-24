// Articles mock db
const articles = [
  {
    id: 1,
    title: "How to Obtain User's Email",
    date: "July 20, 2026",
    summary: "Learn the methodology of obtaining user's email address, including HTML and JavaScript.",
    tag: "Frontend",
  },
  {
    id: 2,
    title: "Web Application Vulnerabilities",
    date: "July 22, 2026",
    summary: "Learn about common web application vulnerabilities and how to prevent them.",
    tag: "Security",
  },
  {
    id: 3,
    title: "Deception",
    date: "July 24, 2026",
    summary: "Learn the art of deception.",
    tag: "Others",
  },
];

// Articles section
export default function ArticlesSection() {
  return (
    <section className="max-w-5xl mx-auto px-8 mb-16">
      <h2 className="text-center text-2xl mb-10">Latest Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div key={article.id} className="border border-zinc-700 rounded-xl p-6 flex flex-col gap-3 hover:border-teal-500 transition-colors">
            <span className="text-xs text-teal-400 font-semibold uppercase">{article.tag}</span>
            <h3 className="text-lg font-bold">{article.title}</h3>
            <p className="text-sm text-zinc-400 flex-1">{article.summary}</p>
            <p className="text-xs text-zinc-500">{article.date}</p>
          </div>
        ))}
      </div>
    </section>
  );
}