const ENRICHED_LEARNING = {
  "Static": {
    "label": "Tab 1 · Static Learning Center",
    "subtitle": "Enriched: material response, static force path, pipe-wall section behavior, stress–strain interpretation, and B31.3 route boundaries.",
    "helpers": [
      [
        "Material response",
        "elastic → plastic → fracture",
        "Static material response starts with elastic deformation, moves into yielding and plastic deformation for ductile metals, and finally reaches necking or fracture. Brittle behavior gives much less warning: deformation can remain visually small until crack growth or rupture occurs. The card should teach the stress–strain curve as a behavior map, not as a full design rule.",
        "For process piping, ductility is valuable because it gives warning and limited redistribution before rupture. Low-temperature service, brittle fracture risk, impact-test requirements, material listing, weld quality, and service environment can be as important as nominal strength. A line that looks safe by geometry still needs material suitability at design temperature.",
        "Map this to B31.3 material suitability and allowable-stress thinking: Chapter III / para. 323 family, Appendix A allowable-stress tables, design-condition logic in 301, and pressure design in 304 where wall containment is involved. This is paragraph-family navigation only; exact listed-material and impact-test wording must be verified in the licensed project edition.",
        "Sources: stress–strain and yield references; ASME public B31.3 scope page; licensed B31.3 required for material table and impact-test details."
      ],
      [
        "Static demand visual",
        "force path",
        "A static load is a load that can be idealized as steady or slowly applied. The key teaching point is the force path: where the load enters, how it travels through the pipe wall and supports, and where it reacts.",
        "In piping, static demand includes dead weight, contents, insulation, valves, internal pressure, steady terminal loads, and support reactions. The same visible deformation may have different meaning depending on whether the source is a force, pressure boundary, or imposed displacement.",
        "Route steady force-origin effects to sustained-stress logic in the 302.3.5 family. Keep pressure boundary design under 304. If the demand comes from imposed support or terminal movement, treat it as displacement/flexibility logic rather than ordinary sustained load.",
        "Sources: practical pipe-stress load-case references; ASME public B31.3 scope page; licensed-code verification required for final equations."
      ],
      [
        "Pipe-wall section",
        "area / section modulus",
        "A pipe wall is an annular section, not a solid bar. Area carries axial force, section modulus controls bending stress, and wall thickness controls pressure containment and local robustness.",
        "Corrosion allowance, mill tolerance, selected schedule, weld/joint factor basis, and local discontinuities affect the effective section. A support-span issue may be governed by bending section properties, while a pressure-containment issue may be governed by minimum required wall thickness.",
        "Map pressure wall adequacy to 304 and selected thickness/material allowable basis. Map longitudinal force and bending behavior to sustained or occasional routes, and flexibility/SIF detail realism to 319 and B31J or legacy Appendix D where applicable.",
        "Sources: pipe-section mechanics references; pressure-design practical notes; ASME public B31.3 scope page."
      ],
      [
        "Stress–strain curve",
        "behavior map",
        "The stress–strain curve shows elastic slope, yield onset, plastic deformation, strain hardening, ultimate strength, and rupture for ductile materials. It also contrasts with brittle response, where rupture may occur with little plastic warning.",
        "For piping, this curve explains why allowable-stress design, shakedown, local yielding, fatigue range, and brittle-fracture caution are different ideas. It should not be used as a direct substitute for pipe-code stress equations, but it is an essential mental model for what failure looks like.",
        "B31.3 normally routes routine design through allowable stresses, pressure design, sustained/occasional stress limits, displacement stress range, and material rules rather than requiring the user to trace a full stress–strain curve for each line. Use the curve as mechanism background, then select the paragraph family.",
        "Sources: stress–strain curve and yield references; Little P.Eng stress-category explanations; ASME public B31.3 scope page."
      ],
      [
        "B31.3 lens for static behavior",
        "route boundary",
        "Static behavior in the app is the foundation: it teaches force, deformation, section behavior, and material response before the learner sees code categories.",
        "A practical piping engineer does not ask only whether a pipe is strong. They ask whether pressure containment, sustained weight stress, occasional event stress, displacement range, support reaction, and nozzle load have each been routed correctly.",
        "High-level map: 301 design conditions, 304 pressure design, 302.3.5 sustained/displacement families, 302.3.6 occasional family, 319 flexibility, 321 supports, 323 materials, and Appendix A allowables. Educational only; verify exact wording and equations in the licensed edition.",
        "Sources: ASME public B31.3 scope page; practical pipe-stress references; licensed B31.3 required for final project use."
      ]
    ]
  },
  "Fatigue": {
    "label": "Tab 2 · Fatigue Learning Center",
    "subtitle": "Enriched: stress range, cycle count, weld/detail hotspots, S–N limitations, vibration/cyclic warnings, and B31.3 fatigue-routing boundaries.",
    "helpers": [
      [
        "Stress range Δσ",
        "range, not peak",
        "Fatigue is governed by repeated stress range, not just one maximum static stress. A lower stress repeated many times can be more damaging than a larger one-time load, especially at a notch or weld detail.",
        "In piping, stress range can come from startup/shutdown thermal cycles, pressure pulsation, vibration, slugging, relief events, equipment movement, or repeated support movement. The UI should show the range between states rather than only the highest instantaneous stress.",
        "Map ordinary thermal cycling to displacement stress-range / flexibility logic in the 302.3.5 and 319 families. Dynamic vibration or severe cyclic service may require project-specific fatigue assessment beyond this teaching card.",
        "Sources: fatigue testing/S–N references; WhatIsPiping cyclic and load-case references; ASME public B31.3 scope page."
      ],
      [
        "Cycles N",
        "count matters",
        "Fatigue life depends strongly on the number of cycles. S–N curves plot stress amplitude or range against cycles to failure, usually on logarithmic scales, so small stress-range changes can matter significantly over many cycles.",
        "Process piping may see a few major thermal cycles, many pump starts, continuous machine vibration, or millions of pulsation cycles. The same line can be acceptable for occasional startup cycles and unacceptable for continuous vibration.",
        "For B31.3 teaching, connect N to expansion stress range and cycle-factor philosophy, and flag severe-cyclic/vibration conditions for owner or specialist review. Exact fatigue wording and cycle factors must be verified in the licensed edition.",
        "Sources: S–N/fatigue references; practical piping vibration/cyclic references; licensed B31.3 required for exact cyclic treatment."
      ],
      [
        "Weld toe / notch hotspot",
        "local detail",
        "Fatigue cracks usually initiate where stress range is locally amplified: weld toes, branch intersections, socket welds, sharp transitions, attachments, corrosion pits, or surface defects.",
        "Small-bore connections, thermowells, drains, vents, instrument branches, clamps, shoes, and branch welds deserve special attention when vibration or cyclic loading exists. A global line stress can look acceptable while a local detail is the actual fatigue risk.",
        "Map geometry/detail realism to flexibility and stress-intensification context such as 319 and B31J or legacy Appendix D where applicable. For vibration-prone or severe cyclic details, project procedures and specialist fatigue methods may govern.",
        "Sources: welded-joint fatigue references; small-bore/vibration practical references; B31J/SIF basis requires project verification."
      ],
      [
        "S–N curve limitation",
        "screening boundary",
        "An S–N curve is a simplified fatigue model based on repeated test data. It is useful for teaching stress range versus cycles, but it does not automatically include every weld quality, residual stress, corrosion, mean stress, temperature, or vibration effect.",
        "For piping, this limitation matters because field fatigue often involves local supports, branch details, flow-induced vibration, acoustic excitation, pulsation, or corrosion-fatigue interaction. A teaching S–N plot is a warning tool, not a complete plant-life calculation.",
        "Keep this card as an escalation boundary. B31.3 paragraph-family routing can identify cyclic and flexibility concerns, but detailed fatigue evaluation may need owner standards, vendor rules, FEA, vibration measurement, or specialist methods.",
        "Sources: fatigue and welded-joint references; practical piping vibration references; ASME public B31.3 scope page."
      ],
      [
        "B31.3 fatigue / cyclic map",
        "cyclic route",
        "The fatigue map tells the learner to ask two questions: what is cycling, and where is the local stress raiser? Repeated range plus notch/detail sensitivity is the core warning pattern.",
        "In piping, thermal expansion cycles, pressure pulsation, reciprocating equipment, flow-induced vibration, relief/slug events, and support movement all create different cyclic stories. The mitigation may be routing flexibility, support change, pulsation control, damping, detail redesign, or inspection.",
        "High-level B31.3 map: severe cyclic conditions and vibration cautions in the 300/301 family, displacement stress range in 302.3.5, flexibility analysis in 319, expansion range context in 319.4.4, and B31J/SIF detail realism where applicable. Verify licensed edition and owner criteria.",
        "Sources: fatigue testing/S–N references; practical piping vibration and small-bore references; ASME public B31.3 scope page."
      ]
    ]
  },
  "Stress Pt": {
    "label": "Tab 3 · Stress Components Learning Center",
    "subtitle": "Enriched: Cartesian stress notation, tensor/sign convention, pipe-coordinate translation, and B31.3 theory-only boundary.",
    "helpers": [
      [
        "Cartesian stress state",
        "theory only",
        "A stress element is a local bookkeeping device: component names only mean something after face normal and component direction are declared. The same physical stress state can be represented by different component values after coordinate rotation.",
        "In piping, this prevents mixing plant global directions, local pipe axes, and nozzle-load signs. A centerline model still has to be translated into pipe-local meaning before a result is called hoop, longitudinal, bending, or torsion.",
        "B31.3 does not normally use a raw Cartesian tensor as a routine acceptance input. Translate the physical component and load source first, then route to 304, 302.3.5, 302.3.6, 319, or related families as applicable.",
        "Sources: LibreTexts stress tensor; Little P.Eng stress categories; WhatIsPiping basics; ASME public B31.3 scope page."
      ],
      [
        "Normal stress σx / σy",
        "normal stress",
        "σx and σy are normal stresses acting perpendicular to their corresponding Cartesian faces. Their meaning changes with the selected axes.",
        "A vertical-looking component is not automatically hoop stress. Hoop is circumferential pipe-local stress; longitudinal is along the pipe axis. First decide whether the sketch is a square stress element or a pipe element.",
        "Pressure containment routes to 304; force-origin longitudinal behavior routes to sustained/occasional families; restrained movement routes to flexibility/displacement logic. Generic σx/σy remains theory-only until translated.",
        "Sources: LibreTexts stress tensor and coordinate transformation; Little P.Eng route discussion; ASME public B31.3 scope."
      ],
      [
        "Shear stress τxy",
        "shear / torsion bridge",
        "τxy is shear traction acting tangentially on a face. Paired shear components are part of equilibrium under ordinary continuum assumptions.",
        "In piping, the useful bridge is torsion and local interaction: twisted spools, eccentric branch loads, skewed restraints, and compact equipment connections can create shear-related behavior.",
        "B31.3 does not use classroom τxy as a standalone pass/fail variable. Identify whether the physical effect is torsion, branch local behavior, sustained/occasional contribution, or flexibility detail, then follow the route.",
        "Sources: LibreTexts stress tensor; WhatIsPiping basics; Little P.Eng pipe-stress types; vendor B31J/torsion notes require project verification."
      ],
      [
        "Tensor and sign convention",
        "axis discipline",
        "The stress tensor is an organized set of directional tractions. Sign convention matters because tension, compression, and shear sense can be misread when positive directions are not stated.",
        "Good sign discipline prevents confusion between global model loads, local elbow axes, support movements, and nozzle-load tables. Elbows and offsets rotate local meaning along the centerline.",
        "This is a theory bridge, not a code acceptance step. B31.3 routes assume the engineer has identified the physical direction of pressure, axial force, bending, torsion, and imposed movement correctly.",
        "Sources: LibreTexts stress tensor; WhatIsPiping model/result context; Little P.Eng B31.3 stress-category discussion."
      ],
      [
        "B31.3 theory-only lens",
        "mechanics → code route",
        "Mechanics describes stress state; B31.3 design work starts after that state is translated into pipe-relevant components and load categories.",
        "Ask: what physical component is this, what created it, and which code route should it enter? Circumferential pressure stress, longitudinal force/bending, and restrained movement do not share the same route.",
        "Use this as paragraph-family navigation only. ASME publicly describes B31.3 process-piping scope, but detailed limits and equations must be verified in the licensed project edition.",
        "Sources: ASME public B31.3 scope page; Little P.Eng stress categories; WhatIsPiping basics; LibreTexts theory foundation."
      ]
    ]
  },
  "Pipe Stress": {
    "label": "Tab 4 · Pipe Stress Learning Center",
    "subtitle": "Enriched: pipe cylindrical coordinates, hoop pressure stress, longitudinal stress and bending, torsional shear, and B31.3 route selection.",
    "helpers": [
      [
        "Pipe cylindrical coordinates",
        "σθ / σL / σr / τt",
        "A pipe wall is naturally taught in cylindrical coordinates: hoop σθ, longitudinal σL, radial σr, and torsional shear τt. Thin-wall teaching often treats σr as small, but this is a teaching assumption.",
        "Pipe stress switches between centerline beam behavior and local wall meaning. Pressure creates shell-type components; weight, supports, imposed movement, and moments create longitudinal bending, axial force, and torsion.",
        "Use cylindrical coordinates as the translation layer. Pressure containment routes to 304; force-origin longitudinal behavior to sustained/occasional; imposed movement to 319 displacement/flexibility logic.",
        "Sources: thin-wall cylinder references; WhatIsPiping basics; Little P.Eng pipe stress categories; ASME public B31.3 scope."
      ],
      [
        "Hoop stress σθ",
        "pressure design",
        "Hoop stress is circumferential membrane tension caused by internal pressure. In thin-wall teaching it is often approximated by P·D/2t or P·r/t, larger than closed-end axial pressure stress.",
        "Hoop stress is managed mainly by pressure design, wall thickness, corrosion allowance, pressure rating, material allowable, and temperature basis. Moving a support does not remove hoop stress.",
        "Map hoop-type containment to the 304 pressure-design family. Do not present the thin-wall teaching formula as the licensed B31.3 equation for every component.",
        "Sources: thin-wall stress references; Little P.Eng pressure-design discussion; ASME public B31.3 scope."
      ],
      [
        "Longitudinal stress σL + bending",
        "sustained / occasional / range",
        "Longitudinal stress includes pipe-axis pressure contribution, direct axial force, and bending from moments. The route changes with source even when direction is the same.",
        "Supports, valves, contents, insulation, wind/seismic cases, nozzle stiffness, and thermal restraint all show up in this family. A line can be thick enough for pressure yet poor in sustained span or nozzle reaction.",
        "Map force-origin longitudinal effects to sustained/occasional families. Keep pressure wall design under 304. If bending comes from restrained thermal movement, route to displacement/flexibility such as 319.",
        "Sources: thin-wall axial stress references; WhatIsPiping basics; Little P.Eng sustained/occasional discussions; ASME public scope."
      ],
      [
        "Torsional shear τt",
        "twisting / shear",
        "Torsional shear is wall shear caused by twisting moment around the pipe axis. It is not hoop tension and not ordinary longitudinal normal stress.",
        "Torsion can come from eccentric loads, branch geometry, skewed restraints, constrained rotations, and compact equipment connections. Ask where the torque came from and whether the modeled path is physical.",
        "Treat this as physical meaning and routing, not a universal torsion pass/fail formula. B31J/SIF and software/edition treatment must be verified before compliance statements.",
        "Sources: WhatIsPiping basics; Little P.Eng pipe-stress categories; vendor B31J/torsion notes require project verification."
      ],
      [
        "B31.3 pipe-stress lens",
        "route map",
        "A pipe section can carry hoop, longitudinal, bending, radial, and torsional components together. Do not collapse them into one generic equivalent-stress rule before source and category are known.",
        "Mitigations differ: wall thickness for pressure, support layout for sustained bending, flexibility for thermal movement, and local detail review for branches/nozzles.",
        "High-level map: 304 pressure design; 302.3.5 sustained/displacement; 302.3.6 occasional; 319 flexibility; B31J or legacy Appendix D for detail realism. Educational only.",
        "Sources: Little P.Eng categories; WhatIsPiping basics; ASME public B31.3 scope; vendor B31J guidance requires verification."
      ]
    ]
  },
  "Loads": {
    "label": "Tab 5 · Load Types Learning Center",
    "subtitle": "Enriched: classify the physical source first, then route pressure, sustained force, occasional event, thermal movement, or settlement correctly.",
    "helpers": [
      [
        "Load-source first",
        "route gateway",
        "The first question is not formula; it is what creates the load: steady force, pressure boundary, short event, or imposed movement. Source determines likely failure mode and route.",
        "A model may contain dead weight, contents, insulation, pressure, thermal growth, wind, seismic, relief thrust, hammer, slug, settlement, movement, and vibration. Treating them as generic load hides the engineering story.",
        "Map pressure to 304, steady force-origin stress to 302.3.5 sustained logic, event effects to 302.3.6, imposed movement to 319 displacement/flexibility, and supports to 321/project criteria.",
        "Sources: WhatIsPiping primary/secondary loads; WhatIsPiping load cases; ASME public B31.3 scope."
      ],
      [
        "Weight and pressure",
        "sustained / pressure",
        "Weight and pressure are both steady, but not the same route. Weight creates support reactions and bending; pressure first raises wall-containment questions and may also affect longitudinal/end-load behavior.",
        "Pipe, fluid, insulation, valves, and inline items can dominate sustained bending even in low-pressure service. Compact high-pressure spools can be pressure-thickness problems with little span sensitivity.",
        "Route pressure-boundary adequacy to 304 and weight-driven longitudinal stress to 302.3.5 sustained logic. Verify pressure-related axial/reaction treatment with project software and licensed code.",
        "Sources: WhatIsPiping load cases; ASME public B31.3 scope; practical pipe-support/load references."
      ],
      [
        "Thermal expansion",
        "displacement",
        "Thermal expansion is movement first. Free thermal growth creates displacement; restraint converts displacement into stress range and reaction.",
        "Guides, anchors, springs, friction, gaps, and equipment nozzles decide whether thermal growth is absorbed flexibly or pushed into terminals and structures.",
        "Route restrained thermal movement to 319 flexibility and displacement/expansion stress-range logic in 302.3.5. Do not route it as sustained just because it occurs during operation.",
        "Sources: WhatIsPiping primary/secondary load discussion; WhatIsPiping load cases; ASME public B31.3 scope."
      ],
      [
        "Event and settlement",
        "occasional / imposed",
        "Wind, seismic, relief thrust, water hammer, slug force, and similar short-duration actions are event loads. Settlement and terminal movement are imposed boundary displacements.",
        "An outdoor rack line may need wind/seismic occasional checks; a tank nozzle can be governed by slow settlement. Ask whether the source pushed the pipe or moved the boundary.",
        "Map force-type events to 302.3.6 occasional logic. Map settlement/support/equipment movement to 301.8/319-style movement/flexibility interpretation plus project criteria. Dynamic amplification may govern.",
        "Sources: WhatIsPiping load cases; WhatIsPiping primary/secondary loads; ASME public B31.3 scope."
      ],
      [
        "B31.3 load-classification lens",
        "classification map",
        "B31.3 teaching should be source- and failure-mode-based. The same stress number can mean different things if it comes from weight, thermal growth, or a short event.",
        "Stress reviews separate pressure, sustained, operating, expansion/displacement, occasional, test, support movement, and nozzle views. The largest number is not automatically controlling.",
        "Summary map: 301 design/load identification, 304 pressure design, 302.3.5 sustained/displacement, 302.3.6 occasional, 319 flexibility, 321 supports, Appendix A allowables, B31J/Appendix D where relevant.",
        "Sources: ASME public B31.3 scope; WhatIsPiping load cases and primary/secondary categories; practical stress-analysis references."
      ]
    ]
  },
  "Expansion": {
    "label": "Tab 6 · Pipe Expansion Learning Center",
    "subtitle": "Enriched: free thermal growth, restrained expansion, support boundary conditions, pressure elongation boundary, and B31.3 expansion-stress route.",
    "helpers": [
      [
        "Free thermal growth",
        "ΔL reference",
        "Free thermal growth is the reference movement a pipe would like to make when temperature changes. For first-pass teaching, linear growth is approximated as ΔL = α·L·ΔT. If the line can move freely, the result is displacement, not by itself a large thermal stress.",
        "In plant piping, free growth is steered by offsets, loops, guides, springs, shoes, anchors, friction, and connected equipment. Estimate where the line wants to travel before judging restraint loads, nozzle sensitivity, or support reactions.",
        "Use free growth as the starting point for 319-style flexibility thinking and Appendix C-type expansion data. Code concern begins when restraints turn free growth into stress range or reaction.",
        "Sources: thermal expansion relation references; pipe-support thermal-movement references; ASME public B31.3 scope page."
      ],
      [
        "Restrained expansion",
        "displacement stress",
        "Restrained expansion occurs when free thermal movement is blocked or partially blocked. The source is temperature-driven strain, but stress and reaction appear because boundary conditions resist that movement.",
        "The restraint can be an anchor, guide, line stop, frictional shoe, closed gap, stiff nozzle, structural contact, or equipment movement mismatch. Adequate wall thickness does not guarantee acceptable nozzle load.",
        "Route restrained thermal behavior to displacement/flexibility logic rather than sustained dead-weight logic. High-level map: 302.3.5 displacement stress-range family, 319 flexibility analysis, 319.4.4 expansion context, and owner nozzle/support limits.",
        "Sources: practical thermal expansion/support references; ASME public B31.3 scope page."
      ],
      [
        "Guides, anchors, and springs",
        "boundary function",
        "Guides steer movement, anchors fix reference points, line stops limit travel, and springs support weight while allowing vertical thermal travel. These are boundary conditions first and hardware second.",
        "A well-placed guide can direct growth into a loop; a poor anchor can trap movement against a nozzle. Friction, gaps, travel stops, and lift-off can make the real hot path nonlinear.",
        "Map support-function interpretation to 319 flexibility behavior, 301.8-style movement effects, and 321 support/restraint context. This card teaches function, not support sizing.",
        "Sources: pipe-support and spring-support references; practical thermal expansion guidance; ASME public B31.3 scope."
      ],
      [
        "Pressure elongation boundary",
        "pressure ≠ ΔT",
        "Pressure elongation and pressure-induced bend opening are not thermal expansion. A line can move or react under pressure even with no temperature change.",
        "In high-pressure, strongly restrained, or compact systems, pressure-extension effects may influence anchors, nozzles, or pressure-only displacement results. Flexible systems may absorb the same tendency as small movement.",
        "Keep pressure wall adequacy on 304. Treat pressure-induced axial movement or bend-opening consequences as pressure/flexibility interpretation that may influence sustained outputs or reactions depending on restraint and software basis.",
        "Sources: pressure-boundary references; pipe flexibility/restraint references; vendor pressure-extension/Bourdon documentation requires version verification."
      ],
      [
        "B31.3 expansion-stress lens",
        "range route",
        "Expansion stress is about cold-to-hot displacement range, flexibility, reaction, and cycle tolerance. It should not be taught as one hot operating stress snapshot.",
        "A practical model reviews expansion stress range, operating displacement, nozzle loads, anchor loads, support hot/cold loads, spring travel, guide gaps, loop flexibility, friction, and support status separately from sustained weight stress.",
        "High-level map: 301 design conditions, 302.3.5 displacement stress range, 319 flexibility analysis, 319.4.4 expansion context, 321 supports, Appendix C expansion data, and B31J/legacy Appendix D where applicable.",
        "Sources: thermal expansion references; pipe-support references; ASME public B31.3 scope page."
      ]
    ]
  },
  "Bourdon": {
    "label": "Tab 7 · Bourdon Effect Learning Center",
    "subtitle": "Enriched: pressure-driven bend opening, end-condition sensitivity, bend geometry, pressure/flexibility boundary, and B31.3 interpretation limits.",
    "helpers": [
      [
        "Pressure-driven opening",
        "pressure source",
        "A curved pressurized member can show a pressure-driven tendency to open or straighten. In the app, Bourdon effect is a qualitative analogy for pressure-induced bend movement: pressure supplies the source, curvature gives direction, and boundary conditions decide motion versus reaction.",
        "This concept is useful around elbows, return bends, compact high-pressure manifolds, and equipment connections where a pressure-only case can create unexpected displacement or reaction.",
        "Map pressure containment to 304. Treat pressure-induced bend movement as pressure/flexibility interpretation that may influence sustained-force results, reactions, or modeled displacement depending on restraint and software settings.",
        "Sources: practical Bourdon-effect piping references; vendor pressure-extension/Bourdon documentation requires version verification; ASME public B31.3 scope."
      ],
      [
        "End condition: free / guided / restrained",
        "boundary condition",
        "The same pressure-driven bend tendency has different consequences: free ends move, guided ends steer movement, restrained ends convert movement tendency into force and moment.",
        "Near equipment nozzles, allowed versus blocked movement controls whether pressure-induced bend behavior matters. A flexible route may absorb it, while a stiff skid or anchor may react it.",
        "Use this as a 301.8/319-style movement-and-flexibility interpretation map, with 304 in the background because pressure is the source. It does not certify support or nozzle acceptability.",
        "Sources: practical Bourdon and pipe-support references; vendor pressure-extension notes; licensed B31.3 and owner criteria required."
      ],
      [
        "Bend geometry: 45 / 90 / 180",
        "geometry matters",
        "Bend angle and curvature change the movement pattern. A 45° elbow, 90° elbow, and 180° return bend should not be visualized as identical.",
        "Return bends, offsets, and compact skid loops can behave differently from an isolated 90° elbow. Geometry and restraint act together, so pressure alone is not the full story.",
        "At code-map level, bend geometry matters through component pressure behavior and flexibility/SIF realism, not a separate universal Bourdon-angle acceptance rule. Use 304, 319, and B31J/legacy Appendix D context where applicable.",
        "Sources: practical Bourdon discussions; SIF/flexibility references; vendor B31J or bend-modeling documentation requires verification."
      ],
      [
        "Pressure/flexibility boundary",
        "source vs response",
        "Bourdon behavior sits at the boundary between pressure loading and flexibility response. Pressure provides the source; system flexibility and restraint decide the outcome.",
        "In a high-pressure compact system, anchor spacing, branch stiffness, nozzle stiffness, and support status can make pressure-only bend effects visible. In a flexible layout they may be small.",
        "Use a split route: 304 for pressure boundary adequacy, then 319/301.8-style flexibility and movement interpretation for system consequence. Magnitude and acceptability require project/software verification.",
        "Sources: practical Bourdon-effect references; pipe flexibility references; vendor pressure-extension/Bourdon documentation; ASME public B31.3 scope."
      ],
      [
        "B31.3 interpretation boundary",
        "educational boundary",
        "Bourdon effect explains pressure-induced behavior in curved geometry, but it is not a standalone compliance equation in this app. It is a behavior-explainer and modeling-awareness card.",
        "Ask whether the effect changes a real decision: anchor load, guide direction, nozzle reaction, support design, or pressure-only displacement interpretation. High pressure, curvature, and strong restraint raise importance.",
        "High-level map: pressure source belongs to 304; movement/reaction consequence is interpreted through sustained/flexibility context such as 302.3.5 and 319 depending on restraint. Exact route and vendor implementation require verification.",
        "Sources: ASME public B31.3 scope; practical Bourdon piping references; vendor software documentation; licensed code and owner criteria required."
      ]
    ]
  },
  "Combined": {
    "label": "Tab 8 · Combined Stress Learning Center",
    "subtitle": "Enriched: route before combination, hoop-plus-longitudinal behavior, VM/Tresca limits, screening warnings, and B31.3 combined-route map.",
    "helpers": [
      [
        "Route before combination",
        "category first",
        "Before combining stresses, select the load category route. Pressure design, sustained stress, occasional stress, and displacement range are not interchangeable, so early scalar combination can hide the controlling logic.",
        "A hot operating case may contain pressure, weight, thermal displacement, support friction, and terminal loads together. Stress review separates the source stories before deciding whether a reported scalar is meaningful.",
        "Route first: 304 pressure design, 302.3.5 sustained/displacement families, 302.3.6 occasional family, 319 flexibility, and project load combinations. Equivalent stress is interpretation support, not the first code step.",
        "Sources: Little P.Eng stress-category discussion; WhatIsPiping load cases; ASME public B31.3 scope."
      ],
      [
        "Hoop + longitudinal components",
        "σθ + σL",
        "A pressurized pipe can carry hoop stress plus longitudinal membrane, axial, bending, and torsional components. These components coexist physically, but they may not share one acceptance route.",
        "Pressure containment, support-span bending, terminal reaction, thermal restraint, and event loading can all appear in one pipe section. The learner must identify which contributor is being discussed before interpreting the combination.",
        "Pressure containment remains a 304 question; longitudinal sustained/occasional effects route through 302.3.5/302.3.6; restrained movement routes through 319 displacement/flexibility logic. Do not erase route separation.",
        "Sources: thin-wall cylinder references; Little P.Eng sustained/occasional discussion; WhatIsPiping basics; ASME public B31.3 scope."
      ],
      [
        "Von Mises and Tresca",
        "yield theories",
        "Von Mises and Tresca are educational yield-screening lenses for multiaxial stress. They help show why shear and combined components matter, but they are not universal B31.3 pass/fail rules.",
        "In piping, VM/Tresca may be useful for local FEA interpretation, nozzle or branch screening, and understanding equivalent-stress visuals. They should be labelled as screening unless a specific project method defines their use.",
        "B31.3 process-piping checks remain category-routed. Use VM/Tresca as strength-theory context, not as a replacement for pressure, sustained, occasional, displacement, or local-detail routes in the licensed code.",
        "Sources: Von Mises/Tresca practical references; Little P.Eng pipe-stress types; ASME public B31.3 scope."
      ],
      [
        "Allowable / screening warning",
        "not code-certified",
        "A combined scalar or contour can be a useful warning light, but it is not automatically the correct allowable-stress check. The result type and category must be known.",
        "A global code stress, local FEA stress, peak stress, VM contour, branch hotspot, and nozzle-load table can all be useful but are not the same decision. One plot cannot prove full compliance.",
        "Final acceptance maps to the route-specific B31.3 paragraph family and project criteria. Verify material allowables, thickness, corrosion, SIF/flexibility, support model, load cases, and owner specification.",
        "Sources: stress-classification practical references; ASME public B31.3 scope; licensed code and project criteria required."
      ],
      [
        "B31.3 combined-route map",
        "capstone route",
        "The combined-route map is ordered: classify the load, identify the component family, apply the route-specific rule, then interpret combined/local behavior.",
        "This map helps match mitigation to route: increase wall for pressure, improve supports for sustained bending, add flexibility for thermal displacement, and review local details for branch/nozzle hotspots.",
        "Summary: 304 pressure design; 302.3.5 sustained/displacement; 302.3.6 occasional; 319 flexibility; Appendix A allowables; B31J or legacy Appendix D for detail realism. Educational only.",
        "Sources: Little P.Eng categories; WhatIsPiping basics; vendor B31J guidance requiring verification; ASME public B31.3 scope."
      ]
    ]
  },
  "Review": {
    "label": "Tab 9 · Quick Challenge Learning Center",
    "subtitle": "Enriched: coordinate check, load category check, cyclic warning, answer strategy, and educational B31.3 boundary.",
    "helpers": [
      [
        "Question strategy",
        "coordinate → source → route",
        "The best review strategy is: identify the coordinate system, identify the load source, identify the component, then choose the B31.3 route. Do not jump directly to a pass/fail answer.",
        "This mirrors practical stress review: separate pressure design, sustained cases, displacement/expansion cases, occasional cases, support reactions, and terminal/nozzle loads. The explanation should be route plus assumption, not only a label.",
        "This strategy is not itself a code paragraph; it is the method for choosing the correct paragraph family such as 301, 302, 304, or 319. Exact checks require project data and licensed code.",
        "Sources: WhatIsPiping basics; Little P.Eng stress types/categories; ASME public B31.3 scope."
      ],
      [
        "Coordinate check",
        "σx vs σθ",
        "First decide whether the sketch uses Cartesian notation σx/σy/τxy or pipe-local notation σθ/σL/τt. Wrong axes create wrong answers even with correct formulas.",
        "Elbows, offsets, branches, and nozzle tables can rotate local meaning. A global vertical stress is not hoop stress unless the coordinate definition says so.",
        "Coordinate checking is a route-enabling step. Translate notation into physical pipe meaning before mapping to pressure design, sustained, occasional, or flexibility routes.",
        "Sources: LibreTexts stress tensor; WhatIsPiping model/result interpretation; Little P.Eng stress-category discussion."
      ],
      [
        "Load category check",
        "pressure / sustained / occasional / displacement",
        "After coordinate check, classify the load source. Pressure, weight, thermal restraint, settlement, and event loads follow different engineering logic.",
        "Review answers should state whether the problem is pressure containment, sustained force, short-duration occasional event, imposed movement, or fatigue warning. The visible deformation alone is not enough.",
        "Route pressure to 304, steady force to 302.3.5 sustained logic, occasional events to 302.3.6, and imposed movement to 319/displacement logic. Final equations need licensed-code verification.",
        "Sources: WhatIsPiping load cases; ASME public B31.3 scope; practical stress-category references."
      ],
      [
        "Fatigue and cyclic warning",
        "range + cycles + detail",
        "When repeated stress range and a notch or weld detail coexist, fatigue should move to the front of the review. Repetition plus local stress raiser is the warning pattern.",
        "Flag small-bore branches, thermowells, socket welds, drains, vents, instrument branches, pulsation, vibration, and repeated thermal cycling. Whole-line static stress can be acceptable while local fatigue risk remains.",
        "Map ordinary thermal cycling to displacement stress-range/flexibility logic; vibration or severe cyclic concerns may require owner criteria, field measurement, specialist fatigue, or local-detail methods beyond the teaching app.",
        "Sources: fatigue/welded-joint references; small-bore/vibration practical references; ASME public B31.3 scope."
      ],
      [
        "B31.3 review boundary",
        "educational only",
        "The review tab checks route selection and mechanism understanding. It is not a code-certified calculation engine and should not present simplified graphics as compliance proof.",
        "A real calculation still needs line data, material allowables, temperature, pressure, selected/corroded thickness, SIF/flexibility, support model, load cases, owner standards, and licensed code wording.",
        "Final map: 300/301 design basis, 302 stress limits/categories, 304 pressure design, 319 flexibility, 321 supports, Appendix A allowables, and B31J/legacy Appendix D where applicable. Verify every exact requirement in the licensed edition.",
        "Sources: ASME public B31.3 scope; practical pipe-stress references; licensed project code and owner standards required."
      ]
    ]
  }
};

