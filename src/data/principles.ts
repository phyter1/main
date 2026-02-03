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
      "[Placeholder: Core concept of flow from left to right, optimizing for global goals]",
    application:
      "[Placeholder: Personal application in software delivery and system optimization]",
    order: 1,
  },
  {
    id: "second-way",
    title: "The Second Way: Amplify Feedback Loops",
    description:
      "[Placeholder: Creating right-to-left feedback loops for continuous improvement]",
    application:
      "[Placeholder: Personal application in monitoring, testing, and iterative development]",
    order: 2,
  },
  {
    id: "third-way",
    title: "The Third Way: Culture of Experimentation",
    description:
      "[Placeholder: Continual experimentation, learning from failure, practice and repetition]",
    application:
      "[Placeholder: Personal application in innovation, risk-taking, and growth mindset]",
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
      "[Placeholder: Introduction to The Three Ways and their significance in DevOps]",
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
