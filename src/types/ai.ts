export interface AIProvider {
  id: string;
  name: string;
  icon?: string;
  url: string; // URL template, use {query} as placeholder
  appUrl?: string; // Optional app URL scheme
  description?: string;
}

export interface AIConfig {
  providers: AIProvider[];
  defaultProviderId?: string;
}
