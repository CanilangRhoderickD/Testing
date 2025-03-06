import { motion } from "framer-motion";
import ProfileCard from "@/components/creators/profile-card";

const creators = [
  {
    name: "JEVERLY RUTH AMOY CABINTO",
    role: "Lead Developer",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=jeverly"
  },
  {
    name: "HARRY ANN MARIELLE ALJAS FAGEL",
    role: "Game Designer",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=harry"
  },
  {
    name: "FIARRAH MAE PALACI ULAT",
    role: "Content Strategist",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=fiarrah"
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4"
        >
          <h1 className="text-4xl font-bold mb-4">
            APULA: A Web-Based Application to Educate and Empower Residents in Fire
            Prevention Through Engaging Games
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn essential fire safety skills through interactive games and
            simulations. Join us in creating a safer community.
          </p>
        </motion.div>
      </section>

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Meet the Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {creators.map((creator) => (
              <motion.div
                key={creator.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ProfileCard {...creator} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Project Overview</h2>
          <div className="prose prose-lg mx-auto">
            <p>
              Fire incidents are a persistent threat to the safety and well-being
              of individuals, businesses, and communities. This project aims to
              address this challenge through an innovative, gamified approach to
              fire safety education.
            </p>
            <p>
              Our platform combines educational content with engaging gameplay
              mechanics to make learning about fire prevention both effective and
              enjoyable. Through interactive modules, real-life scenarios, and a
              reward system, users can develop essential skills while tracking
              their progress.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
