/** The live hero uses a checked-in image, not a missing asset or a client-side error handler.
 * Its vector format stays sharp on retina displays and transparent over the blue shader.
 */
export default function HeroArtwork(){
 return <img
   src="/gravity-chart-hero.svg"
   width={1800}
   height={700}
   alt="Blue price chart with green Long and red Short position markers"
   decoding="async"
   fetchPriority="high"
 />;
}
