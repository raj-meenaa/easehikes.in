import { Linkedin, Instagram, Youtube, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bottom-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-t border-emerald-800">
      <div className="container mx-auto px-4 py-5">
        <div className="flex flex-row justify-between items-center gap-4">
          <Link to="/" className="flex items-center space-x-2">
            <img className="h-16" src="/common/footer1.png" alt="Ease Hikes" />
            <span className="text-2xl hidden lg:block font-bold text-emerald-400">Ease Hikes</span>
          </Link>

          <nav className="flex space-x-4">
            <Link
              to="https://in.linkedin.com/company/ease-hikes"
              target="_blank"
              className="text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out"
              aria-label="LinkedIn"
            >
              <Linkedin />
            </Link>
            <Link
              to="https://www.instagram.com/easehikes.in/"
              target="_blank"
              className="text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out"
              aria-label="Instagram"
            >
              <Instagram />
            </Link>
            <Link
              to="https://www.youtube.com/@EaseHikes"
              target="_blank"
              className="text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out"
              aria-label="YouTube"
            >
              <Youtube />
            </Link>
            <Link
              to="/"
              target="_blank"
              className="text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out"
              aria-label="Facebook"
            >
              <Facebook />
            </Link>
          </nav>
        </div>

        <div className="mt-4 border-t border-gray-700 pt-4 text-center text-sm font-medium text-gray-400 opacity-75">
          <p>&copy; {new Date().getFullYear()} Ease Hikes. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
