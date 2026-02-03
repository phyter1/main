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
      "[Placeholder: Work should be performed locally, with simple and minimal coupling]",
    application:
      "[Placeholder: Personal application in architecture decisions and developer experience]",
    order: 1,
  },
  {
    id: "focus-flow-joy",
    title: "The Second Ideal: Focus, Flow, and Joy",
    description:
      "[Placeholder: Remove friction and distractions to enable deep work and productivity]",
    application:
      "[Placeholder: Personal application in tooling choices like Bun, Biome, and TypeScript]",
    order: 2,
  },
  {
    id: "improvement-daily-work",
    title: "The Third Ideal: Improvement of Daily Work",
    description:
      "[Placeholder: Prioritizing improvement of work over the work itself]",
    application:
      "[Placeholder: Personal application in automation, refactoring, and technical debt]",
    order: 3,
  },
  {
    id: "psychological-safety",
    title: "The Fourth Ideal: Psychological Safety",
    description:
      "[Placeholder: Creating environments where people feel safe to experiment and fail]",
    application:
      "[Placeholder: Personal application in team culture and collaborative development]",
    order: 4,
  },
  {
    id: "customer-focus",
    title: "The Fifth Ideal: Customer Focus",
    description:
      "[Placeholder: Solving problems for the customer, not just completing features]",
    application:
      "[Placeholder: Personal application in user-first development and value delivery]",
    order: 5,
  },
];

// Five Focusing Steps from Theory of Constraints (The Goal)
const goalPrinciples: Principle[] = [
  {
    id: "identify-constraint",
    title: "Step 1: Identify the Constraint",
    description:
      "[Placeholder: Find the bottleneck limiting system throughput]",
    application:
      "[Placeholder: Personal application in identifying development and deployment bottlenecks]",
    order: 1,
  },
  {
    id: "exploit-constraint",
    title: "Step 2: Exploit the Constraint",
    description:
      "[Placeholder: Get the most out of the constraint before making changes]",
    application:
      "[Placeholder: Personal application in optimizing existing processes and tooling]",
    order: 2,
  },
  {
    id: "subordinate-everything",
    title: "Step 3: Subordinate Everything Else",
    description:
      "[Placeholder: Align all other processes to support the constraint]",
    application:
      "[Placeholder: Personal application in WIP limits and flow-based development]",
    order: 3,
  },
  {
    id: "elevate-constraint",
    title: "Step 4: Elevate the Constraint",
    description: "[Placeholder: Make changes to break through the constraint]",
    application:
      "[Placeholder: Personal application in addressing systemic improvement opportunities]",
    order: 4,
  },
  {
    id: "repeat-process",
    title: "Step 5: Repeat the Process",
    description:
      "[Placeholder: Continuous improvement - identify the next constraint]",
    application:
      "[Placeholder: Personal application in iterative optimization and systems thinking]",
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
      "[Placeholder: Introduction to The Five Ideals and their focus on developer productivity]",
    source: "The Unicorn Project by Gene Kim",
    principles: unicornPrinciples,
  },
  {
    id: "goal",
    title: "Five Focusing Steps",
    subtitle: "From Theory of Constraints",
    description:
      "[Placeholder: Introduction to Theory of Constraints and continuous improvement]",
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
