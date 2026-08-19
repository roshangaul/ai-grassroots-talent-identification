const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200/70 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
        <span>© 2026 Talent Scout AI · Grassroots Talent ID Platform</span>
        <span className="flex gap-4 mt-2 sm:mt-0">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition"
          >
            <i className="fab fa-github mr-1"></i>GitHub
          </a>
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition"
          >
            <i className="fab fa-twitter mr-1"></i>Twitter
          </a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;