export interface Principle {
  id: string;
  title: string;
  description: string;
  application: string;
  order: number;
}

export interface PrincipleGroup {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  source: string;
  principles: Principle[];
}

// The Three Ways from The Phoenix Project
const phoenixPrinciples: Principle[] = [
  {
    id: "first-way",
    title: "The First Way: Systems Thinking",
    description:
      "Optimize for the entire value stream, not individual silos. Work flows from development through operations to the customer. Understanding the complete system—from infrastructure and CI/CD through application code to user experience—enables better architectural decisions and faster delivery of value.",
    application:
      "At Hugo Health, I own the complete stack for Hugo Connect, from Terraform infrastructure and Azure DevOps pipelines to Next.js applications serving 30,000+ users. This end-to-end ownership lets me optimize globally rather than locally—whether that means reducing Docker image sizes by 80% to speed up deployments, or consolidating EKS clusters to improve both cost and operational efficiency. I've learned that the fastest way to deliver value is to understand and optimize the entire flow, not just my slice of it.",
    order: 1,
  },
  {
    id: "second-way",
    title: "The Second Way: Amplify Feedback Loops",
    description:
      "Create fast, continuous feedback from right to left at every stage. Rapid feedback loops—from automated tests and CI/CD pipelines to monitoring and user analytics—enable teams to detect and correct problems quickly, iterate faster, and build higher-quality systems with confidence.",
    application:
      "Fast feedback is the foundation of sustainable high-velocity development. I've built this principle into every layer: type-safe APIs with Drizzle ORM and Zod that catch errors at compile time rather than production, comprehensive test suites that run on every commit, and CI/CD pipelines that deploy changes to staging in minutes rather than hours. AI-assisted development with tools like GitHub Copilot and Claude Code creates even tighter feedback loops—instant validation of patterns, real-time suggestions for edge cases, and rapid prototyping that would have taken hours manually. The faster we learn what doesn't work, the faster we can ship what does.",
    order: 2,
  },
  {
    id: "third-way",
    title: "The Third Way: Culture of Experimentation",
    description:
      "Foster a culture of continual experimentation, learning from both success and failure, and understanding that mastery requires practice and repetition. Innovation requires taking calculated risks, celebrating learning over blame, and creating systems that make it safe to fail fast and iterate quickly.",
    application:
      "I champion AI-assisted development not because it's trendy, but because it fundamentally changes how we experiment and learn. With a strategic multi-tool approach using GitHub Copilot, Claude Code, and other AI assistants, we can rapidly prototype solutions, explore alternative architectures, and test new patterns without the traditional cost of experimentation. This lets teams fail fast and iterate quickly. I've also learned that experimentation requires the right foundation—strong types, comprehensive tests, and fast CI/CD pipelines create the safety net that makes bold experiments possible. At Hugo, I mentor the team on modern development practices and lead architecture decisions that enable innovation rather than constrain it.",
    order: 3,
  },
];

