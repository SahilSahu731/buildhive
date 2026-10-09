"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Code2,
  Command,
  GitBranch,
  Github,
  Globe,
  Layers,
  Menu,
  MousePointer2,
  Play,
  ShieldCheck,
  Sparkles,
  Terminal,
  Timer,
  Workflow,
  X,
} from "lucide-react";
import { Logo, ThemeToggle, Badge, CheckLine } from "./ui";
export function PublicHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="public-header">
      <div className="public-nav">
        <Logo />
        <nav className={open ? "open" : ""} aria-label="Main navigation">
          <Link onClick={() => setOpen(false)} href="/features">
            Features
          </Link>
          <Link onClick={() => setOpen(false)} href="/how-it-works">
            How it works
          </Link>
          <Link onClick={() => setOpen(false)} href="/pricing">
            Pricing
          </Link>
          <Link onClick={() => setOpen(false)} href="/docs">
            Documentation <ArrowUpRight size={12} />
          </Link>
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <Link className="nav-login" href="/login">
            Log in
          </Link>
          <Link className="button primary small" href="/login">
            Start testing <ArrowRight size={14} />
          </Link>
          <button
            aria-label="Toggle menu"
            className="icon-button mobile-only"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div>
        <Logo />
        <p>
          A little more confidence.
          <br />
          Every time you ship.
        </p>
      </div>
      <div>
        <b>Product</b>
        <Link href="/features">Features</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/demo">Sample report</Link>
      </div>
      <div>
        <b>Resources</b>
        <Link href="/docs">Documentation</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/contact">Contact & feedback</Link>
      </div>
      <div>
        <b>BuildHive</b>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms & acceptable use</Link>
        <span className="footer-caption">
          © {new Date().getFullYear()} BuildHive
        </span>
      </div>
    </footer>
  );
}
export function DemoPreview({ large = false }: { large?: boolean }) {
  const [selected, setSelected] = useState(3);
  const steps = [
    ["Navigate to /login", "Navigate", "124 ms"],
    ["Enter test email", "Fill field", "82 ms"],
    ["Click “Sign in”", "Click", "246 ms"],
    ["Verify dashboard is visible", "Assert visible", "10.0 s"],
    ["Verify welcome message", "Assert text", "—"],
  ];
  return (
    <div className={`demo-window ${large ? "large" : ""}`}>
      <div className="window-top">
        <div className="window-dots">
          <i />
          <i />
          <i />
        </div>
        <span>
          <ShieldCheck size={12} /> buildhive.app / runs / example
        </span>
        <span className="demo-label">SAMPLE REPORT</span>
      </div>
      <div className="demo-body">
        <aside className="demo-side">
          <span className="mini-brand">
            <Layers size={19} />
          </span>
          <div className="mini-icon active">
            <Globe size={17} />
          </div>
          <div className="mini-icon">
            <CheckCheck size={17} />
          </div>
          <div className="mini-icon">
            <Timer size={17} />
          </div>
          <div className="mini-icon">
            <GitBranch size={17} />
          </div>
        </aside>
        <div className="demo-content">
          <div className="demo-breadcrumb">
            Acme app <ChevronRight size={12} /> Production{" "}
            <ChevronRight size={12} /> Run report
          </div>
          <div className="demo-title">
            <div>
              <h3>Sign in → Dashboard</h3>
              <p>Chromium · Desktop · Test version 3</p>
            </div>
            <Badge status="failed" />
          </div>
          <div className="demo-metrics">
            <div>
              <span>RUN DURATION</span>
              <b>
                10.5 <small>seconds</small>
              </b>
            </div>
            <div>
              <span>STEPS PASSED</span>
              <b>
                3 <small>/ 5 steps</small>
              </b>
            </div>
            <div>
              <span>TRIGGER</span>
              <b className="demo-trigger">
                <GitBranch size={15} /> Deployment
              </b>
            </div>
          </div>
          <div className="demo-report-grid">
            <div>
              <div className="demo-section-label">EXECUTION TIMELINE</div>
              {steps.map((s, i) => (
                <button
                  key={s[0]}
                  className={`demo-step ${selected === i ? "selected" : ""}`}
                  onClick={() => setSelected(i)}
                >
                  <span
                    className={`step-dot ${i < 3 ? "passed" : i === 3 ? "failed" : "skipped"}`}
                  >
                    {i < 3 ? (
                      <Check size={12} />
                    ) : i === 3 ? (
                      <X size={12} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span>
                    {s[0]}
                    <small>{s[1]}</small>
                  </span>
                  <code>{s[2]}</code>
                </button>
              ))}
            </div>
            <div className="demo-evidence">
              <div className="demo-section-label">
                {selected === 3 ? "FAILURE DETAILS" : "STEP DETAILS"}
              </div>
              <div
                className={`evidence-box ${selected === 3 ? "failure" : ""}`}
              >
                <span className="mono">
                  {selected === 3
                    ? "ASSERTION FAILED"
                    : selected === 4
                      ? "NOT EXECUTED"
                      : "STEP PASSED"}
                </span>
                <h4>{steps[selected][0]}</h4>
                <p>
                  {selected === 3
                    ? "Expected the dashboard heading to be visible. The page remained on /login."
                    : selected === 4
                      ? "This step was skipped after the preceding assertion failed."
                      : "The browser completed this action successfully."}
                </p>
                {selected === 3 && (
                  <code>
                    locator: role=heading|Dashboard
                    <br />
                    Timeout: 10,000 ms
                  </code>
                )}
              </div>
              <div className="evidence-note">
                <Terminal size={14} />
                <span>
                  {selected === 3
                    ? "POST /api/auth/login · 401 Unauthorized"
                    : "Deterministic browser execution"}
                </span>
              </div>
            </div>
          </div>
          <div className="demo-bottom">
            <span>
              <span className="live-dot" /> Evidence you can act on.
            </span>
            <Link href="/demo">
              Explore sample report <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
const features = [
  {
    icon: Workflow,
    title: "Your flows. Actually tested.",
    body: "From sign-in to checkout, turn the journeys that matter into repeatable browser tests.",
  },
  {
    icon: Sparkles,
    title: "Describe it. Review it. Run it.",
    body: "Draft a test in plain language, review every step, and keep control of what gets executed.",
  },
  {
    icon: Terminal,
    title: "Failures with the full story.",
    body: "See exactly which step broke, what was expected, and what the browser observed.",
  },
  {
    icon: Timer,
    title: "Keep an eye on your app.",
    body: "Schedule recurring checks and get an email when a workflow fails or recovers.",
  },
  {
    icon: GitBranch,
    title: "A check after every deploy.",
    body: "Connect a signed webhook to your deployment pipeline and test what you just shipped.",
  },
  {
    icon: ShieldCheck,
    title: "Built around boundaries.",
    body: "Verified domains, isolated browser sessions, encrypted variables, and private reports.",
  },
];
export function Landing() {
  return (
    <>
      <PublicHeader />
      <main>
        <section className="hero section-wrap">
          <div className="hero-copy">
            <div className="release-pill">
              <span className="live-dot" /> INTRODUCING BUILDHIVE{" "}
              <span>
                YOUR NEXT RELEASE, CHECKED <ArrowUpRight size={12} />
              </span>
            </div>
            <h1>
              You build the next big thing.
              <br />
              <span>We check the little things.</span>
            </h1>
            <p>
              Catch broken user journeys before your customers do.
              <br className="desktop-break" /> Real browser tests. Clear
              answers. One less thing to worry about.
            </p>
            <div className="hero-actions">
              <Link className="button primary big" href="/login">
                Start testing for free <ArrowRight size={17} />
              </Link>
              <Link className="button big" href="/demo">
                <Play size={15} /> See a test in action
              </Link>
            </div>
            <div className="hero-proof">
              <span>
                <Check size={13} /> No credit card needed
              </span>
              <span>
                <Check size={13} /> 20 free runs / month
              </span>
              <span>
                <Check size={13} /> Your first test in minutes
              </span>
            </div>
          </div>
          <div className="hero-product">
            <div className="product-annotation">
              <span>LESS GUESSWORK. MORE SHIPPING.</span>
              <ArrowRight size={20} />
            </div>
            <DemoPreview />
            <div className="hero-bottom-note">
              <span>
                <span className="live-dot" /> A REAL BROWSER. A REPEATABLE TEST.
              </span>
              <span>
                Build it. Test it. Ship it. <Command size={12} />
              </span>
            </div>
          </div>
        </section>
        <section className="compat-strip">
          <span>
            FITS RIGHT INTO
            <br />
            <b>your shipping workflow.</b>
          </span>
          <div>
            <Code2 /> Any web framework
          </div>
          <div>
            <Globe /> Chromium
          </div>
          <div>
            <Github /> Your CI pipeline
          </div>
          <div>
            <Terminal /> Playwright-powered
          </div>
        </section>
        <section className="section-wrap feature-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">CONFIDENCE, BUILT IN</span>
              <h2>
                “It worked on my machine”
                <br />
                isn’t a testing strategy.
              </h2>
            </div>
            <p>
              Check the flows your users count on.
              <br />
              Spend less time chasing bugs and more time
              <br />
              building what comes next.
            </p>
          </div>
          <div className="feature-grid">
            {features.map((f, i) => (
              <article key={f.title}>
                <div className="feature-icon">
                  <f.icon size={23} />
                </div>
                <span className="feature-number">0{i + 1}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="workflow-section">
          <div className="section-wrap">
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  SMALL SETUP. LASTING PEACE OF MIND.
                </span>
                <h2>From URL to “all clear.”</h2>
              </div>
              <Link className="text-link" href="/how-it-works">
                See how it works <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="workflow-grid">
              {[
                [
                  "01",
                  "Connect your website",
                  "Add your production or staging URL and verify your domain.",
                ],
                [
                  "02",
                  "Define what should work",
                  "Build steps yourself or let AI draft a plan for your review.",
                ],
                [
                  "03",
                  "Run it. Then keep running it.",
                  "Inspect the report, set a schedule, and get back to building.",
                ],
              ].map(([n, title, body]) => (
                <article key={n}>
                  <span className="workflow-number">{n}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="section-wrap cta-section">
          <span className="eyebrow">
            YOUR NEXT DEPLOY DESERVES A SECOND LOOK.
          </span>
          <h2>
            Ship with a little
            <br />
            more confidence.
          </h2>
          <Link className="button primary big" href="/login">
            Create your first test <ArrowRight size={17} />
          </Link>
          <p>Start free. Upgrade when your testing grows.</p>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
export function Pricing() {
  return (
    <>
      <div className="public-page-head">
        <span className="eyebrow">SIMPLE LIMITS. NO SURPRISE OVERAGES.</span>
        <h1>A plan for your next stage.</h1>
        <p>Start with your most important journey. Grow from there.</p>
      </div>
      <div className="pricing-grid">
        {[
          {
            name: "Free",
            price: "0",
            description: "A first layer of confidence.",
            items: [
              "1 project",
              "2 saved tests",
              "20 browser runs / month",
              "5 AI requests / month",
              "Daily monitoring",
              "7-day artifact retention",
            ],
          },
          {
            name: "Starter",
            price: "19",
            description: "For developers shipping every week.",
            items: [
              "3 projects",
              "15 saved tests",
              "300 browser runs / month",
              "50 AI requests / month",
              "Monitoring every 6 hours",
              "Deployment webhooks",
              "30-day artifact retention",
            ],
          },
          {
            name: "Growth",
            price: "49",
            description: "More projects. More peace of mind.",
            items: [
              "10 projects",
              "100 saved tests",
              "1,500 browser runs / month",
              "200 AI requests / month",
              "Hourly monitoring",
              "Deployment webhooks",
              "90-day artifact retention",
            ],
          },
        ].map((p, i) => (
          <article
            className={`pricing-card ${i === 1 ? "featured" : ""}`}
            key={p.name}
          >
            {i === 1 && <span className="popular">ROOM TO GROW</span>}
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <div className="price">
              ${p.price}
              <span>/ month</span>
            </div>
            <Link
              className={`button ${i === 1 ? "primary" : ""}`}
              href="/login"
            >
              {i === 0 ? "Start for free" : `Choose ${p.name}`}
              <ArrowRight size={15} />
            </Link>
            <hr />
            {p.items.map((item) => (
              <CheckLine key={item}>{item}</CheckLine>
            ))}
          </article>
        ))}
      </div>
      <p className="pricing-note">
        Launch pricing in USD. Taxes and the supported billing currency are
        shown at checkout. Every run is limited to 40 steps and 120 seconds. No
        automatic overages. Paid checkout becomes available when subscription
        plans are configured.
      </p>
      <div className="info-callout">
        <ShieldCheck />
        <div>
          <h3>Every plan includes the essentials.</h3>
          <p>
            Verified domains, encrypted test variables, Chromium execution,
            versioned test results, email alerts, and a manual test editor.
          </p>
        </div>
      </div>
    </>
  );
}
const faqs = [
  [
    "Does a passing test mean my whole website is bug-free?",
    "No. A passing run confirms only the assertions in that saved test. BuildHive does not promise complete coverage or measure site uptime.",
  ],
  [
    "Do I need to write code?",
    "No. Build a test using browser actions and assertions, or describe a journey for AI to draft. You must review generated locators against your application before saving.",
  ],
  [
    "Can I test a site that needs a login?",
    "Yes, using dedicated test accounts and encrypted project variables. Secret-bearing tests restrict requests to the verified origin and disable screenshots and traces. OAuth redirects, CAPTCHA and two-factor authentication are not supported in V1.",
  ],
  [
    "Which browsers are supported?",
    "V1 executes Chromium with desktop or mobile-sized viewports. A mobile viewport is not a real mobile device.",
  ],
  [
    "What happens when I reach my monthly limit?",
    "Additional runs and AI requests stop with a clear usage-limit message. BuildHive does not create surprise overage charges. Existing reports remain accessible.",
  ],
  [
    "Can I test someone else’s website?",
    "Only websites and accounts you own or are authorized to test. Domain verification is required before execution. Use staging and payment sandboxes for destructive or financial flows.",
  ],
  [
    "What does AI see?",
    "Test drafting receives your description, target origin, and variable names. Failure explanations use redacted run diagnostics. Never paste credentials, private customer data, or payment information into prompts.",
  ],
];
export function FAQ() {
  return (
    <>
      <div className="public-page-head">
        <span className="eyebrow">GOOD QUESTIONS</span>
        <h1>A few things worth knowing.</h1>
        <p>Clear expectations make better tests.</p>
      </div>
      <div className="faq-list">
        {faqs.map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <ChevronDown size={18} />
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </>
  );
}
export function Features() {
  return (
    <>
      <div className="public-page-head">
        <span className="eyebrow">LESS GUESSING. BETTER EVIDENCE.</span>
        <h1>
          Your release deserves
          <br />
          more than a quick click-through.
        </h1>
        <p>
          Everything you need to define, execute, and monitor important user
          journeys.
        </p>
      </div>
      <div className="feature-grid standalone-features">
        {features.map((f) => (
          <article key={f.title}>
            <div className="feature-icon">
              <f.icon />
            </div>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </article>
        ))}
      </div>
      <DemoPreview large />
    </>
  );
}
export function HowItWorks() {
  return (
    <>
      <div className="public-page-head">
        <span className="eyebrow">BUILD IT. TEST IT. SHIP IT.</span>
        <h1>
          A repeatable check.
          <br />A calmer release.
        </h1>
        <p>
          AI helps you write the plan. A real browser follows the approved
          steps.
        </p>
      </div>
      <div className="how-list">
        {[
          [
            "Connect and verify",
            "Add an HTTPS production or staging URL. Publish the provided DNS TXT record or verification file so BuildHive can confirm control of the domain.",
          ],
          [
            "Define your journey",
            "Choose manual steps or ask AI for a draft. Include a specific assertion: a heading appears, a URL changes, or a button becomes enabled.",
          ],
          [
            "Review and run",
            "Confirm the locators, expected results and dedicated test credentials. Save the version, then start an isolated Chromium run.",
          ],
          [
            "Inspect the evidence",
            "Follow the step timeline. Compare expected and observed results, inspect console and network errors, and view eligible failure screenshots and traces.",
          ],
          [
            "Make it a habit",
            "Set a timezone-aware schedule or trigger tests from CI. Receive new-failure and recovery emails, and keep an eye on your monthly allowance.",
          ],
        ].map(([title, body], i) => (
          <article key={title}>
            <span>0{i + 1}</span>
            <div>
              <h2>{title}</h2>
              <p>{body}</p>
            </div>
          </article>
        ))}
      </div>
      <Link className="button primary" href="/login">
        Create your first test <ArrowRight size={16} />
      </Link>
    </>
  );
}
export function Login() {
  return (
    <main className="login-layout">
      <div className="login-story">
        <Logo />
        <div>
          <span className="eyebrow">ONE LESS THING TO WORRY ABOUT.</span>
          <h1>
            Build something
            <br />
            great.
            <br />
            <span>Ship it confidently.</span>
          </h1>
          <p>
            Your most important user journeys.
            <br />
            Checked by a real browser, on repeat.
          </p>
          <div className="login-check">
            <CheckCheck />
            <div>
              <b>A small check goes a long way.</b>
              <span>Start with 20 free browser runs every month.</span>
            </div>
          </div>
        </div>
        <small>Build it. Test it. Ship it.</small>
      </div>
      <div className="login-form">
        <Link className="back-link" href="/">
          ← Back to home
        </Link>
        <div>
          <span className="eyebrow">WELCOME TO BUILDHIVE</span>
          <h2>
            Your next release
            <br />
            starts here.
          </h2>
          <p>Sign in or create your free account.</p>
          <button
            className="button github-button"
            onClick={() =>
              location.assign(new URL("/api/auth/github", location.origin).href)
            }
          >
            <Github size={20} /> Continue with GitHub
          </button>
          <button
            className="button google-button"
            onClick={() =>
              location.assign(new URL("/api/auth/google", location.origin).href)
            }
          >
            <b className="google-g">G</b> Continue with Google
          </button>
          <p className="login-terms">
            By continuing, you agree to our <Link href="/terms">Terms</Link> and
            acknowledge our <Link href="/privacy">Privacy Policy</Link>.
          </p>
          <div className="login-note">
            <ShieldCheck size={17} /> We request your basic profile and email.
            <br />
            No repository access required.
          </div>
        </div>
        <span className="footer-caption">
          No credit card. No lengthy setup.
        </span>
      </div>
    </main>
  );
}
export function Docs() {
  return (
    <>
      <div className="public-page-head">
        <span className="eyebrow">THE BUILDHIVE HANDBOOK</span>
        <h1>
          From your first check
          <br />
          to continuous confidence.
        </h1>
        <p>Practical guides for a repeatable testing workflow.</p>
      </div>
      <div className="docs-layout">
        <aside>
          {[
            "quickstart",
            "verification",
            "test-actions",
            "variables",
            "monitoring",
            "deployments",
            "troubleshooting",
          ].map((id) => (
            <a href={`#${id}`} key={id}>
              {id.replaceAll("-", " ")}
            </a>
          ))}
        </aside>
        <div className="prose">
          <section id="quickstart">
            <h2>01 / Your first test</h2>
            <ol>
              <li>Sign in with GitHub or Google and create a project.</li>
              <li>Enter your production or staging HTTPS origin.</li>
              <li>Verify domain ownership using DNS or a file.</li>
              <li>
                Create a test: navigate to a page, then assert a specific
                heading is visible.
              </li>
              <li>
                Run the test and open its report. Set a schedule when the test
                is reliable.
              </li>
            </ol>
          </section>
          <section id="verification">
            <h2>02 / Verify your domain</h2>
            <p>
              Add a TXT record at <code>_buildhive.your-domain.com</code> with
              the exact value shown in project settings. Alternatively, serve
              that value as plain text at{" "}
              <code>/.well-known/buildhive-verification.txt</code>. File
              verification requires a direct HTTPS 200 response, without
              redirects. Challenges expire after seven days and can be renewed.
            </p>
            <p>
              Changing the project origin clears verification. Each staging
              origin should have its own project and verification.
            </p>
          </section>
          <section id="test-actions">
            <h2>03 / Browser actions and assertions</h2>
            <p>
              Supported actions: navigate, click, fill, select, check, press a
              key, and wait for a visible element. Assertions: visible element,
              text, URL, title, and element state (enabled, disabled, checked,
              unchecked, hidden, editable).
            </p>
            <p>
              Locators support CSS, <code>text=Exact text</code>,{" "}
              <code>label=Email</code>, <code>role=button|Sign in</code>, and{" "}
              <code>testid=submit</code>. Prefer stable labels, roles and test
              IDs. Text and title assertions check whether the expected value is
              contained.
            </p>
            <pre>{`Navigate       /login\nFill field     label=Email     secret: TEST_EMAIL\nFill field     label=Password  secret: TEST_PASSWORD\nClick          role=button|Sign in\nAssert URL     /dashboard\nAssert visible role=heading|Dashboard`}</pre>
            <p>
              Every test requires at least one assertion. Saved edits create an
              immutable version; historical reports keep the version they
              executed. A retry executes the latest approved version and links
              to the earlier run.
            </p>
          </section>
          <section id="variables">
            <h2>04 / Dedicated test credentials</h2>
            <p>
              Create encrypted variables in project settings, using names such
              as <code>TEST_EMAIL</code> and <code>TEST_PASSWORD</code>. Select
              “Secret variable” on a fill step. Values are never returned by the
              settings API.
            </p>
            <p>
              Secret-bearing tests stay entirely on the verified origin, block
              third-party requests, and do not capture screenshots or traces.
              Public-page traces may contain page content and network data; use
              only safe test data. Never use real customer accounts.
            </p>
          </section>
          <section id="monitoring">
            <h2>05 / Monitoring and notifications</h2>
            <p>
              Choose an IANA timezone and local daily hour. Starter also
              supports checks every six hours; Growth supports hourly checks. A
              test cannot overlap itself. Missed schedules advance to the next
              occurrence without a backlog burst. The same usage limits apply to
              manual, scheduled and deployment runs.
            </p>
            <p>
              Email alerts are sent when a test starts failing, with optional
              recovery emails. Repeated unresolved failures are suppressed. A
              worker infrastructure problem is recorded separately from a failed
              assertion.
            </p>
          </section>
          <section id="deployments">
            <h2>06 / Trigger tests after a deployment</h2>
            <p>
              Generate a webhook credential in project settings and enable “Run
              on deployment” for each selected test. Send JSON with a unique{" "}
              <code>eventId</code> and optional <code>label</code>. Sign the
              exact request body with HMAC-SHA256 over{" "}
              <code>timestamp + &quot;.&quot; + body</code>.
            </p>
            <pre>{`POST /api/webhooks/deployment/PROJECT_ID\nX-BuildHive-Timestamp: UNIX_SECONDS\nX-BuildHive-Signature: HEX_HMAC_SHA256\nContent-Type: application/json\n\n{"eventId":"deploy-123","label":"Release 1.2"}`}</pre>
            <p>
              Timestamps expire after five minutes. Repeated event IDs do not
              create duplicate runs. Store the webhook secret in your CI secret
              store. A working Node script is provided at{" "}
              <code>infra/trigger-deployment.mjs</code> in the repository.
            </p>
          </section>
          <section id="troubleshooting">
            <h2>07 / When a test fails</h2>
            <p>
              <b>Locator timeout:</b> confirm that the selector uniquely matches
              the intended element and that the page has reached the expected
              state.
            </p>
            <p>
              <b>Blocked navigation:</b> redirects must remain on the verified
              origin. V1 does not support external OAuth, CAPTCHA, or two-factor
              flows.
            </p>
            <p>
              <b>Queued for a long time:</b> the execution worker or Redis may
              be unavailable. Cancel the run and contact your service operator.
            </p>
            <p>
              <b>Artifact missing:</b> secret-bearing tests intentionally
              disable screenshots and traces. Other artifacts expire after your
              plan’s retention window.
            </p>
            <p>
              <b>AI unavailable:</b> use the manual builder; saved tests never
              require AI during execution.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
export function Legal({ privacy = false }: { privacy?: boolean }) {
  return (
    <article className="prose legal">
      <span className="eyebrow">
        {privacy ? "PRIVACY" : "TERMS & ACCEPTABLE USE"} · PRE-LAUNCH DRAFT
      </span>
      <h1>{privacy ? "Your data, explained." : "A clear agreement."}</h1>
      <p className="notice">
        These draft policies require the operator’s legal review, business
        identity, jurisdiction and contact details before public launch.
      </p>
      {privacy ? (
        <>
          <h2>Information processed</h2>
          <p>
            BuildHive stores your OAuth profile and email, project
            configuration, test definitions, encrypted test variables, execution
            metadata, notification preferences, and subscription identifiers.
            Payment details are handled by the payment provider.
          </p>
          <h2>Test evidence and AI</h2>
          <p>
            Public-page runs may record screenshots, DOM snapshots, console
            messages, and network information. Do not run tests against real
            customer data. Secret-bearing tests disable visual artifacts. AI
            drafting receives your submitted instructions and variable names.
            Failure explanations receive redacted diagnostics. AI processing is
            optional.
          </p>
          <h2>Storage and retention</h2>
          <p>
            PostgreSQL stores account and test data. Private object storage
            holds artifacts, retained for 7, 30, or 90 days according to your
            plan. Account and run metadata remain until account or project
            deletion. Backups may persist until their configured retention
            expires. The operator must publish the backup schedule and hosting
            regions before launch.
          </p>
          <h2>Your controls</h2>
          <p>
            Export your data, update your profile and notification preferences,
            revoke other sessions, or delete your account in settings. Active
            subscriptions must be cancelled and active runs stopped before
            deletion.
          </p>
          <h2>Cookies and providers</h2>
          <p>
            A necessary HttpOnly session cookie keeps you signed in. This
            version does not load marketing analytics. Services may include
            Google and GitHub for login, Supabase for database/storage, Google
            for optional AI, Razorpay for payments, and the configured email
            provider. The final provider and regional processing list must be
            confirmed before launch.
          </p>
        </>
      ) : (
        <>
          <h2>Authorized testing only</h2>
          <p>
            Test only websites and accounts you control or have explicit
            permission to test. Domain verification is required. Do not use
            BuildHive for credential attacks, spam, scraping personal data,
            denial of service, or bypassing access controls.
          </p>
          <h2>Safe test environments</h2>
          <p>
            Use dedicated test accounts and staging environments. You are
            responsible for reviewing every action before saving or running a
            test. Use payment sandboxes, and explicitly approve any workflow
            that creates, changes, or deletes data in your application.
          </p>
          <h2>Scope of results</h2>
          <p>
            A passing test confirms only the assertions in that run. BuildHive
            does not guarantee a bug-free website, complete security, or
            uninterrupted availability. AI drafts and explanations can be
            incorrect and require review.
          </p>
          <h2>Plans and payments</h2>
          <p>
            Plan allowances apply across manual, scheduled, and deployment runs.
            Additional executions stop when limits are reached. Subscription
            terms, billing currency, applicable taxes, cancellation and refund
            policies must be confirmed at checkout and by the operator before
            launch.
          </p>
          <h2>Suspension and deletion</h2>
          <p>
            Abusive use may be suspended. You can export account data and
            request deletion through settings. The final agreement must specify
            the operator, governing law, liability terms, dispute process and
            support contact before accepting paying customers.
          </p>
        </>
      )}
      <h2>Contact</h2>
      <p>
        Use <Link href="/contact">the contact page</Link> or the in-product
        feedback form to reach the operator.
      </p>
    </article>
  );
}
export function Contact() {
  return (
    <>
      <div className="public-page-head">
        <span className="eyebrow">LET’S MAKE TESTING BETTER</span>
        <h1>
          A question, a bug,
          <br />
          or a good idea?
        </h1>
        <p>We’d like to hear what gets in the way of your next release.</p>
      </div>
      <div className="contact-grid">
        <article>
          <Terminal />
          <h2>Need a hand?</h2>
          <p>
            Find help with domain verification, test steps, secrets and
            deployment webhooks.
          </p>
          <Link className="text-link" href="/docs">
            Read the docs <ArrowUpRight size={15} />
          </Link>
        </article>
        <article>
          <MousePointer2 />
          <h2>Share feedback</h2>
          <p>
            Send a bug report or feature request from your workspace. Include
            the run ID when relevant.
          </p>
          <Link className="text-link" href="/dashboard/settings/feedback">
            Open feedback form <ArrowUpRight size={15} />
          </Link>
        </article>
      </div>
      {process.env.NEXT_PUBLIC_SUPPORT_EMAIL && (
        <p className="center">
          Or email{" "}
          <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>
            {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}
          </a>
          .
        </p>
      )}
    </>
  );
}
