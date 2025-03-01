
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link 
                to="/" 
                className="text-2xl font-bold text-foreground hover:text-teal-500 transition-colors duration-300 inline-block mb-4"
              >
                <span className="text-teal-500">chati</span>wy<span className="text-coral-500">.</span>
              </Link>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                A secure platform for private, one-on-one text and image-based conversations, 
                designed to foster meaningful connections.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 transition-colors">
                    Terms & Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 transition-colors">
                    Contact us
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Features</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 transition-colors">
                    Private Chat
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 transition-colors">
                    Image Sharing
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 transition-colors">
                    VIP Membership
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-600 dark:text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Chatiwy. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