// The Five Ideals from The Unicorn Project
const unicornPrinciples: Principle[] = [
  {
    id: "locality-simplicity",
    title: "The First Ideal: Locality and Simplicity",
    description:
      "Developers should be able to work independently without excessive coordination overhead. Systems should be loosely coupled, with clear boundaries and minimal dependencies. Work should be completable within a single team or service boundary, enabling rapid iteration and deployment without cross-team dependencies blocking progress.",
    application:
      "I architect systems with independent deployment units—monorepos with clear module boundaries, edge-first APIs, and type-safe contracts using TypeScript and Zod. By choosing Bun's integrated toolchain over complex multi-tool setups, I reduce configuration complexity and external dependencies. Drizzle ORM with type inference means database changes stay local to feature development, and Next.js App Router enables component-level thinking without sprawling architectural decisions. The goal is simple: developers should be able to understand, modify, and deploy their work without navigating organizational dependencies.",
    order: 1,
  },
  {
    id: "focus-flow-joy",
    title: "The Second Ideal: Focus, Flow, and Joy",
    description:
      "Remove friction from the development experience to enable developers to achieve flow state. Minimize context switching, eliminate waiting, and create tight feedback loops. Developer happiness is not a luxury—it's the foundation of sustainable velocity and high-quality software. When developers experience joy in their work, they produce better outcomes.",
    application:
      "This ideal drives every tooling decision I make. Bun provides sub-millisecond startup times and instant feedback—no more waiting for slow package managers or build tools. Biome gives near-instant linting and formatting with zero configuration, eliminating the ceremony of ESLint and Prettier setup. TypeScript with strict mode catches errors before runtime, and the React Compiler removes manual optimization work. AI-assisted development with Claude Code and GitHub Copilot handles mechanical tasks like boilerplate generation, test scaffolding, and refactoring, freeing me to focus on architecture and problem-solving. The result is a development experience where I spend more time solving interesting problems and less time fighting tooling.",
    order: 2,
  },
  {
    id: "improvement-daily-work",
    title: "The Third Ideal: Improvement of Daily Work",
    description:
      "Prioritize improving the way we work over simply completing assigned work. Technical debt is not just code that needs refactoring—it's any friction that slows down future work. Dedicate time to automation, tooling improvements, and removing impediments. Making the work easier is more valuable than doing the work faster.",
    application:
      "I treat developer experience as a first-class concern, not an afterthought. When I encounter repeated manual work, I automate it. When I find configuration complexity, I simplify it. When tests are slow, I optimize them. This portfolio itself exemplifies this principle—I chose modern tools like Bun and Biome specifically because they reduce cognitive load and setup complexity. I invest in type-safe patterns with Zod and Drizzle because they catch errors earlier and reduce debugging time later. AI tools amplify this by suggesting optimizations and handling refactoring at scale. Every sprint should include time for reducing friction, whether that's improving CI/CD pipelines, updating documentation, or eliminating flaky tests.",
    order: 3,
  },
  {
    id: "psychological-safety",
    title: "The Fourth Ideal: Psychological Safety",
    description:
      "Create environments where people feel safe to take risks, experiment, ask questions, and admit mistakes. Blameless post-mortems, constructive code reviews, and celebrating learning from failures build trust and enable innovation. When teams fear failure, they optimize for safety over impact, leading to stagnation and mediocrity.",
    application:
      "In technical leadership, I foster cultures where experimentation is encouraged and failure is treated as learning. Code reviews focus on shared understanding rather than gatekeeping. I advocate for testing in production with feature flags and observability rather than trying to achieve perfect code through excessive process. AI-assisted development lowers the risk of trying new approaches—if Claude Code suggests a refactoring, I can quickly validate it with tests. I encourage pair programming and knowledge sharing, recognizing that collective learning outweighs individual heroics. When incidents occur, we focus on systemic improvements, not blame. This safety enables bold architectural decisions and rapid iteration.",
    order: 4,
  },
  {
    id: "customer-focus",
    title: "The Fifth Ideal: Customer Focus",
    description:
      "Distinguish between core competencies that differentiate the product and contextual work that must be done but doesn't add competitive value. Focus engineering effort on solving real customer problems, not building technology for technology's sake. Ruthlessly prioritize work that delivers measurable customer value over internal preferences or technical perfection.",
    application:
      "I constantly ask: does this work directly improve the customer experience, or is it undifferentiated heavy lifting? This lens guides build-versus-buy decisions—I choose Vercel for deployment and Neon for PostgreSQL because managing infrastructure is context, not core competency. I use shadcn/ui components rather than building custom design systems from scratch. AI-assisted development amplifies this focus: Claude Code handles boilerplate and mechanical refactoring, freeing me to spend more time on user-facing features and business logic. I prioritize shipping working software over technical purity, using TypeScript and automated testing to maintain quality without over-engineering. Customer feedback loops—analytics, monitoring, user research—drive what gets built next, not internal technical roadmaps.",
    order: 5,
  },
];

