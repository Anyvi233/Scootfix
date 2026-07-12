// src/lib/guides-data.ts
// Static guides content — Installation Guides & Maintenance Tips for EV scooter parts

export type GuideCategory = "installation" | "maintenance";

export interface Guide {
  slug: string;
  category: GuideCategory;
  title: string;
  subtitle: string;
  description: string;
  readTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  tags: string[];
  icon: string;
  steps: {
    title: string;
    content: string;
    tip?: string;
    warning?: string;
  }[];
  tools?: string[];
  warnings?: string[];
}

export const GUIDES: Guide[] = [
  // ─── INSTALLATION GUIDES ───────────────────────────────────────────────────
  {
    slug: "install-ev-battery-pack",
    category: "installation",
    title: "How to Install an EV Battery Pack",
    subtitle: "Step-by-step guide for safely replacing your scooter's lithium battery",
    description: "Learn how to safely remove your old battery and install a new one in your electric scooter, with all safety precautions covered.",
    readTime: "12 min",
    difficulty: "Intermediate",
    tags: ["Battery", "Lithium-Ion", "Safety"],
    icon: "🔋",
    tools: ["Phillips screwdriver", "Hex key set (3mm, 5mm)", "Torque wrench", "Insulated gloves", "Voltmeter"],
    warnings: [
      "Always power off and disconnect the scooter before working on the battery.",
      "Never short-circuit battery terminals — risk of fire.",
      "Wear insulated gloves throughout the procedure."
    ],
    steps: [
      {
        title: "Power Down the Scooter Completely",
        content: "Turn off the scooter using the main power switch. If available, hold the power button for 5 seconds to trigger a full power-off cycle. Remove the key and wait 60 seconds before touching any components to allow residual charge to dissipate.",
        tip: "Some scooters have a separate battery isolation switch — check your manual and disable it."
      },
      {
        title: "Access the Battery Compartment",
        content: "Locate the battery compartment — typically under the foot platform or rear body panel. Use your Phillips screwdriver to remove the 4–6 panel screws. Gently pry the panel loose using a plastic trim tool to avoid scratching the body.",
        tip: "Keep panel screws in a small magnetic tray to avoid losing them."
      },
      {
        title: "Disconnect the Battery Connectors",
        content: "You will see one or two main connector plugs. Always disconnect the negative (black) connector first, then the positive (red). Squeeze the connector tabs gently and pull straight out — never yank sideways.",
        warning: "Do not allow the bare terminals to touch each other or any metal surface."
      },
      {
        title: "Remove the Old Battery Pack",
        content: "Unscrew the battery mounting bolts (usually 4 bolts, 5mm hex). Slide the battery pack out carefully — battery packs are heavy (5–15 kg). Use both hands and keep your back straight to avoid injury.",
        tip: "Take a photo of all connector positions before removal for easy reference."
      },
      {
        title: "Install the New Battery Pack",
        content: "Slide the new battery into the compartment, aligning the mounting holes. Tighten the mounting bolts to 8–10 Nm using your torque wrench. Do not overtighten — this can crack the battery casing.",
      },
      {
        title: "Reconnect the Connectors",
        content: "Connect the positive (red) connector first, then the negative (black). Press firmly until you hear a click confirming a secure connection. Gently tug to verify each connector is locked.",
        tip: "Use a voltmeter to verify voltage across the positive and negative terminals matches the rated battery voltage (e.g. 48V, 72V)."
      },
      {
        title: "Reassemble and Test",
        content: "Replace the panel, tighten all screws, and power the scooter on. Check the battery indicator shows the expected charge level. Take a short test ride at low speed and monitor for any unusual sounds, heat, or warning lights.",
        tip: "Charge the new battery to 100% before your first full-distance ride."
      }
    ]
  },
  {
    slug: "install-front-brake-caliper",
    category: "installation",
    title: "Installing a Front Disc Brake Caliper",
    subtitle: "Full replacement guide for hydraulic disc brake calipers",
    description: "Replace a worn or damaged front brake caliper on your EV scooter for reliable, confident stopping power.",
    readTime: "20 min",
    difficulty: "Advanced",
    tags: ["Brakes", "Hydraulic", "Safety"],
    icon: "🔧",
    tools: ["8mm & 10mm hex keys", "Brake bleed kit", "DOT4 brake fluid", "Torque wrench", "Ratchet & socket set", "Brake cleaner spray"],
    warnings: [
      "Hydraulic brake work must be done carefully — air in brake lines causes brake failure.",
      "Never press the brake lever when the caliper is removed.",
      "Brake fluid is corrosive — keep away from painted surfaces."
    ],
    steps: [
      {
        title: "Secure the Scooter",
        content: "Place the scooter on its centre stand on level ground. If the scooter doesn't have a centre stand, use a motorcycle paddock stand or lean it against a wall safely. Ensure it cannot fall during work."
      },
      {
        title: "Remove the Wheel (If Required)",
        content: "For some scooters, wheel removal is necessary. Loosen the axle nut, support the wheel, and slide out the axle. Rest the wheel gently on a cloth to avoid scratching the disc.",
        tip: "Mark the direction of wheel rotation with a chalk mark before removal."
      },
      {
        title: "Detach the Old Caliper",
        content: "Locate the two caliper mounting bolts (usually 8mm hex). Remove them and carefully slide the caliper off the rotor. Do not press the brake lever now — the pistons could pop out.",
        warning: "Hang the old caliper with a zip tie to avoid hanging it by the brake line — this can damage the hose."
      },
      {
        title: "Disconnect the Brake Line",
        content: "Place a rag under the brake line banjo bolt to catch fluid. Unscrew the banjo bolt carefully and plug the hose end immediately with a rubber cap or your finger to prevent air from entering the system.",
      },
      {
        title: "Mount the New Caliper",
        content: "Connect the brake line to the new caliper — insert the banjo bolt with a new copper crush washer on each side and tighten to 25 Nm. Slide the caliper over the rotor and align the mounting holes. Torque the caliper bolts to 30 Nm.",
        tip: "Ensure the rotor sits centered in the caliper slot — equal gap on each side."
      },
      {
        title: "Bleed the Brake System",
        content: "Top up the brake reservoir with fresh DOT4 fluid. Attach the bleed kit to the bleed nipple. Pump the lever slowly while opening the nipple to push air out, then close it before releasing the lever. Repeat until no air bubbles appear in the output fluid.",
        tip: "Keep the reservoir topped up at all times during bleeding to avoid introducing more air."
      },
      {
        title: "Test Braking Performance",
        content: "Pump the brake lever 10 times. It should feel firm with no sponginess. Walk the scooter and test braking at low speed. Listen for any rubbing or clicking — if present, check caliper alignment.",
        warning: "Never ride at speed until braking is tested and confirmed firm and reliable."
      }
    ]
  },
  {
    slug: "replace-ev-controller",
    category: "installation",
    title: "Replacing an EV Motor Controller",
    subtitle: "Diagnose & swap a faulty motor controller safely",
    description: "A failing motor controller causes loss of power, jerky acceleration, or no movement at all. This guide walks through safe replacement.",
    readTime: "25 min",
    difficulty: "Advanced",
    tags: ["Controller", "Motor", "Electronics"],
    icon: "⚡",
    tools: ["Phillips & flathead screwdrivers", "Wire crimping tool", "Heat shrink tubing", "Multimeter", "Electrical tape"],
    warnings: [
      "Disconnect the battery fully before handling the controller.",
      "Label every wire before disconnecting — incorrect wiring can permanently damage the new controller.",
      "Static discharge can damage electronics — ground yourself first."
    ],
    steps: [
      {
        title: "Diagnose the Controller Fault",
        content: "Common signs of a faulty controller: no throttle response, error codes on the display, overheating, or burning smell. Use a multimeter to measure battery voltage at the controller input — if voltage is present but the motor doesn't respond, the controller is likely faulty."
      },
      {
        title: "Locate and Access the Controller",
        content: "Controllers are typically in the body under the seat or in the deck compartment. Remove the seat and outer panels using the appropriate screwdrivers. The controller looks like a rectangular aluminum box with multiple wire harnesses attached."
      },
      {
        title: "Photograph All Wiring",
        content: "Before disconnecting anything, photograph all wire harness positions from multiple angles. This is crucial — even experienced technicians refer to photos during reinstallation.",
        tip: "Label wires with masking tape and a marker: Phase A, Phase B, Phase C, Battery+, Battery−, Throttle, etc."
      },
      {
        title: "Remove the Old Controller",
        content: "Disconnect all harness plugs by squeezing the locking tabs. Remove the controller mounting screws and slide it out. Note how the hall sensor wires (usually 5-wire harness) are routed."
      },
      {
        title: "Mount the New Controller",
        content: "Place the new controller in the same position and secure with mounting screws. Ensure ventilation holes are not blocked — controllers can reach 60°C under heavy load and need airflow."
      },
      {
        title: "Reconnect All Harnesses",
        content: "Using your photos and labels, reconnect each harness in order. The three thick wires (motor phase wires) must match the original color mapping exactly. Incorrect phase wiring causes the motor to run backwards or vibrate violently.",
        warning: "Double-check the battery positive and negative connections — reversing them will instantly destroy the new controller."
      },
      {
        title: "Power On and Test",
        content: "Reconnect the battery and power on the scooter with the wheels off the ground. Slowly apply throttle and verify the wheel spins in the correct direction. Listen for smooth motor operation — no grinding or clicking."
      }
    ]
  },
  {
    slug: "install-led-headlight",
    category: "installation",
    title: "Upgrading to LED Headlights",
    subtitle: "Brighter, more efficient lighting for night riding safety",
    description: "Swap your stock halogen or dim LED headlight for a high-power LED unit for dramatically improved visibility and style.",
    readTime: "10 min",
    difficulty: "Beginner",
    tags: ["Lighting", "LED", "Safety", "Upgrade"],
    icon: "💡",
    tools: ["Phillips screwdriver", "Flathead screwdriver", "Electrical tape", "Wire connectors"],
    steps: [
      {
        title: "Power Off the Scooter",
        content: "Turn off the scooter completely and remove the key. Wait 30 seconds before touching any electrical components."
      },
      {
        title: "Remove the Headlight Assembly",
        content: "Locate the 2–4 screws holding the headlight bezel or housing. Remove them and gently pull the assembly forward. Disconnect the connector plug behind the bulb.",
        tip: "If the housing is sealed with foam tape, use a plastic pry tool to avoid scratching."
      },
      {
        title: "Swap the Bulb or Module",
        content: "For replaceable bulb types: twist the old bulb counterclockwise and pull out. Insert the new LED bulb and twist clockwise to lock. For module-type headlights: unplug the old module and plug in the new one."
      },
      {
        title: "Test Before Reassembly",
        content: "Reconnect the power plug and power on the scooter to test the headlight. Check high beam and low beam modes if applicable. Verify the light pattern is wide and even.",
        tip: "Aim the headlight downward slightly — too high will blind oncoming traffic."
      },
      {
        title: "Reassemble and Secure",
        content: "Reinstall the housing and tighten all screws. Clean the lens with a microfiber cloth for maximum brightness."
      }
    ]
  },

  // ─── MAINTENANCE TIPS ──────────────────────────────────────────────────────
  {
    slug: "ev-battery-maintenance",
    category: "maintenance",
    title: "EV Battery Maintenance Best Practices",
    subtitle: "Extend your battery life by 2–3x with proper care routines",
    description: "Proper battery maintenance is the single most impactful thing you can do to extend the range and lifespan of your electric scooter. Follow these tips to protect your investment.",
    readTime: "8 min",
    difficulty: "Beginner",
    tags: ["Battery", "Longevity", "Charging", "Range"],
    icon: "🔋",
    steps: [
      {
        title: "Keep Charge Between 20% and 90%",
        content: "Lithium-ion batteries degrade fastest at extreme charge states. Avoid letting the battery drop below 15% regularly, and try not to charge to 100% every cycle unless you need full range for that ride.",
        tip: "Most modern chargers have a 80% charge mode — enable it in your scooter's app if available."
      },
      {
        title: "Never Leave the Battery Fully Depleted",
        content: "A fully discharged lithium battery enters a deep discharge state that can cause irreversible cell damage. If your scooter shows a low battery warning, charge it within 24 hours.",
        warning: "Storing a depleted battery for more than 2 weeks can permanently reduce its capacity."
      },
      {
        title: "Use the Official Charger Only",
        content: "Third-party chargers may have incorrect voltage or current profiles that degrade cells faster or cause overheating. Always use the manufacturer-supplied charger or a certified OEM replacement.",
        tip: "If you need a replacement charger, check the output voltage (e.g. 54.6V for a 48V pack) and current rating match exactly."
      },
      {
        title: "Avoid Charging in Extreme Temperatures",
        content: "Charging below 5°C causes lithium plating on cells — a permanent form of damage. Charging above 40°C accelerates degradation. Let your scooter reach room temperature before plugging in after riding in very hot or cold conditions."
      },
      {
        title: "Store Correctly When Not in Use",
        content: "If storing the scooter for more than 2 weeks, keep the battery at 40–60% charge in a cool, dry place. Recharge to 40–60% every 4–6 weeks during long storage."
      },
      {
        title: "Check for Swelling or Leakage Regularly",
        content: "Open the battery compartment every 3 months and visually inspect the pack. Any visible swelling, unusual smells, or residue on cells are signs of battery failure — stop using immediately.",
        warning: "A swollen or leaking battery is a fire hazard. Do not charge it. Contact your dealer immediately."
      }
    ]
  },
  {
    slug: "brake-maintenance-guide",
    category: "maintenance",
    title: "Disc Brake Maintenance & Pad Inspection",
    subtitle: "Keep your stopping power sharp — a safety critical routine",
    description: "Brakes are the most safety-critical component on any scooter. Regular maintenance prevents brake fade, rotor damage, and accidents.",
    readTime: "10 min",
    difficulty: "Beginner",
    tags: ["Brakes", "Safety", "Pads", "Rotor"],
    icon: "🛑",
    steps: [
      {
        title: "Inspect Brake Pads Every 500 km",
        content: "Remove the wheel and visually inspect the pad thickness through the caliper slot. New pads are approximately 8mm thick. Replace when worn below 2mm. On many scooters you can also see a wear indicator groove — when it disappears, replace the pads immediately."
      },
      {
        title: "Check Rotor Condition",
        content: "Look for deep grooves, scoring, rust patches, or warping on the rotor surface. Run your fingernail across the rotor — you should feel no deep ridges. Check rotor thickness with a micrometer — replace if below the minimum thickness stamped on the rotor edge.",
        tip: "Light surface rust after rain is normal and will clear itself after a few brake applications."
      },
      {
        title: "Clean the Rotors",
        content: "Use brake cleaner spray on a lint-free cloth to wipe both rotor faces. Never use WD-40, oil sprays, or water on the rotor — these cause brake fade. Clean rotors ensure maximum pad bite and consistent braking."
      },
      {
        title: "Bleed Hydraulic Brakes Annually",
        content: "Hydraulic brake fluid absorbs moisture over time, which lowers its boiling point and can cause spongy or fading brakes. Bleed and replace with fresh DOT4 fluid once a year, or whenever the brake lever feels soft or spongy.",
        warning: "Spongy brakes are a dangerous sign of air in the brake system. Fix immediately before riding."
      },
      {
        title: "Adjust Cable Brakes (Mechanical)",
        content: "For cable-actuated (mechanical) disc brakes, check cable tension. The brake lever should engage at roughly one-third of its travel. If the lever comes too close to the handlebar, tighten the barrel adjuster. Lubricate the inner cable annually."
      },
      {
        title: "Bed In New Brake Pads",
        content: "After installing new pads: perform 10 gentle stops from 30 km/h, then 5 moderate stops from 50 km/h. Allow the brakes to cool between each set. This transfers an even layer of pad material to the rotor surface for optimal performance."
      }
    ]
  },
  {
    slug: "motor-maintenance",
    category: "maintenance",
    title: "Hub Motor & Drivetrain Maintenance",
    subtitle: "Keep your motor running silently and efficiently",
    description: "Hub motors are relatively low-maintenance but benefit from periodic inspection. This guide covers what to check and how often.",
    readTime: "12 min",
    difficulty: "Intermediate",
    tags: ["Motor", "Hub", "Drivetrain", "Noise"],
    icon: "⚙️",
    steps: [
      {
        title: "Listen for Unusual Sounds",
        content: "A healthy hub motor runs quietly with only a soft hum. Grinding, clicking, or rattling sounds indicate bearing wear, loose magnets, or debris inside the motor. Address these sounds immediately — running a damaged motor can cause complete failure."
      },
      {
        title: "Check the Motor Axle Nuts",
        content: "Every 500 km, check that the motor axle nuts are tight. Loose axle nuts cause wobbling, uneven tyre wear, and can lead to the wheel detaching. Torque to 35–45 Nm depending on your model.",
        warning: "Loose axle nuts are a severe safety risk. Check them monthly."
      },
      {
        title: "Inspect the Motor Cable Harness",
        content: "Check the motor phase cables and hall sensor cable for any signs of chafing, cracking insulation, or bare wires. These cables flex with wheel travel and can develop micro-cracks over time. Wrap any cracked areas with self-amalgamating tape as a temporary fix — replace the cable properly as soon as possible."
      },
      {
        title: "Check Motor Bearing Play",
        content: "Lift the scooter so the motor wheel is off the ground. Grip the tyre and try to rock it sideways. There should be zero lateral play. Any play indicates worn wheel bearings — replace them before they damage the motor shaft."
      },
      {
        title: "Clean Motor Ventilation Slots",
        content: "If your motor has ventilation slots, use compressed air to blow out dust and debris every 6 months. Blocked ventilation causes the motor to run hot, reducing efficiency and lifespan.",
        tip: "After cleaning, apply a light coat of corrosion inhibitor (like ACF-50) to the motor exterior to prevent rust."
      }
    ]
  },
  {
    slug: "tyre-care-and-pressure",
    category: "maintenance",
    title: "Tyre Care & Pressure Management",
    subtitle: "The only contact point between you and the road",
    description: "Correct tyre pressure and condition directly affects range, handling, and safety. This is the easiest and most impactful regular maintenance task.",
    readTime: "6 min",
    difficulty: "Beginner",
    tags: ["Tyres", "Pressure", "Safety", "Range"],
    icon: "🛞",
    steps: [
      {
        title: "Check Pressure Weekly",
        content: "Check tyre pressure when the tyres are cold (before riding). The recommended pressure is usually printed on the tyre sidewall and in your manual. Most EV scooters run 30–50 PSI. Use a quality digital tyre gauge for accuracy.",
        tip: "Under-inflated tyres can reduce range by 10–20% and increase the risk of a puncture."
      },
      {
        title: "Inspect for Tyre Damage",
        content: "Before every ride, visually check the tyre surface for cuts, embedded debris (glass, nails), bulges, or cracks. A bulge on the tyre sidewall means the internal structure is compromised — replace immediately, do not ride on it.",
        warning: "A sidewall bulge can lead to sudden tyre blowout at speed."
      },
      {
        title: "Check Tread Depth",
        content: "Minimum legal tread depth is typically 1.6mm. Insert a 1-rupee coin into the tread groove — if you can see the entire coin rim, it's time to replace. Worn tyres have significantly reduced wet-weather grip.",
        tip: "Most tyres have tread wear indicators — small rubber blocks in the grooves that become flush with the surface when worn."
      },
      {
        title: "Rotate or Balance Tyres",
        content: "EV scooters that use rear-wheel drive will wear the rear tyre faster. Inspect both tyres at each service. If the rear tyre is wearing significantly faster, consider a tyre rotation schedule."
      },
      {
        title: "Avoid Prolonged Storage on Flat Spot",
        content: "If storing the scooter for more than 2 weeks, either elevate the scooter on stands so the tyres are off the ground, or fully inflate the tyres. Flat spots can develop from prolonged contact with the floor under the scooter's weight."
      }
    ]
  }
];

export const GUIDE_CATEGORIES = {
  installation: {
    label: "Installation Guides",
    description: "Step-by-step instructions for fitting EV parts correctly and safely",
    color: "primary",
    emoji: "🔧"
  },
  maintenance: {
    label: "Maintenance Tips",
    description: "Routine care routines to extend the life of every component",
    color: "success",
    emoji: "🛠️"
  }
};