function escapeEnrichedLearningText(value) {
  return String(value || '').replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
}

function activeEnrichedTabLabel() {
  const label = document.querySelector('.lesson-tabs .tab.active .tabLabel');
  return label ? label.textContent.trim() : 'Static';
}

function renderEnrichedLearning() {
  const data = ENRICHED_LEARNING[activeEnrichedTabLabel()];
  if (!data) return;
  const layer = document.getElementById('fallback-learning-panel');
  const title = document.getElementById('fallback-learning-title');
  const heading = document.getElementById('fallback-learning-heading');
  const subtitle = document.getElementById('fallback-learning-subtitle');
  const grid = document.getElementById('fallback-learning-grid');
  if (!layer || !title || !heading || !subtitle || !grid) return;
  if (document.querySelector('.learning-center-panel')) return;
  layer.hidden = false;
  title.textContent = data.label;
  heading.textContent = data.label;
  subtitle.textContent = data.subtitle;
  grid.innerHTML = data.helpers.map((helper, index) => {
    const [hTitle, route, concept, piping, b313, sources] = helper.map(escapeEnrichedLearningText);
    return `<details class="fallback-helper" ${index === 0 || hTitle.includes('B31.3') ? 'open' : ''}>
      <summary><span>${hTitle}</span><span class="fallback-helper-route"><span>${route}</span><span class="show-label">▼ Show</span><span class="hide-label">▲ Hide</span></span></summary>
      <div class="fallback-helper-body">
        <div class="fallback-cell"><b style="color:#52f0df">Concept</b><span>${concept}</span></div>
        <div class="fallback-cell"><b style="color:#55b8ff">Piping</b><span>${piping}</span></div>
        <div class="fallback-cell"><b style="color:#ffd75b">B31.3 map</b><span>${b313}</span></div>
        ${sources ? `<div class="fallback-cell"><b style="color:#b884ff">Sources</b><span>${sources}</span></div>` : ''}
      </div>
    </details>`;
  }).join('');
}

function scheduleEnrichedLearningRender() {
  setTimeout(renderEnrichedLearning, 30);
}

window.addEventListener('DOMContentLoaded', () => {
  scheduleEnrichedLearningRender();
  document.addEventListener('click', event => {
    if (event.target.closest('.lesson-tabs .tab')) scheduleEnrichedLearningRender();
  });
  const root = document.getElementById('root');
  if (root) new MutationObserver(scheduleEnrichedLearningRender).observe(root, { childList: true, subtree: true, attributes: true });
});