// Five Focusing Steps from Theory of Constraints (The Goal)
const goalPrinciples: Principle[] = [
  {
    id: "identify-constraint",
    title: "Step 1: Identify the Constraint",
    description:
      "Find the bottleneck that limits your entire system's throughput. In any complex system, there is exactly one constraint at any given time—everything else has spare capacity. The constraint determines the maximum flow of work through your system, whether it's code review queues, deployment pipelines, database write capacity, or team communication overhead.",
    application:
      "I use metrics and observability to identify real constraints, not perceived ones. At Hugo Health, I discovered our constraint wasn't code quality or test coverage—it was deployment frequency. We had excellent code sitting in queues waiting days to reach production. By measuring cycle time from commit to production deployment across all services, the bottleneck became obvious: our manual deployment approval process was throttling the entire delivery pipeline to once-weekly releases.",
    order: 1,
  },
  {
    id: "exploit-constraint",
    title: "Step 2: Exploit the Constraint",
    description:
      "Maximize the efficiency of the bottleneck before making any other changes. Get every possible bit of value from the constraint as it exists today. This means eliminating waste, ensuring the constraint is never idle, and optimizing everything immediately surrounding it. Don't spend resources on other parts of the system yet—they already have spare capacity.",
    application:
      "Once we identified deployments as the constraint, we exploited it by running deployments continuously during available windows, reducing batch sizes to deploy smaller changes more frequently, and automating everything around the deployment process. We implemented automated canary deployments with instant rollback capabilities, comprehensive automated testing to reduce deployment risk, and real-time health monitoring to catch issues immediately. This reduced deployment anxiety and increased our deployment frequency from weekly to daily without changing infrastructure.",
    order: 2,
  },
  {
    id: "subordinate-everything",
    title: "Step 3: Subordinate Everything Else",
    description:
      "Align all other processes and activities to support the constraint. This is the hardest step because it requires discipline—don't optimize non-constraint areas even when it's tempting. WIP (Work in Progress) limits prevent overwhelming the constraint. The entire system's rhythm should match the constraint's capacity, not exceed it, because excess work just creates queues and delays.",
    application:
      "We implemented WIP limits across our development process to prevent overwhelming the deployment pipeline. Rather than optimizing code review speed (which wasn't our bottleneck), we focused all improvement efforts on making deployments safer and faster. We added comprehensive automated testing specifically to enable safer deployments, not because testing was a problem. We limited how many features could be 'done' but not deployed, preventing the pile-up of completed work waiting in deployment queues. This felt counterintuitive—slowing down development to match deployment capacity—but it dramatically improved overall flow and reduced cycle time from idea to production.",
    order: 3,
  },
  {
    id: "elevate-constraint",
    title: "Step 4: Elevate the Constraint",
    description:
      "Make fundamental improvements to increase the constraint's capacity. This might mean adding resources, changing architecture, or implementing new capabilities. Only do this after exploiting and subordinating—premature optimization here wastes effort. When you elevate the constraint successfully, it stops being the bottleneck, and a different part of your system becomes the new constraint.",
    application:
      "After exploiting our deployment process, we elevated it by implementing feature flags and progressive rollouts. This architectural change separated code deployment from feature release, allowing us to deploy continuously to production while controlling feature visibility independently. We could deploy 10 times per day with zero user impact, then gradually enable features for specific user segments. Deployments stopped being a constraint entirely—we could push code to production anytime without coordination overhead. This fundamentally changed our development velocity and risk profile.",
    order: 4,
  },
  {
    id: "repeat-process",
    title: "Step 5: Repeat the Process",
    description:
      "When you successfully elevate a constraint, it moves somewhere else in the system—find it and start over. This is continuous improvement in action. The constraint is like water finding the lowest point—address one bottleneck and the next limiting factor emerges. Measure constantly to identify where the new constraint has surfaced, because your system has changed and old assumptions no longer apply.",
    application:
      "Once deployments were no longer our constraint, the bottleneck shifted to onboarding time for new engineers. New team members took 3-4 weeks to make their first production contribution because they struggled with local environment setup, understanding our service architecture, and navigating tribal knowledge. We're now applying the Five Focusing Steps to this new constraint: measuring onboarding metrics, standardizing development environment setup with Docker, creating comprehensive architecture documentation, and implementing mentorship programs. As we improve onboarding, the constraint will move again—perhaps to code review throughput or database query performance—and we'll identify and optimize that next bottleneck. This cycle never ends, which is exactly the point.",
    order: 5,
  },
];

export const principleGroups: PrincipleGroup[] = [
  {
    id: "phoenix",
    title: "The Three Ways",
    subtitle: "From The Phoenix Project",
    description:
      "The Three Ways are the foundational principles of DevOps that transformed how software organizations deliver value. These principles emphasize optimizing the entire system, creating fast feedback loops, and fostering continuous experimentation and learning. They've profoundly influenced how I approach full-stack engineering, from infrastructure and CI/CD to application development and team culture.",
    source: "The Phoenix Project by Gene Kim, Kevin Behr, and George Spafford",
    principles: phoenixPrinciples,
  },
  {
    id: "unicorn",
    title: "The Five Ideals",
    subtitle: "From The Unicorn Project",
    description:
      "The Five Ideals shift the focus from operations to developer experience and productivity. While The Phoenix Project emphasized flow through the entire value stream, The Unicorn Project zeroes in on what enables developers to do their best work: locality and simplicity in systems, focus and joy in daily work, continuous improvement of tooling and processes, psychological safety to experiment, and relentless focus on customer value. These ideals guide my approach to tooling choices, architecture decisions, and team culture.",
    source: "The Unicorn Project by Gene Kim",
    principles: unicornPrinciples,
  },
  {
    id: "goal",
    title: "Five Focusing Steps",
    subtitle: "From Theory of Constraints",
    description:
      "Theory of Constraints teaches that every system has exactly one bottleneck limiting overall throughput. Rather than optimizing every part of the system, focus relentlessly on identifying and improving the constraint—because improvements anywhere else are illusions. The Five Focusing Steps provide a systematic method for continuous improvement: identify the constraint, exploit it, subordinate everything else to it, elevate it, and repeat. This framework transformed manufacturing and applies brilliantly to software delivery, where constraints might be deployment pipelines, code review queues, or team communication overhead. By measuring flow and optimizing constraints rather than local efficiencies, teams deliver more value with less waste.",
    source: "The Goal by Eliyahu M. Goldratt",
    principles: goalPrinciples,
  },
];

// Helper functions to retrieve principles data
export const getPrincipleGroupById = (
  id: string,
): PrincipleGroup | undefined => {
  return principleGroups.find((group) => group.id === id);
};

export const getAllPrinciples = (): Principle[] => {
  return principleGroups.flatMap((group) => group.principles);
};

export const getPrinciplesByGroup = (groupId: string): Principle[] => {
  const group = getPrincipleGroupById(groupId);
  return group ? group.principles : [];
};
