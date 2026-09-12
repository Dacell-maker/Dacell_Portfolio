import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';
import CustomCursor from '@/components/ui/CustomCursor';
import Preloader from '@/components/ui/Preloader';
import SiteLayout from '@/components/layout/SiteLayout';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';
import { ProjectsProvider } from '@/context/ProjectsContext';
import { useIsMobile } from '@/hooks/useMediaQuery';

/** Admin is a separate chunk — visitors of the public site never download it. */
const AdminRoot = lazy(() => import('@/admin/AdminRoot'));

export default function App() {
  const isMobile = useIsMobile();

  return (
    <>
      <Preloader />
      {!isMobile && <CustomCursor />}
      <ScrollToTop />
      <Suspense fallback={null}>
        <Routes>
          <Route
            path="/"
            element={
              <ProjectsProvider>
                <SiteLayout />
              </ProjectsProvider>
            }
          >
            <Route index element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/admin/*" element={<AdminRoot />} />
        </Routes>
      </Suspense>
    </>
  );
}
