const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200/70 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
        <span>© 2026 TalentAI · Grassroots ID Platform</span>
        <span className="flex gap-4">
          <a href="#" className="footer-link">
            <i className="fab fa-github mr-1"></i>GitHub
          </a>
          <a href="#" className="footer-link">
            <i className="fab fa-twitter mr-1"></i>Twitter
          </a>
        </span>
      </div>
    </footer>
  )
}

export default Footer