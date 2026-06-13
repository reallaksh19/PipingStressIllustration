const ENRICHED_LEARNING = {
  Expansion: {
    label: 'Tab 6 · Pipe Expansion Learning Center',
    subtitle: 'Enriched: free thermal growth, restrained expansion, support boundary conditions, pressure elongation boundary, and B31.3 expansion-stress route.',
    helpers: [
      [
        'Free thermal growth',
        'ΔL reference',
        'Free thermal growth is the reference movement a pipe would like to make when temperature changes. For first-pass teaching, linear growth is approximated as ΔL = α·L·ΔT, where α is the coefficient of linear thermal expansion, L is the reference length, and ΔT is the temperature change. If the line can move freely, this is displacement, not by itself a large thermal stress.',
        'In real piping, free growth is rarely fully free; it is steered by offsets, loops, guides, springs, shoes, anchors, friction, and connected equipment. The practical value is to estimate where the pipe wants to travel before judging restraint loads. Long hot rack lines, heater outlet lines, and exchanger connections can move enough that layout and support strategy must be planned before final stress calculation.',
        'Use free growth as the starting point for 319-style flexibility thinking and Appendix C-type expansion data, not as a direct pass/fail check. Code concern begins when supports, anchors, nozzles, or terminal movements turn free growth into stress range or reaction. Exact coefficients, reference temperature, and formal-analysis triggers must be verified in the licensed project edition and owner basis.',
        'Sources: thermal expansion reference for ΔL/L = αΔT; pipe-support references for thermal-movement support function; ASME public B31.3 scope page. Licensed-code text and project expansion-coefficient tables require verification.'
      ]
    ]
  }
};
