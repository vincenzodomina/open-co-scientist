import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

interface Config {
  apiKeys: {
    [key: string]: string;
  };
}

export const config: Config = {
  // API keys for API tool use
  apiKeys: {
    "PERPLEXITY_API_KEY": process.env.PERPLEXITY_API_KEY || "",
  },
};
