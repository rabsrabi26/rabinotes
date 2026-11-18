/* Managed with RabiNotes CMS. */
window.RABI_POSTS = [
  {
    "slug": "welcome-to-rabsrabi-notes",
    "title": "Welcome to rabsrabi / notes",
    "category": "Notes",
    "tags": [],
    "date": "2026-11-16",
    "read": "2 min read",
    "description": "A small introduction to this notebook, what belongs here, and why I am writing in public.",
    "body": "<p>Welcome to rabsrabi / notes — a personal space for ideas, experiments, useful explanations, and lessons learned along the way.</p><h2>What you will find here</h2><p>This notebook will grow around networking, wireless communication, research, software, and the practical details that are easy to forget after solving a problem.</p><p>Some posts will be carefully structured guides. Others may be short field notes, experiment logs, or reflections on a concept I have been exploring.</p><h2>Why keep notes in public?</h2><p>Writing helps turn scattered thoughts into something clearer. Sharing those notes may also help someone working through a similar question. I will keep adding to this space as the work develops.</p><blockquote>Learn it, test it, document it, share it.</blockquote><p>Thanks for stopping by. — Rabiul</p>"
  },
  {
    "slug": "understanding-wireless-link-budget",
    "title": "A practical way to think about a wireless link budget",
    "category": "Wireless",
    "date": "2026-11-16",
    "read": "4 min read",
    "description": "A conceptual walkthrough of transmit power, gains, path loss and received power in a radio link.",
    "body": "<p>A link budget is an accounting exercise: start with the transmitted signal and track the gains and losses it experiences before reaching the receiver.</p><h2>The basic equation</h2><p>In decibels, a simplified received-power calculation is:</p><pre><code>Pr = Pt + Gt + Gr - Lpath - Lmisc</code></pre><p>Here, <code>Pt</code> is transmit power in dBm, <code>Gt</code> and <code>Gr</code> are antenna gains in dBi, and the loss terms are expressed in dB. Keeping units consistent is essential.</p><h2>Build it term by term</h2><p>Record the transmitter output, account for feeder and connector losses, add antenna gains, subtract propagation loss, and include other known losses such as polarization or implementation losses.</p><p>The result is an estimate, not a guarantee. Real environments introduce fading, shadowing, interference, and time-varying conditions. A robust design therefore considers margin and the required receiver sensitivity.</p><h2>A useful habit</h2><p>Keep every assumption visible in the calculation. A link budget is most useful when another person can inspect the inputs, units, and source of each value.</p>"
  },
  {
    "slug": "notes-on-mimo-scheduling",
    "title": "Notes on MIMO scheduling: start with the system model",
    "category": "Research",
    "date": "2026-11-16",
    "read": "5 min read",
    "description": "A research notebook entry on defining users, channel assumptions, scheduling objectives and evaluation metrics.",
    "body": "<p>Before comparing scheduling algorithms in a MIMO system, make the system model explicit. The assumptions determine what the simulation can and cannot demonstrate.</p><h2>Describe the scenario</h2><p>Document the number of base-station antennas, users, available resource blocks, channel model, transmit-power constraints, and whether channel state information is assumed to be perfect or imperfect.</p><h2>Separate policy from environment</h2><p>The channel and traffic model describe the environment. The scheduler decides how available resources are assigned. Keeping these parts separate makes it easier to compare policies under identical conditions.</p><h2>Choose metrics that match the question</h2><p>Throughput alone may hide unfair allocations. Depending on the research question, also consider spectral efficiency, user-level throughput, outage probability, delay, and a fairness measure such as Jain's index.</p><h2>Make experiments reproducible</h2><p>Record random seeds, parameter values, run duration, warm-up handling, and the number of independent trials. Report averages alongside variability, and verify that event timing and resource accounting are consistent.</p><p>This is a starting checklist rather than a claim about any particular simulation. The model should always be adapted to the actual research question.</p>"
  }
];
