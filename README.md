# 🔬 Open Co Scientist

<div align="center">
  
  ![Open Co Scientist Logo](./docs/co-scientist-architecture.jpg)
  
  *An open-source implementation of an AI-powered scientific research assistant*
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
  [![Mastra.ai](https://img.shields.io/badge/Framework-Mastra.ai-purple.svg)](https://mastra.ai/)
  [![Vercel AI SDK](https://img.shields.io/badge/Vercel-AI_SDK-black.svg)](https://sdk.vercel.ai/)
  [![GitHub stars](https://img.shields.io/github/stars/vincenzodomina/open-co-scientist?style=social)](https://github.com/vincenzodomina/open-co-scientist/stargazers)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)
  
</div>

## 🧠 Vision

**Open Co Scientist** aims to democratize scientific research by providing an open-source implementation of an AI co-scientist system. Inspired by recent advances in large language models and multi-agent frameworks, our goal is to create a powerful tool that augments human scientists by helping generate hypotheses, explore scientific literature, and design experiments.

This project is an open-source recreation of the concepts described in Google's "Towards an AI co-scientist" paper, adapting its powerful multi-agent architecture for public use using modern TypeScript, the Mastra.ai agent framework, and the Vercel AI SDK.

## 🌟 Features

Open Co Scientist employs a "generate, debate, evolve" approach through a coordinated system of specialized AI agents:

### 🤖 Multi-Agent Architecture

- **Supervisor Agent**: Orchestrates the entire research process, manages resource allocation, and coordinates specialized agents
- **Generation Agent**: Creates initial hypotheses aligned with research goals by exploring literature and synthesizing existing findings
- **Reflection Agent**: Critically evaluates hypotheses for correctness, quality, and novelty using multi-stage review processes
- **Ranking Agent**: Employs an Elo-based tournament system with pairwise comparisons to assess and prioritize hypotheses
- **Proximity Agent**: Creates proximity graphs to cluster similar ideas, enabling efficient exploration of the hypothesis space
- **Evolution Agent**: Continuously refines promising hypotheses through various improvement strategies
- **Meta-Review Agent**: Synthesizes insights across reviews to optimize agent performance and summarize findings

### 🔄 Research Workflow

1. Scientists provide research goals in natural language
2. The system analyzes and configures a tailored research plan
3. Specialized agents generate, evaluate, rank, and refine hypotheses
4. Scientists receive comprehensive research overviews with testable hypotheses

### 🛠️ Key Capabilities

- Literature exploration and knowledge synthesis
- Hypothesis generation and refinement
- Scientific debate simulation
- Automated peer review processes
- Collaborative human-AI research

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v10 or higher)
- OpenAI API key

```bash
# Clone the repository
git clone https://github.com/vincenzodomina/open-co-scientist.git
cd open-co-scientist

# Install dependencies
npm install

# Run the development server
npm run dev
```

## 📚 Usage

- Open the Mastra AI Playground
- Chat with the co-scientist agent or kick of the research workflow
- Type in your research goal and let the co-scientist generate

## 🧩 Architecture

Open Co Scientist follows a multi-agent architecture where specialized agents work together in a coordinated workflow:

```
┌─────────────────┐
│                 │
│    Scientist    │
│                 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│                 │
│    Supervisor   │
│      Agent      │
│                 │
└────────┬────────┘
         │
         ▼
┌────────┴────────┐
│  Worker Process │
│     Queue       │
└┬───────┬───────┬┘
 │       │       │
 ▼       ▼       ▼
┌─────┐ ┌─────┐ ┌─────┐
│Gen. │ │Refl.│ │Rank.│
│Agent│ │Agent│ │Agent│
└──┬──┘ └──┬──┘ └──┬──┘
   │       │       │
   ▼       ▼       ▼
┌─────┐ ┌─────┐ ┌─────┐
│Prox.│ │Evol.│ │Meta │
│Agent│ │Agent│ │Agent│
└─────┘ └─────┘ └─────┘
```

## 🤝 Contributing

We welcome contributions from researchers, developers, and enthusiasts! Whether you're interested in improving the core architecture, enhancing agent capabilities, or adding new features, your input is valuable.

See our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started.

## 💻 Tech Stack

- **TypeScript**: Because we had enough of Python
- **Mastra.ai Agent Framework**: Awesome foundation for our multi-agent architecture
- **Vercel AI SDK**: Takes care of the integration with various LLM providers
- **React & Next.js**: Powers the web interface for the Mastra AI Playground

### Areas Seeking Contribution

- **Agent Implementation**: Develop and improve specialized agents using the Mastra.ai framework
- **Literature Search**: Integrate with open academic databases and APIs
- **Knowledge Graphs**: Build tools for representing scientific knowledge
- **Evaluation**: Create TypeScript benchmarks for hypothesis quality assessment
- **User Interface**: Enhance the React frontend for intuitive scientist interaction
- **Documentation**: Improve guides, tutorials, and TypeScript examples
- **API Integration**: Add support for additional LLM providers through Vercel AI SDK

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

This project draws inspiration from Google's "Towards an AI co-scientist" paper. We aim to recreate and extend these capabilities in an open-source framework, making AI-assisted scientific discovery accessible to everyone.

## 📞 Contact

- GitHub Issues: [https://github.com/vincenzodomina/open-co-scientist/issues](https://github.com/vincenzodomina/open-co-scientist/issues)

---

<div align="center">
  <p>Accelerating scientific discovery through collaborative AI</p>
</div>