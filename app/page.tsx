import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";
import ProfileSection from "./components/ProfileSection";
import ProjectsSection from "./components/ProjectsSection";
import PhotoGallery from "./components/PhotoGallery";
import ArticlesSection from "./components/ArticlesSection";
import SignUp from "./components/SignUp";
import Footer from "./components/Footer";
const Divider = () => (
  <div className="flex justify-center">
    <div className="w-24 h-0.5 bg-teal-500 my-10 rounded"></div>
  </div>
);

export default function Home() {
  return (
    <>
      <Navbar />

      <HeroBanner />

      <ProfileSection />

        <Divider />

      <ProjectsSection />

        <Divider />

      <PhotoGallery />

        <Divider />

      <ArticlesSection />

      <SignUp />

      <Footer />
    </>
  );
}
