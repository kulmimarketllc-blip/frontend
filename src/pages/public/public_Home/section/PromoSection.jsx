import React from 'react';
import { useNavigate } from 'react-router-dom';
import PromoCard from '../../../../components/marketplace/PromoCard';

const PromoSection = () => {
  const navigate = useNavigate();
  return (
    <section className="px-3 py-8 min-[640px]:px-4 min-[900px]:px-8 min-[900px]:py-10">
      <div className="container mx-auto">
      <div className="grid grid-cols-1 gap-4 min-[768px]:grid-cols-[2fr_1fr]">
        <PromoCard 
          icon={'\u{1F4F1}'} 
          tag="New Arrivals" 
          title="Latest Electronics" 
          subtitle="Up to 40% Off" 
          variant="big"
          image="/NewArrivals.png"
          imageClass="h-[65%] -right-4 -bottom-2 max-w-[50%] sm:h-[85%] sm:-right-6 sm:-bottom-4 sm:max-w-[58%] lg:h-[110%] lg:-right-10 lg:-bottom-8 lg:max-w-[65%]"
          onButtonClick={() => navigate('/search?q=electronics')}
        />
        <div className="flex flex-col gap-4">
          <PromoCard icon={'\u{1F457}'} tag="Fashion Week" title="Style Sale" subtitle="From $9.99" variant="small" buttonText="Explore" onButtonClick={() => navigate('/search?q=fashion')} />
          <PromoCard 
            icon={'\u{1F381}'} 
            tag="Gift Ideas" 
            title="Gift Bundles" 
            subtitle="Curated sets" 
            variant="small2" 
            buttonText="Browse" 
            image="/GiftIdeas.png"
            imageClass="h-[100%] max-w-[50%] -right-4 -bottom-4"
            onButtonClick={() => navigate('/search?q=gifts')}
          />
        </div>
      </div>
      </div>
    </section>
  );
};

export default PromoSection;
