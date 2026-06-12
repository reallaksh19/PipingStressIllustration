import { COLORS, LabState, Status } from './types';

export function staticStatus(s: LabState): Status {
  const l = s.staticLoad;
  const ductile = s.material === 'ductile';
  const tension = s.staticDemand === 'tension';

  if (ductile) {
    if (l < 45) return { badge: 'Elastic response', color: COLORS.green, title: 'Mostly recoverable deformation', copy: `${tension ? 'Tension' : 'Compression'} demand is in the elastic teaching range.` };
    if (l < 72) return { badge: 'Near teaching limit', color: COLORS.yellow, title: 'Yielding is approaching', copy: 'Sy marks the start of permanent deformation for ductile material in this simplified engineering curve.' };
    return { badge: 'Yielding likely', color: COLORS.orange, title: tension ? 'Plastic elongation / necking' : 'Plastic compression / buckling tendency', copy: tension ? 'Ductile tension shows elongation, yield zone and necking at high demand.' : 'Ductile compression shows shortening, wrinkles and buckling/local collapse tendency.' };
  }

  if (tension) {
    if (l < 45) return { badge: s.flawEnabled ? 'Flaw shown · low demand' : 'Elastic response', color: s.flawEnabled ? COLORS.yellow : COLORS.green, title: s.flawEnabled ? 'Flaw present, demand still low' : 'Little visible deformation', copy: s.flawEnabled ? 'The notch is visible, but the stress marker is still low. It is a warning feature, not automatic failure.' : 'Brittle response remains mostly elastic until crack/fracture sensitivity becomes visible.' };
    if (l < 72) return { badge: 'Crack-sensitive', color: COLORS.yellow, title: 'Tensile crack opening risk', copy: 'Brittle tension can open flaws with little plastic warning.' };
    return { badge: 'Fracture risk', color: COLORS.red, title: 'Sudden crack opening shown', copy: 'Brittle tension is visualized as crack/fracture risk, not ductile yielding.' };
  }

  if (l < 45) return { badge: 'Elastic response', color: COLORS.green, title: 'Compression with little visible change', copy: 'Brittle compression is not automatically tensile-crack sensitive at low demand.' };
  if (l < 72) return { badge: 'Crushing / splitting', color: COLORS.orange, title: 'Local compression damage appears', copy: 'Brittle compression is shown as crushing/splitting rather than tensile necking.' };
  return { badge: 'Fracture risk', color: COLORS.red, title: 'Compression-driven break-up', copy: 'High brittle compression is represented by crushing, splitting or diagonal fracture.' };
}
