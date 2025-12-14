import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Hook to prevent browser back/forward navigation
 * This works by replacing the history entry so there's nothing to go back to
 * @param {boolean} enabled - Whether to prevent navigation (default: true)
 */
export const usePreventNavigation = (enabled = true) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPathRef = useRef(location.pathname + location.search + location.hash);

  useEffect(() => {
    if (!enabled) return;

    // Allow back navigation on homepage - don't prevent it
    const isHomepage = location.pathname === '/';
    if (isHomepage) {
      // On homepage, allow normal browser navigation
      return;
    }

    // Update current path reference
    const currentUrl = location.pathname + location.search + location.hash;
    currentPathRef.current = currentUrl;

    // Replace the current history entry (removes ability to go back)
    window.history.replaceState(null, '', window.location.href);

    const handlePopState = () => {
      // Immediately replace the URL synchronously before React Router processes it
      const targetUrl = currentPathRef.current;
      window.history.replaceState(null, '', targetUrl);
      
      // Also use React Router's navigate as backup to ensure route updates
      navigate(targetUrl, { replace: true });
    };

    // Listen for popstate events - use capture phase to intercept early
    window.addEventListener('popstate', handlePopState, true);

    // Also push a state entry to ensure we have control
    window.history.pushState(null, '', window.location.href);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState, true);
    };
  }, [enabled, location.pathname, location.search, location.hash, navigate]);
};

export default usePreventNavigation;

