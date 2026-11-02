import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Shirt, ShieldCheck, CheckCircle2, Truck, ArrowRight, Clock, Award, Zap, Scissors, Droplets } from 'lucide-react';

interface FabricCareBlock {
  id: string;
  title: string;
  category: string;
  badge?: string;
  description: string;
  highlight: string;
  turnaround: string;
  icon: React.ReactNode;
  imageUrl: string;
}

export const ServicesSection: React.FC = () => {
  const { setIsPublicBookingOpen } = useApp();

  // Garment care blocks matching client uploaded photos and specifications
  const fabricCareBlocks: FabricCareBlock[] = [
    {
      id: 'block-sarees',
      title: 'Sarees',
      category: 'Ethnic & Silk Care',
      badge: 'Delicate Handling',
      description:
        'Fabric-appropriate care for sarees, with special attention to delicate silks, chiffons, embellishments, and pristine roll press finish.',
      highlight: 'Roll Press & Fabric Polish',
      turnaround: '5–7 Days Turnaround',
      icon: <Sparkles className="w-4 h-4 text-blue-600" />,
      imageUrl: '/images/sarees-care.jpg',
    },
    {
      id: 'block-pants-shirts',
      title: 'Pants and shirts',
      category: 'Daily & Office Wear',
      badge: 'Popular',
      description:
        'Crisp steam-pressing and hygienic washing for daily office shirts, formal trousers, casual linens, and denim wear.',
      highlight: 'Crease-Free Steam Pressing',
      turnaround: '5–7 Days Turnaround',
      icon: <Shirt className="w-4 h-4 text-blue-600" />,
      imageUrl: '/images/pants-and-shirts.jpg',
    },
    {
      id: 'block-coats',
      title: 'Coats',
      category: 'Specialty Dry Clean',
      badge: 'Master Finished',
      description:
        'Solvent dry cleaning and contour pressing for blazers, suit coats, winter overcoats, and sherwanis to maintain structured silhouette.',
      highlight: 'Shape & Lapel Preservation',
      turnaround: '5–7 Days Turnaround',
      icon: <ShieldCheck className="w-4 h-4 text-blue-600" />,
      imageUrl: '/images/coats-dryclean.jpg',
    },
    {
      id: 'block-dresses',
      title: 'Dresses',
      category: 'Designer & Party Wear',
      badge: 'Special Care',
      description:
        'Specialized care for ethnic anarkalis, festive gowns, designer dresses, and embellished outfits with complete fiber protection.',
      highlight: 'Color & Texture Safe',
      turnaround: '5–7 Days Turnaround',
      icon: <Award className="w-4 h-4 text-blue-600" />,
      imageUrl: '/images/dresses-designer.jpg',
    },
    {
      id: 'block-colouring',
      title: 'Colours Care & Removal',
      category: 'Artisan Textile Care',
      badge: 'Specialty Care',
      description:
        'Expert colour stain removal, colour bleed correction, and careful artistic textile preservation using fabric-safe techniques.',
      highlight: 'Color Bleed & Stain Neutralization',
      turnaround: '5–7 Days Turnaround',
      icon: <Droplets className="w-4 h-4 text-blue-600" />,
      imageUrl: '/images/colours-care-removal.jpg',
    },
    {
      id: 'block-darning',
      title: 'Darning',
      category: 'Garment Repair',
      badge: 'Precision Craft',
      description:
        'Repairing holes, tears, or worn fabric areas to extend garment life. Expert thread-matching and fine needle mending.',
      highlight: 'Hole & Tear Restoration',
      turnaround: '5–7 Days Turnaround',
      icon: <Scissors className="w-4 h-4 text-blue-600" />,
      imageUrl: '/images/darning-repair.jpg',
    },
    {
      id: 'block-express-48h',
      title: 'Express 48 hours delivery [priority]',
      category: 'Priority Service',
      badge: 'Priority',
      description:
        'Fast-track priority laundry and dry cleaning with a target turnaround of 48 hours for urgent office wear and emergency travel.',
      highlight: '48-Hour Priority Queue',
      turnaround: '48 Hours Target',
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      imageUrl: '/images/express-doorstep-delivery.jpg',
    },
    {
      id: 'block-doorstep',
      title: 'Doorstep Pickup and Delivery',
      category: 'Logistics',
      badge: 'Doorstep Care',
      description:
        'Convenient laundry pickup and return directly from your home or office across Patamata, Benz Circle, and Vijayawada.',
      highlight: 'Doorstep Convenience',
      turnaround: 'Scheduled Pickup & Drop',
      icon: <Truck className="w-4 h-4 text-emerald-600" />,
      imageUrl: '/images/express-doorstep-delivery.jpg',
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-slate-50/50" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-100">
            Professional Garment Services
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Tailored Care for Every Fabric
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm md:text-base mt-2.5 leading-relaxed">
            From delicate designer sarees and executive suits to priority 48-hour service, darning repair, and doorstep delivery, our seasoned specialists treat every garment with meticulous precision.
          </p>
        </div>

        {/* Uniform Grid of Dedicated Service Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {fabricCareBlocks.map((block) => (
            <div
              key={block.id}
              className="group relative rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs"
            >
              {/* Top Image Showcase */}
              <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-100">
                <img
                  src={block.imageUrl}
                  alt={block.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />

                {/* Subtle bottom gradient on image for contrast */}
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />

                {/* Category Badge overlay */}
                {block.badge && (
                  <span
                    className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm z-10 ${
                      block.badge === 'Priority'
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {block.badge}
                  </span>
                )}

                {/* For Darning: "Before" and "After" pill tags with center division line */}
                {block.id === 'block-darning' && (
                  <>
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-white/70 shadow-xs pointer-events-none z-10" />

                    <div className="absolute bottom-2.5 left-[25%] -translate-x-1/2 z-20">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-slate-900/85 backdrop-blur-xs border border-white/20 shadow-xs">
                        Before
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 right-[25%] translate-x-1/2 z-20">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-blue-600 border border-blue-400/30 shadow-xs">
                        After
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                <div>
                  {/* Category Tag */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100/80 px-2 py-0.5 rounded-md">
                      {block.category}
                    </span>
                    <div className="text-slate-400">
                      {block.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                    {block.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {block.description}
                  </p>
                </div>

                {/* Bottom Details & Booking Action */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col gap-3">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{block.highlight}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{block.turnaround}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsPublicBookingOpen(true)}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                  >
                    <span>Request Care</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Doorstep Delivery Banner */}
        <div className="mt-12 sm:mt-16 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <Truck className="w-4 h-4 shrink-0" />
              <span>Doorstep Convenience across Vijayawada</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Busy schedule? We pick up & deliver to your doorstep.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Enjoy effortless laundry pickup from Benz Circle, Patamata, Governorpet, Labbipet, Auto Nagar, and surrounding localities across Vijayawada.
            </p>
          </div>

          <button
            onClick={() => setIsPublicBookingOpen(true)}
            className="w-full md:w-auto shrink-0 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Truck className="w-4 h-4 shrink-0" />
            <span>Schedule Doorstep Pickup</span>
          </button>
        </div>
      </div>
    </section>
  );
};
