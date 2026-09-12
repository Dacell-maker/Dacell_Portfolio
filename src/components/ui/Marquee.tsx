import { marqueeTech } from '@/data/site';

/**
 * Seamless infinite marquee. The list is duplicated and the track translates
 * -50%, so the loop has no visible seam. Pure CSS = zero re-renders.
 */
export default function Marquee() {
  const items = [...marqueeTech, ...marqueeTech];

  return (
    <div className="marquee-wrap" aria-hidden="true">
      <div className="marquee">
        {items.map((tech, index) => (
          <span className="marquee__item" key={`${tech}-${index}`}>
            {tech}
            <i className="marquee__sep" />
          </span>
        ))}
      </div>
    </div>
  );
}
